import { CheckIcon, CirclePlus } from "lucide-react";
import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";

import { Separator } from "@/components/ui/separator";

type Category = {
    id: number;
    name: string;
};

interface DataTableFacetedFilterCategoryProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: Category[];
}

export function DataTableFacetedFilterCategory<TData, TValue>({
    column,
    title,
    options
}: DataTableFacetedFilterCategoryProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues();
    const selectedValues = new Set(column?.getFilterValue() as string[]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                <CirclePlus className="mr-2 h-4 w-4" />
                {title}
                {selectedValues?.size > 0 && (
                    <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal lg:hidden"
                    >
                        {selectedValues.size}
                    </Badge>
                    <div className="hidden space-x-1 lg:flex">
                        {selectedValues.size > 2 ? (
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                        >
                            {selectedValues.size} selected
                        </Badge>
                        ) : (
                        options
                            .filter((option) => selectedValues.has(option.name))
                            .map((option) => (
                            <Badge
                                variant="secondary"
                                key={option.name}
                                className="rounded-sm px-1 font-normal"
                            >
                                {option.name}
                            </Badge>
                            ))
                        )}
                    </div>
                    </>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                <CommandInput placeholder={title} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                    {options.map((option) => {
                        const isSelected = selectedValues.has(option.name);
                        return (
                        <CommandItem
                            key={option.name}
                            onSelect={() => {
                            if (isSelected) {
                                selectedValues.delete(option.name);
                            } else {
                                selectedValues.add(option.name);
                            }
                            const filterValues = Array.from(selectedValues);
                            column?.setFilterValue(
                                filterValues.length ? filterValues : undefined
                            );
                            }}
                        >
                            <div
                            className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                            >
                            <CheckIcon className={cn("h-4 w-4")} />
                            </div>
                            
                            <span>{option.name}</span>
                            {facets?.get(option.name) && (
                            <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                {facets.get(option.name)}
                            </span>
                            )}
                        </CommandItem>
                        );
                    })}
                    </CommandGroup>
                    {selectedValues.size > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup>
                        <CommandItem
                            onSelect={() => column?.setFilterValue(undefined)}
                            className="justify-center text-center"
                        >
                            Clear filters
                        </CommandItem>
                        </CommandGroup>
                    </>
                    )}
                </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}