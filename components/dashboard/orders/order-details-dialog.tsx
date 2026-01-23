"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { OrderDetail, OrderItem } from "@/lib/api-client";

interface OrderDetailsDialogProps {
  order: OrderDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Configurazione badge status (sync con kanban-card)
const statusConfig = {
  PENDING: { label: "Da Fare", className: "bg-blue-500" },
  PREPARING: { label: "In Cucina", className: "bg-orange-500" },
  READY: { label: "Pronto", className: "bg-green-500" },
  COMPLETED: { label: "Completato", className: "bg-gray-600" },
} as const;

/**
 * OrderDetailsDialog - Dialog dettagli ordine completo
 *
 * Features:
 * - Visualizza info ordine (tavolo, stato, data)
 * - Lista items con quantità, note, subtotale
 * - Totale ordine
 * - Design scrollabile per molti items
 *
 * @param order - Ordine completo con items
 * @param open - Stato apertura dialog
 * @param onOpenChange - Callback cambio stato
 */
export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  if (!order) {
    return null;
  }

  const statusInfo = statusConfig[order.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ordine #{order.id}
            </DialogTitle>
            <DialogDescription>
              Dettagli completi dell&apos;ordine
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Info Ordine */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tavolo</p>
                <p className="text-lg font-semibold">
                  Tavolo {order.table_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Stato</p>
                <Badge className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Creato il</p>
                <p className="text-sm font-medium">
                  {format(new Date(order.created_at), "PPp", { locale: it })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Aggiornato il</p>
                <p className="text-sm font-medium">
                  {format(new Date(order.updated_at), "PPp", { locale: it })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Lista Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Prodotti ({order.items.length})</h3>

              <div className="space-y-3">
                {order.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start border rounded-lg p-3 bg-muted/30"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.quantity}x
                        </Badge>
                        <p className="font-medium">{item.product_name}</p>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {item.notes}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        €{item.price_at_order} × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">€{item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totale */}
            <div className="flex justify-between items-center py-4 bg-primary/5 rounded-lg px-4">
              <span className="text-xl font-semibold">Totale Ordine</span>
              <span className="text-3xl font-bold text-primary">
                €{order.total_amount}
              </span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
