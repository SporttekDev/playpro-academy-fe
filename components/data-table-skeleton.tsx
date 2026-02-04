"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type DataTableSkeletonProps = {
    /** approximate jumlah kolom untuk render skeleton */
    columns?: number;
    /** jumlah baris skeleton */
    rows?: number;
    /** tampilkan skeleton untuk filter/search area */
    showFilters?: boolean;
    /** tampilkan skeleton untuk pagination controls */
    showControls?: boolean;
    /** minimum width (px) of inner table to force horizontal scroll on small screens */
    minTableWidth?: number;
};

export function DataTableSkeleton({
    columns = 6,
    rows = 5,
    showFilters = true,
    showControls = true,
    minTableWidth = 900,
}: DataTableSkeletonProps) {
    const cols = Array.from({ length: columns });
    const rowsArr = Array.from({ length: rows });

    return (
        <div className="space-y-4">
            {/* Search + Filters skeleton */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[min(100%,20rem)] rounded-md" />
                </div>

                {showFilters && (
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-28 rounded-md hidden xs:inline-block" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md hidden sm:inline-block" />
                    </div>
                )}
            </div>

            {/* Table - responsive: horizontal scroll on small screens */}
            <div className="rounded-md border">
                <div className="w-full overflow-x-auto">
                    {/* Force a minimum width for inner table so columns can scroll on small screens */}
                    <div style={{ minWidth: `${minTableWidth}px` }}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {cols.map((_, i) => (
                                        <TableHeadSkeletonCell key={i} />
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rowsArr.map((_, r) => (
                                    <TableRow key={r}>
                                        {cols.map((__, c) => (
                                            <TableCell key={c}>
                                                {/* responsive widths: narrower on xs, expand on md/lg */}
                                                <Skeleton className="h-4 w-full max-w-[8rem] sm:max-w-[12rem] md:max-w-[16rem]" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination skeleton */}
            {showControls && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2">
                    <div className="text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>

                    <div className="flex items-center space-x-2 justify-start sm:justify-end">
                        <Skeleton className="h-8 w-14 rounded" />
                        <Skeleton className="h-8 w-14 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-14 rounded hidden xs:inline-block" />
                        <Skeleton className="h-8 w-14 rounded hidden sm:inline-block" />
                    </div>
                </div>
            )}
        </div>
    );
}

/** Header cell skeleton — responsive widths */
function TableHeadSkeletonCell() {
    return (
        <TableHead>
            <div className="flex items-center gap-2 py-2">
                {/* responsive width: xs narrow, sm medium, md larger */}
                <Skeleton className="h-4 w-20 sm:w-28 md:w-36 lg:w-40 rounded" />
            </div>
        </TableHead>
    );
}
