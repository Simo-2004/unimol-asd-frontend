"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiClient } from "@/lib/api-client";
import type { Table, Product, Category, Order } from "@/lib/api-client";

import { OrderItemSelector, type OrderItemInput } from "./order-item-selector";
import { OrderSummary } from "./order-summary";

interface OrderFormDialogProps {
  onOrderCreated?: (order: Order) => void;
}

/**
 * OrderFormDialog - Dialog completo per creazione ordini
 *
 * Features:
 * - Selezione tavolo (required)
 * - Nome cliente (optional)
 * - Selezione prodotti multipli con quantità
 * - Ricerca e filtro categorie
 * - Riepilogo con totale
 * - Validazione e gestione errori
 *
 * Architecture:
 * - Orchestrator principale del form
 * - Utilizza OrderItemSelector per prodotti
 * - Utilizza OrderSummary per riepilogo
 * - Gestisce submit e reset
 */
export function OrderFormDialog({ onOrderCreated }: OrderFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [tableId, setTableId] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<OrderItemInput[]>(
    [],
  );

  // Data fetching
  const [tables, setTables] = React.useState<Table[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Carica dati iniziali
  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [tablesData, productsData, categoriesData] = await Promise.all([
        apiClient.getTables(),
        apiClient.getProducts(),
        apiClient.getCategories(),
      ]);

      setTables(tablesData.results);
      setProducts(productsData.results);
      setCategories(categoriesData.results);
    } catch (error) {
      console.error("Errore caricamento dati:", error);
      toast.error("Errore nel caricamento dei dati");
    }
  };

  // Reset form
  const resetForm = () => {
    setTableId("");
    setCustomerName("");
    setSelectedItems([]);
  };

  // Validazione
  const isValid = React.useMemo(() => {
    return tableId !== "" && selectedItems.length > 0;
  }, [tableId, selectedItems]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);

    try {
      // Prepara payload per backend
      const payload = {
        table: parseInt(tableId, 10),
        customer_name: customerName || null,
        items: selectedItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          notes: null,
        })),
      };

      const newOrder = await apiClient.post<Order>("/orders/", payload);

      toast.success("Ordine creato con successo!");

      // Callback per aggiornare lista ordini
      onOrderCreated?.(newOrder);

      // Chiudi dialog e resetta form
      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Errore creazione ordine:", error);

      // Gestisci errori specifici del backend
      const apiError = error as {
        response?: { data?: Record<string, unknown> };
      };

      if (apiError.response?.data) {
        const errorData = apiError.response.data;

        if (errorData.table && Array.isArray(errorData.table)) {
          toast.error(`Errore tavolo: ${errorData.table[0]}`);
        } else if (errorData.items) {
          toast.error(`Errore prodotti: ${JSON.stringify(errorData.items)}`);
        } else {
          toast.error("Errore nella creazione dell'ordine");
        }
      } else {
        toast.error("Errore di connessione");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Ordine
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Ordine</DialogTitle>
          <DialogDescription>
            Seleziona il tavolo, aggiungi prodotti e crea un nuovo ordine.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto"
        >
          {/* Sezione Tavolo e Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tavolo (Required) */}
            <div className="space-y-2">
              <Label htmlFor="table">
                Tavolo <span className="text-destructive">*</span>
              </Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger id="table" className="w-full">
                  <SelectValue placeholder="Seleziona tavolo" />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter((table) => table.is_active)
                    .map((table) => (
                      <SelectItem key={table.id} value={table.id.toString()}>
                        Tavolo {table.table_number || table.number} (
                        {table.capacity || table.seats} posti)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome Cliente (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="customer">Nome Cliente (opzionale)</Label>
              <Input
                id="customer"
                placeholder="es. Mario Rossi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Selezione Prodotti */}
          <div className="space-y-2">
            <Label>
              Prodotti <span className="text-destructive">*</span>
            </Label>
            <OrderItemSelector
              products={products}
              categories={categories}
              selectedItems={selectedItems}
              onItemsChange={setSelectedItems}
            />
          </div>

          {/* Riepilogo Ordine */}
          <OrderSummary items={selectedItems} />

          {/* Footer */}
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? "Creazione in corso..." : "Crea Ordine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
