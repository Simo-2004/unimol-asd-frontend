"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Clock, ChefHat, CheckCircle2, Check } from "lucide-react";

import { Order, apiClient } from "@/lib/api-client";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";

// Configurazione colonne Kanban (4 stati semplificati)
const KANBAN_COLUMNS = [
  {
    id: "PENDING",
    title: "📝 Da Fare",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "PREPARING",
    title: "👨‍🍳 In Cucina",
    icon: <ChefHat className="h-4 w-4 text-orange-500" />,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    id: "READY",
    title: "✅ Pronti",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  {
    id: "COMPLETED",
    title: "🎉 Completati",
    icon: <Check className="h-4 w-4 text-gray-500" />,
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
] as const;

type KanbanStatus = (typeof KANBAN_COLUMNS)[number]["id"];

interface KanbanBoardProps {
  orders: Order[];
  onOrderStatusChanged: (updatedOrder: Order) => void;
  onShowDetails: (orderId: number) => void;
  onOrderDeleted: (orderId: number) => void;
}

/**
 * KanbanBoard - Board principale per gestione ordini
 *
 * Features:
 * - Drag & drop libero tra tutte le colonne
 * - 6 stati: PENDING, PREPARING, COOKING, READY, DELIVERED, PAID
 * - Aggiornamento ottimistico (UI aggiornata subito)
 * - Gestione errori con rollback
 * - Animazioni smooth
 *
 * Architecture:
 * - DndContext: gestisce il drag & drop globale
 * - Sensors: configurazione sensibilità drag
 * - handleDragStart: salva ordine draggato
 * - handleDragOver: aggiornamento real-time durante drag
 * - handleDragEnd: conferma cambio status e API call
 *
 * @param orders - Array di tutti gli ordini
 * @param onOrderStatusChanged - Callback quando stato cambia
 * @param onShowDetails - Callback per aprire dettagli
 * @param onOrderDeleted - Callback per eliminare ordine
 */
export function KanbanBoard({
  orders,
  onOrderStatusChanged,
  onShowDetails,
  onOrderDeleted,
}: KanbanBoardProps) {
  const [activeOrder, setActiveOrder] = React.useState<Order | null>(null);
  const [localOrders, setLocalOrders] = React.useState<Order[]>(orders);

  // Aggiorna ordini locali quando cambia la prop
  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Configura sensori per drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimo movimento per attivare drag
      },
    }),
  );

  // Raggruppa ordini per status
  const ordersByStatus = React.useMemo(() => {
    const grouped: Record<KanbanStatus, Order[]> = {
      PENDING: [],
      PREPARING: [],
      READY: [],
      COMPLETED: [],
    };

    localOrders.forEach((order) => {
      const status = order.status as KanbanStatus;
      if (grouped[status]) {
        grouped[status].push(order);
      }
    });

    return grouped;
  }, [localOrders]);

  // Inizio drag
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const order = localOrders.find((o) => o.id === active.id);
    if (order) {
      setActiveOrder(order);
    }
  };

  // Durante il drag (hover su colonna)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;

    // Se droppiamo su una colonna diversa
    if (
      active.data.current?.type === "order" &&
      over.data.current?.type === "column"
    ) {
      const newStatus = over.data.current.status as KanbanStatus;
      const orderIndex = localOrders.findIndex((o) => o.id === activeId);

      if (orderIndex !== -1 && localOrders[orderIndex].status !== newStatus) {
        // Aggiornamento ottimistico locale (UI reattiva)
        const updatedOrders = [...localOrders];
        updatedOrders[orderIndex] = {
          ...updatedOrders[orderIndex],
          status: newStatus,
        };
        setLocalOrders(updatedOrders);
      }
    }
  };

  // Fine drag (conferma cambio)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveOrder(null);

    if (!over) return;

    const activeId = active.id as number;
    const orderIndex = localOrders.findIndex((o) => o.id === activeId);

    if (orderIndex === -1) return;

    const order = localOrders[orderIndex];
    const newStatus = order.status as KanbanStatus;

    // Se lo status è cambiato, chiama API
    const originalOrder = orders.find((o) => o.id === activeId);
    if (originalOrder && originalOrder.status !== newStatus) {
      try {
        // Chiama API per aggiornare status
        const updatedOrderDetail = await apiClient.updateOrderStatus(
          activeId,
          newStatus,
        );

        // Converti OrderDetail in Order per il callback
        const updatedOrder: Order = {
          id: updatedOrderDetail.id,
          table: updatedOrderDetail.table,
          table_number: updatedOrderDetail.table_number,
          status: updatedOrderDetail.status,
          total_amount: updatedOrderDetail.total_amount,
          items_count: updatedOrderDetail.items.length,
          created_at: updatedOrderDetail.created_at,
        };

        // Notifica parent component
        onOrderStatusChanged(updatedOrder);
      } catch (error) {
        console.error("Errore cambio status:", error);
        toast.error("Errore nell'aggiornamento dello stato");
        // Rollback: ripristina ordini originali
        setLocalOrders(orders);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            orders={ordersByStatus[column.id]}
            color={column.color}
            onShowDetails={onShowDetails}
            onDelete={onOrderDeleted}
          />
        ))}
      </div>

      {/* Overlay per drag (card che segue il cursore) */}
      <DragOverlay>
        {activeOrder && (
          <div className="rotate-3 opacity-90">
            <KanbanCard
              order={activeOrder}
              onShowDetails={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
