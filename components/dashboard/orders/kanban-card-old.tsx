"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Eye, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Order } from "@/lib/api-client";

interface KanbanCardProps {
  order: Order;
  onShowDetails: (orderId: number) => void;
  onDelete: (orderId: number) => void;
}

/**
 * KanbanCard - Card singolo ordine draggable
 *
 * Features:
 * - Drag & drop con @dnd-kit/sortable
 * - Animazioni smooth con framer-motion
 * - Mostra: numero ordine, tavolo, items count, totale
 * - Azioni: visualizza dettagli, elimina
 *
 * @param order - Ordine da visualizzare
 * @param onShowDetails - Callback per aprire dialog dettagli
 * @param onDelete - Callback per eliminare ordine
 */
export function KanbanCard({
  order,
  onShowDetails,
  onDelete,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: {
      type: "order",
      order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              {/* Handle per drag */}
              <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <h3 className="font-semibold text-sm">Ordine #{order.id}</h3>
                <p className="text-xs text-muted-foreground">
                  Tavolo {order.table_number || order.table}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowDetails(order.id);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualizza dettagli</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(order.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Elimina ordine</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {order.items_count || 0} prodotti
                </Badge>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold">
                  €{parseFloat(order.total_amount || "0").toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
