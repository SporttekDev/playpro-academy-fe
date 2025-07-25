'use client';

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    PaginationState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { DataTableSearch } from './data-table-search';
import { DataTableFilter } from './data-table-filter';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getPaginationRange } from '@/helpers/paginationRange';

interface FilterConfig<TData> {
    key: keyof TData;
    label?: string;
    options: string[];
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filters?: FilterConfig<TData>[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filters,
}: DataTableProps<TData, TValue>) {
    // stabilize filters array
    const appliedFilters = React.useMemo(() => filters ?? [], [filters]);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string>>(() =>
        (filters ?? []).reduce((acc, f) => {
            acc[String(f.key)] = 'all';
            return acc;
        }, {} as Record<string, string>)
    );

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // filter data by global search (all fields) and applied filters
    const filteredData = React.useMemo(() => {
        return data.filter(item => {
            const text = JSON.stringify(item).toLowerCase();
            const matchesSearch = text.includes(globalFilter.toLowerCase());

            const matchesAll = appliedFilters.every(f => {
                const sel = selectedFilters[String(f.key)];
                return sel === 'all' || String(item[f.key]) === sel;
            });

            return matchesSearch && matchesAll;
        });
    }, [data, globalFilter, selectedFilters, appliedFilters]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // reset to first page on filter/search change
    React.useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [globalFilter, selectedFilters]);

    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    const pageRange = getPaginationRange(currentPage, totalPages);


    return (
        <div className="space-y-4">
            {/* Global Search + Dynamic Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <DataTableSearch value={globalFilter} onChange={setGlobalFilter} />
                <div className="flex gap-2">
                    {appliedFilters.map(f => (
                        <div key={String(f.key)} className="flex flex-col">
                            {f.label && <span className="text-sm font-medium mb-1">{f.label}</span>}
                            <DataTableFilter
                                options={['all', ...f.options]}
                                value={selectedFilters[String(f.key)]}
                                onChange={v => setSelectedFilters(prev => ({ ...prev, [String(f.key)]: v }))}
                                placeholder={f.label ?? String(f.key)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="cursor-pointer select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                header.column.getIsSorted() === 'asc' ? <ArrowUp className="w-4 h-4" /> :
                                                    header.column.getIsSorted() === 'desc' ? <ArrowDown className="w-4 h-4" /> :
                                                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center py-2">
                <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        First
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Prev
                    </Button>
                    {pageRange.map((page, i) => (
                        typeof page === 'string' ? (
                            <span key={i} className="px-2 text-sm text-muted-foreground">...</span>
                        ) : (
                            <Button
                                key={i}
                                variant={page === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => table.setPageIndex(page - 1)}
                            >
                                {page}
                            </Button>
                        )
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        Last
                    </Button>
                </div>
            </div>
        </div>
    );
}
