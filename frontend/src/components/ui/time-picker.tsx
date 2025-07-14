"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type TimePickerProps = {
    id?: string
    value?: string
    onChange?: (value: string) => void
    label?: string
    defaultValue?: string
}

export function TimePicker({
    id = "time-picker",
    value,
    onChange
}: TimePickerProps) {
    return (
        <Input
            type="time"
            id={id}
            step="1"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
    );
}
