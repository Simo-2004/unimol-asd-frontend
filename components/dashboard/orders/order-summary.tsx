"use client";

import * as React from "react";
import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { OrderItemInput } from "./order-item-selector";

interface OrderSummaryProps {
  items: OrderItemInput[];
}

/**
 * OrderSummary - Componente riepilogo ordine
 *
 * Features:
 * - Lista items con quantità e subtotale
 * - Calcolo totale automatico
 * - Design pulito e leggibile
 *
 * @param items - Array prodotti selezionati
 */
export function OrderSummary({ items }: OrderSummaryProps) {
  // Calcola totale ordine
  const total = React.useMemo(() => {
    return items
      .reduce((sum, item) => {
        return sum + parseFloat(item.price) * item.quantity;
      }, 0)
      .toFixed(2);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Riepilogo Ordine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Lista Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const subtotal = (parseFloat(item.price) * item.quantity).toFixed(
              2
            );
            return (
              <div key={item.product} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="font-medium">€{subtotal}</span>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Totale */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-semibold">Totale</span>
          <span className="text-2xl font-bold text-primary">€{total}</span>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Il totale verrà calcolato automaticamente dal backend
        </p>
      </CardContent>
    </Card>
  );
}
