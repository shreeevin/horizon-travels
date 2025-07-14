"use client";

import * as React from "react";

import { Table } from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "@/components/datatable/view-options";
import { DataTableFacetedFilterStatus } from "@/components/datatable/filter/faceted-status";

import { X, TrashIcon, Check, PlusIcon } from 'lucide-react';
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Status = {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
};

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    search: string;
}

export function DataTableToolbar<TData>({
    table,
    search,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    const allStatus: Status[] = [
        {
            label: "Active",
            value: "active",
            icon: Check,
        },
        {
            label: "Inactive",
            value: "inactive",
            icon:  X,
        }
    ];    

    return (
        <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input 
                    placeholder="Search" 
                    value={(table.getColumn(search)?.getFilterValue() as string) ?? ""}
                    onChange={(destination) =>
                        table.getColumn(search)?.setFilterValue(destination.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                /> 

                {table.getColumn("status") && (
                    <DataTableFacetedFilterStatus
                        column={table.getColumn("status")}
                        title="Status"
                        options={allStatus}
                    />
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                                table.toggleAllPageRowsSelected(false);
                                toast.error("Permission denied", {
                                    description: "You do not have permission to delete this item.",
                                });
                            }
                        }
                    >
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                        Delete ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                ) : null }

                <DataTableViewOptions table={table} />
                
                <Link 
                    href="/admin/destinations/new"
                    className={cn(
                        buttonVariants({ variant: "default" })
                    )}
                >
                    <PlusIcon />
                    Create
                </Link>
            </div>
        </div>
    );
}