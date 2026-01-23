"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar as CalendarIcon,
  Check,
  X,
  Pencil,
  Trash2,
  Phone,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { apiClient, Reservation, Table as TableType } from "@/lib/api-client";
import { ReservationFormDialog } from "@/components/dashboard/reservation-form-dialog";

export default function ReservationsPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [tables, setTables] = React.useState<TableType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editingReservation, setEditingReservation] =
    React.useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    React.useState<Reservation | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [reservationsResponse, tablesResponse] = await Promise.all([
        apiClient.getReservations(),
        apiClient.getTables(),
      ]);
      setReservations(reservationsResponse.results);
      setTables(tablesResponse.results.filter((t) => t.is_active));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter reservations
  const filteredReservations = React.useMemo(() => {
    if (filterStatus === "all") return reservations;
    return reservations.filter((r) => r.status === filterStatus);
  }, [reservations, filterStatus]);

  // Handle confirm
  const handleConfirm = async (reservation: Reservation) => {
    try {
      await apiClient.confirmReservation(reservation.id);
      toast.success("Prenotazione confermata", {
        description: `La prenotazione di ${reservation.customer_name} è stata confermata`,
      });
      await fetchData();
    } catch (error: unknown) {
      console.error("Error confirming reservation:", error);

      let errorMessage = "Impossibile confermare la prenotazione";
      if (error && typeof error === "object" && "message" in error) {
        const apiError = error as { message?: string };
        if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      toast.error("Errore", {
        description: errorMessage,
      });
    }
  };

  // Handle cancel
  const handleCancel = async (reservation: Reservation) => {
    try {
      await apiClient.cancelReservation(reservation.id);
      toast.success("Prenotazione annullata", {
        description: `La prenotazione di ${reservation.customer_name} è stata annullata`,
      });
      await fetchData();
    } catch (error: unknown) {
      console.error("Error cancelling reservation:", error);

      let errorMessage = "Impossibile annullare la prenotazione";
      if (error && typeof error === "object" && "message" in error) {
        const apiError = error as { message?: string };
        if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      toast.error("Errore", {
        description: errorMessage,
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingReservation) return;

    try {
      setSubmitting(true);
      await apiClient.deleteReservation(deletingReservation.id);
      toast.success("Prenotazione eliminata", {
        description: `La prenotazione di ${deletingReservation.customer_name} è stata eliminata`,
      });
      await fetchData();
      setDeleteDialogOpen(false);
      setDeletingReservation(null);
    } catch (error: unknown) {
      console.error("Error deleting reservation:", error);

      let errorMessage = "Impossibile eliminare la prenotazione";

      // Gestisci errori specifici
      if (error && typeof error === "object" && "message" in error) {
        const apiError = error as { message?: string; data?: unknown };
        if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      toast.error("Errore", {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (reservation?: Reservation) => {
    setEditingReservation(reservation || null);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (reservation: Reservation) => {
    setDeletingReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const statusColors = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusLabels = {
    PENDING: "In Attesa",
    CONFIRMED: "Confermata",
    CANCELLED: "Annullata",
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Prenotazioni</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci le prenotazioni dei tavoli
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Tutte
              </Button>
              <Button
                variant={filterStatus === "PENDING" ? "default" : "outline"}
                onClick={() => setFilterStatus("PENDING")}
                size="sm"
              >
                In Attesa
              </Button>
              <Button
                variant={filterStatus === "CONFIRMED" ? "default" : "outline"}
                onClick={() => setFilterStatus("CONFIRMED")}
                size="sm"
              >
                Confermate
              </Button>
              <Button
                variant={filterStatus === "CANCELLED" ? "default" : "outline"}
                onClick={() => setFilterStatus("CANCELLED")}
                size="sm"
              >
                Annullate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reservations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Lista Prenotazioni</CardTitle>
            <CardDescription>
              {filteredReservations.length}{" "}
              {filteredReservations.length === 1
                ? "prenotazione"
                : "prenotazioni"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Caricamento...</div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nessuna prenotazione</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterStatus !== "all"
                    ? "Nessuna prenotazione con questo stato"
                    : "Inizia creando una nuova prenotazione"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data e Ora</TableHead>
                    <TableHead>Persone</TableHead>
                    <TableHead>Tavolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredReservations.map((reservation, index) => (
                      <motion.tr
                        key={reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.customer_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {reservation.customer_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(reservation.date),
                            "dd MMM yyyy 'ore' HH:mm",
                            {
                              locale: it,
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {reservation.pax}
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.table_number ? (
                            <Badge variant="outline">
                              Tavolo {reservation.table_number}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Non assegnato
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[reservation.status]}
                          >
                            {statusLabels[reservation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reservation.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleConfirm(reservation)}
                                  title="Conferma"
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancel(reservation)}
                                  title="Annulla"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(reservation)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenDeleteDialog(reservation)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <ReservationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingReservation={editingReservation}
        tables={tables}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare la prenotazione di{" "}
              {deletingReservation?.customer_name}? Questa azione non può essere
              annullata.
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
