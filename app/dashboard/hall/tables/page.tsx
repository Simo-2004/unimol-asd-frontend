"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, DoorOpen, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiClient, Table } from "@/lib/api-client";

export default function TablesPage() {
  const [tables, setTables] = React.useState<Table[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = React.useState<Table | null>(null);
  const [formData, setFormData] = React.useState({
    number: "",
    seats: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch tables
  const fetchTables = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTables();
      setTables(response.results.sort((a, b) => a.number - b.number));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.seats) return;

    try {
      setSubmitting(true);
      const tableNumber = parseInt(formData.number);
      const capacity = parseInt(formData.seats);

      const data = {
        number: tableNumber,
        table_number: tableNumber, // Alias per compatibilità
        capacity: capacity,
        seats: capacity, // Alias per compatibilità
        status: "AVAILABLE" as const,
        is_active: formData.is_active,
      };

      if (editingTable) {
        await apiClient.updateTable(editingTable.id, data);
      } else {
        await apiClient.createTable(data);
      }
      await fetchTables();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingTable) return;

    try {
      setSubmitting(true);
      await apiClient.deleteTable(deletingTable.id);
      await fetchTables();
      setDeleteDialogOpen(false);
      setDeletingTable(null);
    } catch (error) {
      console.error("Error deleting table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number.toString(),
        seats: table.seats.toString(),
        is_active: table.is_active,
      });
    } else {
      setEditingTable(null);
      setFormData({
        number: "",
        seats: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTable(null);
    setFormData({
      number: "",
      seats: "",
      is_active: true,
    });
  };

  const handleOpenDeleteDialog = (table: Table) => {
    setDeletingTable(table);
    setDeleteDialogOpen(true);
  };

  const activeTables = tables.filter((t) => t.is_active).length;
  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tavoli</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i tavoli del ristorante
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Tavolo
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tavoli Totali
              </CardTitle>
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tavoli Attivi
              </CardTitle>
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTables}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Posti Totali
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSeats}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tables Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Lista Tavoli</CardTitle>
            <CardDescription>
              Visualizzazione e gestione dei tavoli
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Caricamento...</div>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DoorOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nessun tavolo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Inizia creando il tuo primo tavolo
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {tables.map((table, index) => (
                    <motion.div
                      key={table.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="relative overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">
                                Tavolo {table.number}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" />
                                {table.seats} posti
                              </CardDescription>
                            </div>
                            {table.is_active ? (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                Attivo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inattivo</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(table)}
                            className="flex-1"
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(table)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? "Modifica Tavolo" : "Nuovo Tavolo"}
              </DialogTitle>
              <DialogDescription>
                {editingTable
                  ? "Modifica i dettagli del tavolo"
                  : "Crea un nuovo tavolo per il ristorante"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Numero Tavolo</Label>
                  <Input
                    id="number"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Posti</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    placeholder="4"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is-active">Stato</Label>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                >
                  <SelectTrigger id="is-active">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="inactive">Inattivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Salvataggio..."
                  : editingTable
                    ? "Salva"
                    : "Crea"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il Tavolo {deletingTable?.number}?
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Eliminazione..." : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
