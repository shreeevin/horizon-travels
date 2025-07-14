"use client";

import * as React from "react";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Separator } from "./separator";

type PassengerPickerProps = {
    id?: string
    value: number
    onChange: (value: number) => void
}

export function PassengerPicker({
    id = "passenger-picker",
    value = 1,
    onChange,
}: PassengerPickerProps) {
    const [adults, setAdults] = React.useState<number>(value);
    const [childrens, setChildrens] = React.useState<number>(0);

    const count = adults + childrens;

    const increment = (schema: "adults" | "childrens") => {
        if (count >= 10) {
            toast.error("Maximum 10 passengers allowed.");
            return;
        }

        if (schema === "adults") {
            setAdults(adults + 1);
        } else {
            setChildrens(childrens + 1);
        }

        // Update the total count and call onChange after state update
        onChange?.(adults + childrens + 1);
    }

    const decrement = (schema: "adults" | "childrens") => {
        if (count <= 1) {
            toast.error("Minimum 1 passenger allowed.");
            return;
        }
        
        if (schema === "adults" && adults > 0) {
            setAdults(adults - 1);
            onChange?.(adults + childrens - 1);  // Update onChange with new count
        } else if (schema === "childrens" && childrens > 0) {
            setChildrens(childrens - 1);
            onChange?.(adults + childrens - 1);  // Update onChange with new count
        } else {
            toast.error("Minimum 1 passenger allowed.");
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        className="w-min-full justify-between font-normal"
                    >
                        {`${count} Passenger${count > 1 ? "s" : ""}`}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-min-full" align="start">
                    <div className="flex flex-col p-2">
                        <h3 className="font-semibold">Passengers</h3>
                        <span className="text-sm font-medium text-muted-foreground pb-2">Child ticket fares are determined by the carrier</span>
                        <ul className="flex flex-col gap-2 mt-2">
                            <li className="flex items-center justify-between">
                                <span className="w-1/2">Adults</span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => decrement("adults")}>
                                        <MinusIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="w-6 text-center">{adults}</span>
                                    <Button variant="outline" size="icon" onClick={() => increment("adults")}>
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                            <Separator className="my-2" />
                            <li className="flex items-center justify-between">
                                <span className="w-1/2">Children</span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => decrement("childrens")}>
                                        <MinusIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="w-6 text-center">{childrens}</span>
                                    <Button variant="outline" size="icon" onClick={() => increment("childrens")}>
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
