"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

import { apiClient, Reservation, Table as TableType } from "@/lib/api-client";
import {
  useReservationValidation,
  type ReservationFormData,
} from "@/lib/hooks/useReservationValidation";
import { format } from "date-fns";
import { toast } from "sonner";

// Import componenti atomici
import { PhoneInput } from "@/components/dashboard/phone-input";
import { DateTimeInput } from "@/components/dashboard/date-time-input";
import { PaxTableSelect } from "@/components/dashboard/pax-table-select";

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReservation: Reservation | null;
  tables: TableType[];
  onSuccess: () => void;
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  editingReservation,
  tables,
  onSuccess,
}: ReservationFormDialogProps) {
  const [formData, setFormData] = React.useState<ReservationFormData>({
    customer_name: "",
    country_code: "+39",
    phone_number: "",
    date: "",
    time: "",
    pax: "",
    table: undefined,
    status: "PENDING",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );

  const { validateForm } = useReservationValidation(tables);

  // Carica dati dal localStorage all'avvio
  React.useEffect(() => {
    const savedData = localStorage.getItem("reservationFormData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Salva dati nel localStorage quando cambiano (solo se non in modalità edit)
  React.useEffect(() => {
    if (!editingReservation && formData.customer_name) {
      localStorage.setItem("reservationFormData", JSON.stringify(formData));
    }
  }, [formData, editingReservation]);

  // Reset form quando si apre/chiude il dialog o cambia la prenotazione in modifica
  React.useEffect(() => {
    if (open) {
      if (editingReservation) {
        const dateObj = new Date(editingReservation.date);
        // Separa il prefisso dal numero
        let phoneNumber = editingReservation.customer_phone;
        let countryCode = "+39"; // default

        // Estrai il prefisso se presente
        const prefixes = ["+39", "+33", "+49", "+34", "+44", "+1"];
        for (const prefix of prefixes) {
          if (phoneNumber.startsWith(prefix)) {
            countryCode = prefix;
            phoneNumber = phoneNumber.substring(prefix.length);
            break;
          }
        }

        setFormData({
          customer_name: editingReservation.customer_name,
          country_code: countryCode,
          phone_number: phoneNumber,
          date: format(dateObj, "yyyy-MM-dd"),
          time: format(dateObj, "HH:mm"),
          pax: editingReservation.pax.toString(),
          table: editingReservation.table?.toString(),
          status: editingReservation.status,
        });
      } else {
        // Se non è in modalità edit, carica dal localStorage o usa valori di default
        const savedData = localStorage.getItem("reservationFormData");
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
          } catch {
            // Se c'è un errore, usa valori di default
            const now = new Date();
            // Imposta ora corrente + 1 ora
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1);

            setFormData({
              customer_name: "",
              country_code: "+39",
              phone_number: "",
              date: format(now, "yyyy-MM-dd"),
              time: format(nextHour, "HH:mm"),
              pax: "",
              table: undefined,
              status: "PENDING",
            });
          }
        } else {
          // Se non c'è localStorage, imposta valori di default con ora +1
          const now = new Date();
          const nextHour = new Date(now);
          nextHour.setHours(now.getHours() + 1);

          setFormData({
            customer_name: "",
            country_code: "+39",
            phone_number: "",
            date: format(now, "yyyy-MM-dd"),
            time: format(nextHour, "HH:mm"),
            pax: "",
            table: undefined,
            status: "PENDING",
          });
        }
      }
      setFieldErrors({});
    }
  }, [open, editingReservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida il form
    const errors = validateForm(formData);

    if (errors.length > 0) {
      // Converti array di errori in oggetto per il display
      const errorMap: Record<string, string> = {};
      errors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setFieldErrors(errorMap);

      // Mostra il primo errore come toast
      toast.error("Errore di validazione", {
        description: errors[0].message,
      });
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      // Il numero dovrebbe già essere pulito (solo cifre)
      // ma per sicurezza rimuoviamo eventuali caratteri non numerici
      const cleanedPhone = formData.phone_number.replace(/\D/g, "");

      // Combina country_code selezionato + phone_number
      const fullPhone = formData.country_code + cleanedPhone;

      // Crea datetime ISO 8601 corretto
      const datetime = `${formData.date}T${formData.time}:00`;

      const data = {
        customer_name: formData.customer_name,
        customer_phone: fullPhone, // Prefisso + numero pulito
        date: datetime,
        pax: parseInt(formData.pax),
        table: formData.table ? parseInt(formData.table) : null,
        status: formData.status,
      };

      console.log("Sending reservation data:", data);

      if (editingReservation) {
        await apiClient.updateReservation(editingReservation.id, data);
        toast.success("Prenotazione aggiornata", {
          description: `Prenotazione di ${formData.customer_name} aggiornata con successo`,
        });
      } else {
        await apiClient.createReservation(data);
        toast.success("Prenotazione creata", {
          description: `Prenotazione di ${formData.customer_name} creata con successo`,
        });
        // Pulisci il localStorage dopo una creazione riuscita
        localStorage.removeItem("reservationFormData");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error saving reservation:", error);

      // Gestisci errori specifici dal backend
      let errorMessage = "Si è verificato un errore durante il salvataggio";
      const fieldSpecificErrors: Record<string, string> = {};

      // L'errore dal nostro ApiClient ha questa struttura
      if (error && typeof error === "object") {
        const apiError = error as {
          message?: string;
          status?: number;
          data?: unknown;
        };

        console.log("Error details:", {
          message: apiError.message,
          status: apiError.status,
          data: apiError.data,
        });

        // Se c'è un messaggio specifico
        if (apiError.message) {
          errorMessage = apiError.message;
        }

        // Se ci sono errori di campo dal backend (es. validazione Django)
        if (apiError.data && typeof apiError.data === "object") {
          const backendErrors = apiError.data as Record<string, unknown>;

          // Mappa gli errori sui campi
          Object.entries(backendErrors).forEach(([field, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              fieldSpecificErrors[field] = value[0];
            } else if (typeof value === "string") {
              fieldSpecificErrors[field] = value;
            }
          });

          // Se ci sono errori di campo, mostra il primo
          const firstFieldError = Object.values(fieldSpecificErrors)[0];
          if (firstFieldError) {
            errorMessage = firstFieldError;
          }

          // Imposta gli errori sui campi nel form
          if (Object.keys(fieldSpecificErrors).length > 0) {
            setFieldErrors(fieldSpecificErrors);
          }
        }
      }

      toast.error("Errore nel salvataggio", {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Valida un singolo campo quando cambia (validazione live opzionale)
  const validateField = (field: keyof ReservationFormData) => {
    const errors = validateForm(formData);
    const fieldError = errors.find((e) => e.field === field);

    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError.message;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingReservation
                ? "Modifica Prenotazione"
                : "Nuova Prenotazione"}
            </DialogTitle>
            <DialogDescription>
              {editingReservation
                ? "Modifica i dettagli della prenotazione"
                : "Crea una nuova prenotazione per un cliente"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome Cliente */}
            <div className="space-y-2">
              <Label htmlFor="customer_name">
                Nome Cliente <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer_name"
                placeholder="Mario Rossi"
                value={formData.customer_name}
                onChange={(e) => {
                  setFormData({ ...formData, customer_name: e.target.value });
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.customer_name;
                    return newErrors;
                  });
                }}
                onBlur={() => validateField("customer_name")}
                className={
                  fieldErrors.customer_name ? "border-destructive" : ""
                }
              />
              {fieldErrors.customer_name && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{fieldErrors.customer_name}</span>
                </div>
              )}
            </div>

            {/* Telefono - Component atomico */}
            <PhoneInput
              countryCode={formData.country_code}
              phoneNumber={formData.phone_number}
              error={fieldErrors.phone_number}
              onCountryCodeChange={(code) =>
                setFormData({ ...formData, country_code: code })
              }
              onPhoneNumberChange={(number) => {
                setFormData({ ...formData, phone_number: number });
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.phone_number;
                  return newErrors;
                });
              }}
              onBlur={() => validateField("phone_number")}
            />

            {/* Data e Ora - Component atomico */}
            <DateTimeInput
              date={formData.date}
              time={formData.time}
              dateError={fieldErrors.date}
              onDateChange={(date) => {
                setFormData({ ...formData, date });
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.date;
                  return newErrors;
                });
              }}
              onTimeChange={(time) => {
                setFormData({ ...formData, time });
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.date;
                  return newErrors;
                });
              }}
              onDateBlur={() => validateField("date")}
              onTimeBlur={() => validateField("date")}
            />

            {/* Persone e Tavolo - Component atomico */}
            <PaxTableSelect
              pax={formData.pax}
              table={formData.table}
              tables={tables}
              paxError={fieldErrors.pax}
              tableError={fieldErrors.table}
              onPaxChange={(pax) => {
                setFormData({ ...formData, pax });
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.pax;
                  delete newErrors.table; // Rimuovi anche l'errore del tavolo
                  return newErrors;
                });
              }}
              onTableChange={(table) => {
                setFormData({ ...formData, table });
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.table;
                  return newErrors;
                });
                // Valida immediatamente la capacità
                setTimeout(() => validateField("table"), 0);
              }}
              onPaxBlur={() => {
                validateField("pax");
                // Ricontrolla anche il tavolo se selezionato
                if (formData.table) {
                  validateField("table");
                }
              }}
            />

            {/* Stato */}
            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "PENDING" | "CONFIRMED" | "CANCELLED",
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">In Attesa</SelectItem>
                  <SelectItem value="CONFIRMED">Confermata</SelectItem>
                  <SelectItem value="CANCELLED">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Salvataggio..."
                : editingReservation
                ? "Salva Modifiche"
                : "Crea Prenotazione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
