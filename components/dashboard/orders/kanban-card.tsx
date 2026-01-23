"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Eye, Trash2, ShoppingBag, Clock } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Order } from "@/lib/api-client";

// Configurazione status con colori moderni
const statusConfig = {
  PENDING: {
    label: "Da Fare",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  PREPARING: {
    label: "In Cucina",
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
  },
  READY: {
    label: "Pronto",
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
  },
  COMPLETED: {
    label: "Completato",
    gradient: "from-gray-500 to-gray-600",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  },
} as const;

interface KanbanCardProps {
  order: Order;
  onShowDetails: (orderId: number) => void;
  onDelete: (orderId: number) => void;
}

/**
 * KanbanCard - Card ordine ultra-migliorata
 */
export function KanbanCard({
  order,
  onShowDetails,
  onDelete,
}: KanbanCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

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
  };

  const config = statusConfig[order.status];

  const handleDeleteConfirm = () => {
    onDelete(order.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.2 }}
          className={isDragging ? "opacity-40" : ""}
          {...attributes}
          {...listeners}
        >
          <div
            className={`
          relative overflow-hidden rounded-xl border-2 ${config.border} ${config.bg}
          cursor-grab active:cursor-grabbing
          transition-all duration-200
          hover:shadow-xl
          group
        `}
          >
            {/* Barra colorata superiore */}
            <div className={`h-1.5 bg-linear-to-r ${config.gradient}`} />

            {/* Contenuto */}
            <div className="p-4 space-y-3">
              {/* Header: Numero ordine + Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      #{order.id}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Tavolo */}
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                      <span className="font-medium">
                        Tavolo {order.table_number || order.table}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowDetails(order.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Visualizza dettagli
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Elimina ordine</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Separatore */}
              <div className="border-t border-border/50" />

              {/* Info Bottom */}
              <div className="flex items-center justify-between gap-3">
                {/* Prodotti */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="font-medium">
                    {order.items_count || 0}{" "}
                    {order.items_count === 1 ? "prodotto" : "prodotti"}
                  </span>
                </div>

                {/* Totale */}
                <div className="text-right">
                  <p className="text-2xl font-bold bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    €{parseFloat(order.total_amount || "0").toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Timestamp piccolo */}
              {order.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  <span>
                    {(() => {
                      try {
                        const date = new Date(order.created_at);
                        if (isNaN(date.getTime())) {
                          return "Ora non valida";
                        }
                        return format(date, "HH:mm", { locale: it });
                      } catch {
                        return "Ora non valida";
                      }
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare l&apos;ordine #{order.id} del tavolo{" "}
              {order.table_number}?
              <br />
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={handleDeleteConfirm}
              autoFocus
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina ordine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
