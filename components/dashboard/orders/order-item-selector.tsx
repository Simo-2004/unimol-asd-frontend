"use client";

import * as React from "react";
import { Search, Plus, Minus, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Product, Category } from "@/lib/api-client";

export interface OrderItemInput {
  product: number;
  product_name: string;
  price: string;
  quantity: number;
}

interface OrderItemSelectorProps {
  products: Product[];
  categories: Category[];
  selectedItems: OrderItemInput[];
  onItemsChange: (items: OrderItemInput[]) => void;
}

/**
 * OrderItemSelector - Componente per selezionare prodotti multipli
 *
 * Features:
 * - Filtro per categoria
 * - Search bar per nome prodotto
 * - Aggiungi prodotto con quantità
 * - Lista prodotti selezionati con controlli +/-
 * - Rimozione prodotto
 * - Calcolo subtotale per item
 *
 * @param products - Array prodotti disponibili
 * @param categories - Array categorie per filtro
 * @param selectedItems - Array prodotti selezionati
 * @param onItemsChange - Callback quando cambiano gli items
 */
export function OrderItemSelector({
  products,
  categories,
  selectedItems,
  onItemsChange,
}: OrderItemSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Filtra prodotti per categoria e search
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Trova la categoria selezionata per ottenere il suo nome
      const selectedCategoryObj = categories.find(
        (cat) => cat.id.toString() === selectedCategory,
      );

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategoryObj &&
          product.category_name === selectedCategoryObj.name);

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch && product.is_active;
    });
  }, [products, categories, selectedCategory, searchQuery]);

  // Aggiungi prodotto alla lista
  const handleAddProduct = (product: Product) => {
    const existingItem = selectedItems.find(
      (item) => item.product === product.id,
    );

    if (existingItem) {
      // Se già esiste, aumenta quantità
      handleUpdateQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Altrimenti aggiungi nuovo
      const newItem: OrderItemInput = {
        product: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
      };
      onItemsChange([...selectedItems, newItem]);
    }
  };

  // Aggiorna quantità
  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    const updatedItems = selectedItems.map((item) =>
      item.product === productId ? { ...item, quantity: newQuantity } : item,
    );
    onItemsChange(updatedItems);
  };

  // Rimuovi prodotto
  const handleRemoveProduct = (productId: number) => {
    const updatedItems = selectedItems.filter(
      (item) => item.product !== productId,
    );
    onItemsChange(updatedItems);
  };

  // Calcola subtotale per item
  const calculateSubtotal = (item: OrderItemInput) => {
    return (parseFloat(item.price) * item.quantity).toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="space-y-3">
        {/* Filtro Categoria - Full Width */}
        <div className="space-y-2">
          <Label htmlFor="category-filter">Categoria</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-full">
              <SelectValue placeholder="Tutte le categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <Label htmlFor="product-search">Cerca Prodotto</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="product-search"
              placeholder="Cerca per nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista Prodotti Disponibili */}
      <div className="space-y-2">
        <Label>Prodotti Disponibili ({filteredProducts.length})</Label>
        <ScrollArea className="h-[200px] rounded-md border p-3">
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun prodotto trovato
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">
                        {product.category_name}
                      </Badge>
                      <span className="text-xs font-semibold text-primary">
                        €{parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    disabled={!product.is_active}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Lista Prodotti Selezionati */}
      <div className="space-y-2">
        <Label>
          Prodotti Selezionati ({selectedItems.length})
          {selectedItems.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 h-auto py-0 text-xs text-destructive hover:text-destructive"
              onClick={() => onItemsChange([])}
            >
              Rimuovi tutti
            </Button>
          )}
        </Label>

        {selectedItems.length === 0 ? (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <p className="text-sm text-muted-foreground">
              Nessun prodotto selezionato
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aggiungi prodotti dalla lista sopra
            </p>
          </div>
        ) : (
          <div className="space-y-2 border rounded-lg p-3">
            {selectedItems.map((item) => (
              <div
                key={item.product}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    €{parseFloat(item.price).toFixed(2)} × {item.quantity} ={" "}
                    <span className="font-semibold text-primary">
                      €{calculateSubtotal(item)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Controlli quantità */}
                  <div className="flex items-center gap-1 border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        handleUpdateQuantity(item.product, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        handleUpdateQuantity(item.product, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Rimuovi */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveProduct(item.product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
