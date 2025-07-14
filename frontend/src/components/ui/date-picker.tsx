"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
    id?: string
    value?: Date
    onChange?: (value: Date) => void
    label?: string
    defaultValue?: string
}

export function DatePicker({
    id = "date-picker",
    value,
    onChange,
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date>(value ?? new Date())
    const [open, setOpen] = React.useState(false)

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 120); 

    const handleSelect = (date?: Date) => {
        if (!date) return
        setSelectedDate(date)
        onChange?.(date)
        setOpen(false)
    }

    const formattedDate = format(selectedDate, "d LLL, yyyy");

    return (
        <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className="w-min-full justify-between font-normal"
                    >
                        {selectedDate ? formattedDate : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="label"
                        onSelect={handleSelect}
                        disabled={(date) => {
                            const startOfToday = new Date();
                            startOfToday.setHours(0, 0, 0, 0);

                            return date < startOfToday || date > maxDate;
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
