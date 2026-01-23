"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DateTimeInputProps {
  date: string;
  time: string;
  dateError?: string;
  timeError?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onDateBlur?: () => void;
  onTimeBlur?: () => void;
}

export function DateTimeInput({
  date,
  time,
  dateError,
  timeError,
  onDateChange,
  onTimeChange,
  onDateBlur,
  onTimeBlur,
}: DateTimeInputProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">
          Data <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          onBlur={onDateBlur}
          className={dateError ? "border-destructive" : ""}
        />
        {dateError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">
          Ora <span className="text-destructive">*</span>
        </Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          onBlur={onTimeBlur}
          className={timeError ? "border-destructive" : ""}
        />
        {timeError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{timeError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
