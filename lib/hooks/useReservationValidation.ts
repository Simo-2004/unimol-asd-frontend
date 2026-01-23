import { Table as TableType } from "@/lib/api-client";

export interface ReservationFormData {
  customer_name: string;
  country_code: string;
  phone_number: string;
  date: string;
  time: string;
  pax: string;
  table: string | undefined;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export interface ValidationError {
  field: keyof ReservationFormData;
  message: string;
}

export function useReservationValidation(tables: TableType[]) {
  /**
   * Valida il numero di telefono
   * Accetta qualsiasi formato numerico (spazi, trattini, parentesi OK)
   * Blocca solo l'inserimento di lettere
   */
  const validatePhone = (phoneNumber: string): string | null => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      return "Il numero di telefono è obbligatorio";
    }

    // Rimuovi spazi, trattini e parentesi per la validazione
    const cleaned = phoneNumber
      .replace(/\s/g, "")
      .replace(/-/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    // Verifica che contenga solo numeri (blocca lettere)
    if (!/^[0-9]+$/.test(cleaned)) {
      return "Il numero può contenere solo cifre, spazi, trattini e parentesi";
    }

    // Minimo 6 cifre per essere un numero valido
    if (cleaned.length < 6) {
      return "Il numero deve contenere almeno 6 cifre";
    }

    // Massimo 15 cifre (standard E.164)
    if (cleaned.length > 15) {
      return "Il numero può contenere al massimo 15 cifre";
    }

    return null;
  };

  /**
   * Valida il numero di persone
   */
  const validatePax = (pax: string): string | null => {
    const num = parseInt(pax);

    if (!pax || isNaN(num)) {
      return "Il numero di persone è obbligatorio";
    }

    if (num < 1) {
      return "Il numero di persone deve essere almeno 1";
    }

    if (num > 20) {
      return "Il numero massimo di persone per prenotazione è 20";
    }

    return null;
  };

  /**
   * Valida che la data/ora sia nel futuro
   */
  const validateDateTime = (date: string, time: string): string | null => {
    if (!date) {
      return "La data è obbligatoria";
    }

    if (!time) {
      return "L'ora è obbligatoria";
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      return "Non puoi prenotare una data/ora nel passato";
    }

    return null;
  };

  /**
   * Valida che il tavolo selezionato abbia abbastanza posti
   */
  const validateTableCapacity = (
    pax: string,
    tableId: string | undefined
  ): string | null => {
    if (!tableId) {
      return null; // Tavolo opzionale
    }

    const numPax = parseInt(pax);
    if (isNaN(numPax)) {
      return null; // Errore già gestito da validatePax
    }

    const selectedTable = tables.find((t) => t.id.toString() === tableId);

    if (!selectedTable) {
      return "Tavolo non trovato";
    }

    if (numPax > selectedTable.seats) {
      return `Il tavolo ${selectedTable.number} ha solo ${selectedTable.seats} posti disponibili, ma hai richiesto ${numPax} persone`;
    }

    return null;
  };

  /**
   * Valida il nome cliente
   */
  const validateCustomerName = (name: string): string | null => {
    if (!name.trim()) {
      return "Il nome del cliente è obbligatorio";
    }

    if (name.trim().length < 2) {
      return "Il nome deve contenere almeno 2 caratteri";
    }

    if (name.trim().length > 100) {
      return "Il nome non può superare 100 caratteri";
    }

    return null;
  };

  /**
   * Valida l'intero form e restituisce tutti gli errori
   */
  const validateForm = (formData: ReservationFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Valida nome
    const nameError = validateCustomerName(formData.customer_name);
    if (nameError) {
      errors.push({ field: "customer_name", message: nameError });
    }

    // Valida telefono
    const phoneError = validatePhone(formData.phone_number);
    if (phoneError) {
      errors.push({ field: "phone_number", message: phoneError });
    }

    // Valida numero persone
    const paxError = validatePax(formData.pax);
    if (paxError) {
      errors.push({ field: "pax", message: paxError });
    }

    // Valida data/ora
    const dateTimeError = validateDateTime(formData.date, formData.time);
    if (dateTimeError) {
      errors.push({ field: "date", message: dateTimeError });
    }

    // Valida capacità tavolo (solo se non ci sono errori su pax)
    if (!paxError) {
      const capacityError = validateTableCapacity(formData.pax, formData.table);
      if (capacityError) {
        errors.push({ field: "table", message: capacityError });
      }
    }

    return errors;
  };

  return {
    validateForm,
    validatePhone,
    validatePax,
    validateDateTime,
    validateTableCapacity,
    validateCustomerName,
  };
}
