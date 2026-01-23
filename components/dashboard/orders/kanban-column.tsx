"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Order } from "@/lib/api-client";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  orders: Order[];
  color: string;
  onShowDetails: (orderId: number) => void;
  onDelete: (orderId: number) => void;
}

/**
 * KanbanColumn - Colonna singola del board Kanban
 *
 * Features:
 * - Drop zone per ricevere card draggabili
 * - Sort verticale con @dnd-kit/sortable
 * - Scroll area per molti ordini
 * - Badge con conteggio ordini
 * - Colore personalizzabile per status
 *
 * @param id - ID univoco colonna (= status)
 * @param title - Titolo colonna
 * @param icon - Icona status
 * @param orders - Array ordini in questa colonna
 * @param color - Classe Tailwind per colore badge
 * @param onViewDetails - Callback dettagli ordine
 * @param onDelete - Callback eliminazione ordine
 */
export function KanbanColumn({
  id,
  title,
  icon,
  orders,
  color,
  onShowDetails,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={`flex flex-col h-[calc(100vh-280px)] min-h-[500px] transition-all duration-200 ${
        isOver ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""
      }`}
    >
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className={`${color} font-bold`}>
            {orders.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full">
          <SortableContext
            items={orders.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <motion.div
              className="space-y-2.5 pr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center rounded-lg border-2 border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground">Nessun ordine</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Trascina qui gli ordini
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    onShowDetails={onShowDetails}
                    onDelete={onDelete}
                  />
                ))
              )}
            </motion.div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
