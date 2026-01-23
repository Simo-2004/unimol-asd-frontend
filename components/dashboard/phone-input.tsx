"use client";

import * as React from "react";
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

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  error?: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  onBlur?: () => void;
}

export function PhoneInput({
  countryCode,
  phoneNumber,
  error,
  onCountryCodeChange,
  onPhoneNumberChange,
  onBlur,
}: PhoneInputProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accetta SOLO numeri
    if (/^\d*$/.test(value)) {
      onPhoneNumberChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone_number">
        Telefono <span className="text-destructive">*</span>
      </Label>
      <div className="flex gap-2">
        {/* Select Prefisso */}
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+39">🇮🇹 +39</SelectItem>
            <SelectItem value="+33">🇫🇷 +33</SelectItem>
            <SelectItem value="+49">🇩🇪 +49</SelectItem>
            <SelectItem value="+34">🇪🇸 +34</SelectItem>
            <SelectItem value="+44">🇬🇧 +44</SelectItem>
            <SelectItem value="+1">🇺🇸 +1</SelectItem>
          </SelectContent>
        </Select>

        {/* Campo numero - SOLO NUMERI */}
        <Input
          id="phone_number"
          type="tel"
          placeholder="3401234567"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          className={error ? "border-destructive flex-1" : "flex-1"}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Inserisci solo numeri (senza spazi, trattini o altri caratteri)
      </p>
    </div>
  );
}
