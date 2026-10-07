'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { apiRequest, getErrorMessage } from '@/lib/api';
import {
    MONTHS,
    YEARS,
    RescheduleRecord,
    formatDate,
    formatDateTime,
    getRescheduleTypeLabel,
} from '@/lib/payroll';

interface Session {
    role: 'admin' | 'coach' | 'parent' | 'superadmin' | 'finance';
}

export default function ReschedulesPage() {
    const [role, setRole] = useState<Session['role'] | null | 'loading'>('loading');
    const [rows, setRows] = useState<RescheduleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [type, setType] = useState('all');

    useEffect(() => {
        try {
            const raw = Cookies.get('session_key');
            const session = raw ? (JSON.parse(raw) as Session) : null;
            setRole(session?.role ? (String(session.role).toLowerCase() as Session['role']) : null);
        } catch {
            setRole(null);
        }
    }, []);

    // Finance memakai endpoint /finance, admin dan superadmin memakai /admin.
    const endpoint = role === 'finance' ? '/finance/reschedules' : '/admin/reschedules';

    const fetchData = useCallback(async () => {
        if (role === 'loading' || role === null) return;

        setIsLoading(true);
        try {
            const { data } = await apiRequest<RescheduleRecord[]>(endpoint, {
                query: { month, year, type: type === 'all' ? undefined : type },
            });
            setRows(data ?? []);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Gagal memuat riwayat reschedule'));
        } finally {
            setIsLoading(false);
        }
    }, [role, endpoint, month, year, type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const counted = rows.filter((r) => r.counts_toward_bonus).length;
        return { total: rows.length, counted, notCounted: rows.length - counted };
    }, [rows]);

    // Jumlah permintaan coach per coach pada bulan ini, untuk menandai yang sudah lebih dari satu.
    const requestCountByCoach = useMemo(() => {
        const map = new Map<number, number>();
        rows.forEach((r) => {
            if (r.counts_toward_bonus) {
                map.set(r.from_coach_id, (map.get(r.from_coach_id) ?? 0) + 1);
            }
        });
        return map;
    }, [rows]);

    const columns: ColumnDef<RescheduleRecord>[] = [
        {
            accessorKey: 'schedule_date',
            header: 'Tanggal Sesi',
            cell: ({ row }) => formatDate(row.original.schedule_date),
        },
        {
            accessorKey: 'class_name',
            header: 'Kelas',
            cell: ({ row }) => row.original.class_name ?? '-',
        },
        {
            accessorKey: 'from_coach_name',
            header: 'Coach Awal',
            cell: ({ row }) => {
                const count = requestCountByCoach.get(row.original.from_coach_id) ?? 0;
                return (
                    <div className="flex flex-col gap-1">
                        <span>{row.original.from_coach_name ?? '-'}</span>
                        {row.original.counts_toward_bonus && count > 1 && (
                            <span className="text-xs text-rose-600">{count}x permintaan bulan ini</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'to_coach_name',
            header: 'Pengganti',
            cell: ({ row }) => row.original.to_coach_name ?? 'Tanpa pengganti',
        },
        { accessorKey: 'role_label', header: 'Role' },
        {
            accessorKey: 'type',
            header: 'Jenis',
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-1">
                    <Badge
                        className={`rounded-full border ${
                            row.original.counts_toward_bonus
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                        {getRescheduleTypeLabel(row.original.type)}
                    </Badge>
                    {row.original.counts_toward_bonus && (
                        <span className="text-xs text-muted-foreground">Dihitung ke bonus disiplin</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'reason',
            header: 'Alasan',
            cell: ({ row }) => (
                <span className="block max-w-xs whitespace-normal text-sm">{row.original.reason ?? '-'}</span>
            ),
        },
        {
            accessorKey: 'created_by_name',
            header: 'Dicatat Oleh',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.created_by_name ?? '-'}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(row.original.created_at)}
                    </span>
                </div>
            ),
        },
    ];

    if (role === 'loading') {
        return <div className="px-6 py-8">Loading...</div>;
    }

    return (
        <div className="px-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                                {y.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua jenis</SelectItem>
                        <SelectItem value="coach_request">{getRescheduleTypeLabel('coach_request')}</SelectItem>
                        <SelectItem value="admin_change">{getRescheduleTypeLabel('admin_change')}</SelectItem>
                    </SelectContent>
                </Select>

                <div className="ml-auto flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="rounded-full">Total {stats.total}</Badge>
                    <Badge className="rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        Dihitung bonus {stats.counted}
                    </Badge>
                    <Badge className="rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                        Tidak dihitung {stats.notCounted}
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <DataTableSkeleton columns={8} rows={6} />
            ) : (
                <DataTable columns={columns} data={rows} />
            )}
        </div>
    );
}