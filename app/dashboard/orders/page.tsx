"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { apiClient } from "@/lib/api-client";
import type { Order, OrderDetail } from "@/lib/api-client";

import { KanbanBoard } from "@/components/dashboard/orders/kanban-board";
import { OrderFormDialog } from "@/components/dashboard/orders/order-form-dialog";
import { OrderDetailsDialog } from "@/components/dashboard/orders/order-details-dialog";

/**
 * OrdersPage - Pagina gestione ordini con sistema Kanban
 *
 * Features:
 * - Kanban board con 6 colonne (PENDING → PAID)
 * - Drag & drop tra stati
 * - Creazione nuovi ordini con multi-product selection
 * - Visualizzazione dettagli ordini
 * - Refresh manuale
 * - Gestione errori
 */
export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Dialog states
  const [selectedOrder, setSelectedOrder] = React.useState<OrderDetail | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  // Carica ordini iniziali
  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      setOrders(response.results);
    } catch (error) {
      console.error("Errore caricamento ordini:", error);
      toast.error("Errore nel caricamento degli ordini");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
      toast.success("Ordini aggiornati!");
    } catch {
      toast.error("Errore nell'aggiornamento");
    } finally {
      setRefreshing(false);
    }
  };

  // Callback quando ordine creato
  const handleOrderCreated = async (newOrder: Order) => {
    // Ricarica l'ordine completo dal backend per avere tutti i dati aggiornati
    try {
      const fullOrder = await apiClient.getOrder(newOrder.id);

      // Converti OrderDetail in Order
      const completeOrder: Order = {
        id: fullOrder.id,
        table: fullOrder.table,
        table_number: fullOrder.table_number,
        status: fullOrder.status,
        total_amount: fullOrder.total_amount,
        items_count: fullOrder.items.length,
        created_at: fullOrder.created_at,
      };

      setOrders((prev) => [completeOrder, ...prev]);
    } catch (error) {
      console.error("Errore ricaricamento ordine:", error);
      // Fallback: usa l'ordine parziale ricevuto
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  // Callback quando ordine cancellato
  const handleOrderDeleted = async (orderId: number) => {
    try {
      // Chiama API per eliminare dal backend
      await apiClient.deleteOrder(orderId);

      // Rimuovi dalla UI
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      toast.success("Ordine eliminato con successo!");
    } catch (error) {
      console.error("Errore eliminazione ordine:", error);
      toast.error("Errore nell'eliminazione dell'ordine");
    }
  };

  // Callback quando stato ordine cambia
  const handleOrderStatusChanged = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
    );
  };

  // Apri dialog dettagli
  const handleShowDetails = async (orderId: number) => {
    try {
      const orderDetail = await apiClient.getOrder(orderId);
      setSelectedOrder(orderDetail);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Errore caricamento dettagli:", error);
      toast.error("Errore nel caricamento dei dettagli");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Caricamento ordini...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Gestione Ordini</CardTitle>
              <CardDescription>
                Sistema Kanban per la gestione degli ordini
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Aggiorna
              </Button>

              <OrderFormDialog onOrderCreated={handleOrderCreated} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info Box */}
      {orders.length === 0 && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">
              Nessun ordine presente. Crea il tuo primo ordine cliccando su
              &quot;Nuovo Ordine&quot;.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <KanbanBoard
        orders={orders}
        onOrderDeleted={handleOrderDeleted}
        onOrderStatusChanged={handleOrderStatusChanged}
        onShowDetails={handleShowDetails}
      />

      {/* Dialog Dettagli */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </motion.div>
  );
}
