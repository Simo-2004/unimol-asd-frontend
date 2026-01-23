"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { Table as TableType } from "@/lib/api-client";

interface PaxTableSelectProps {
  pax: string;
  table?: string;
  tables: TableType[];
  paxError?: string;
  tableError?: string;
  onPaxChange: (pax: string) => void;
  onTableChange: (table: string | undefined) => void;
  onPaxBlur?: () => void;
  onTableBlur?: () => void;
}

export function PaxTableSelect({
  pax,
  table,
  tables,
  paxError,
  tableError,
  onPaxChange,
  onTableChange,
  onPaxBlur,
}: PaxTableSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="pax">
          Persone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pax"
          type="number"
          min="1"
          max="20"
          placeholder="4"
          value={pax}
          onChange={(e) => onPaxChange(e.target.value)}
          onBlur={onPaxBlur}
          className={paxError ? "border-destructive" : ""}
        />
        {paxError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{paxError}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="table">Tavolo (opzionale)</Label>
        <Select
          value={table || ""}
          onValueChange={(value) => onTableChange(value || undefined)}
        >
          <SelectTrigger
            id="table"
            className={tableError ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Seleziona tavolo" />
          </SelectTrigger>
          <SelectContent>
            {tables
              .filter((t) => t.is_active)
              .map((tableItem) => (
                <SelectItem key={tableItem.id} value={tableItem.id.toString()}>
                  Tavolo {tableItem.number} ({tableItem.seats} posti)
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {table && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onTableChange(undefined)}
          >
            Rimuovi tavolo
          </Button>
        )}
        {tableError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{tableError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
