'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface CoachAttendanceRow {
    id: number;
    schedule_id: number;
    coach_name?: string;
    role_label: string;
    class_name: string;
    branch_name: string;
    venue_name: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'Not Checked In' | 'Checked In' | 'Checked Out';
    check_in_at: string | null;
    check_in_photo_url: string | null;
    check_out_at: string | null;
    check_out_photo_url: string | null;
}

interface Branch {
    id: string;
    name: string;
}

interface Session {
    id: number;
    name: string;
    role: 'admin' | 'coach' | 'parent';
}

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

function formatTime(time: string) {
    return time?.slice(0, 5) ?? '-';
}

function formatDateTime(iso: string | null) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(iso));
}

function getStatusStyle(status: CoachAttendanceRow['status']) {
    switch (status) {
        case 'Checked Out':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'Checked In':
            return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'Not Checked In':
            return 'bg-rose-50 text-rose-600 border-rose-200';
    }
}

export default function CoachAttendancePage() {
    const router = useRouter();

    const [session, setSession] = useState<Session | null | 'loading'>('loading');
    const [data, setData] = useState<CoachAttendanceRow[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedBranch, setSelectedBranch] = useState<string>('all');

    const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);

    useEffect(() => {
        const sessionString = Cookies.get('session_key');
        if (sessionString) {
            try {
                setSession(JSON.parse(sessionString));
            } catch {
                console.error('Failed to parse session');
                setSession(null);
            }
        } else {
            setSession(null);
        }
    }, []);

    const isAdmin = session !== 'loading' && session !== null && session.role === 'admin';
    const isCoach = session !== 'loading' && session !== null && session.role === 'coach';

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!response.ok) return;
            const { data } = await response.json();
            setBranches(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchAttendance = useCallback(async () => {
        if (session === 'loading') return;

        setIsLoading(true);
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            params.append('month', selectedMonth);
            params.append('year', selectedYear);
            if (isAdmin && selectedBranch !== 'all') params.append('branch_id', selectedBranch);

            const endpoint = isAdmin
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/coach-attendance?${params.toString()}`
                : `${process.env.NEXT_PUBLIC_API_URL}/coach/attendance-history?${params.toString()}`;

            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch coach attendance');
            const { data } = await response.json();
            setData(data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data absensi coach');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear, selectedBranch, session, isAdmin]);

    useEffect(() => {
        if (isAdmin) fetchBranches();
    }, [isAdmin, fetchBranches]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    function PhotoThumbnail({ url, label }: { url: string | null; label: string }) {
        if (!url) {
            return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
            <button
                type="button"
                onClick={() => setPreviewPhoto({ url, label })}
                className="relative h-10 w-10 overflow-hidden rounded-md border transition-opacity hover:opacity-80"
            >
                <Image src={url} alt={label} fill className="object-cover" unoptimized />
            </button>
        );
    }

    function AttendanceActionButton({ row }: { row: CoachAttendanceRow }) {
        if (!isCoach) return null;

        const label =
            row.status === 'Not Checked In'
                ? 'Check-in'
                : row.status === 'Checked In'
                ? 'Check-out'
                : 'Selesai';

        return (
            <Button
                size="sm"
                variant={row.status === 'Checked Out' ? 'outline' : 'default'}
                disabled={row.status === 'Checked Out'}
                className="rounded-xl"
                onClick={() => router.push(`/attendance-checkin/${row.schedule_id}`)}
            >
                {label}
            </Button>
        );
    }

    const columns: ColumnDef<CoachAttendanceRow>[] = [
        ...(isAdmin
            ? ([{ accessorKey: 'coach_name', header: 'Coach' }] as ColumnDef<CoachAttendanceRow>[])
            : []),
        {
            accessorKey: 'role_label',
            header: 'Role',
            cell: ({ row }) => row.original.role_label,
        },
        { accessorKey: 'class_name', header: 'Class' },
        ...(isAdmin
            ? ([{ accessorKey: 'branch_name', header: 'Branch' }] as ColumnDef<CoachAttendanceRow>[])
            : []),
        { accessorKey: 'venue_name', header: 'Venue' },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) =>
                new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(
                    new Date(row.original.date)
                ),
        },
        {
            header: 'Time',
            cell: ({ row }) => `${formatTime(row.original.start_time)} - ${formatTime(row.original.end_time)}`,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={`rounded-full border ${getStatusStyle(row.original.status)}`}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            header: 'Check-in',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PhotoThumbnail
                        url={row.original.check_in_photo_url}
                        label={`Check-in ${row.original.coach_name ?? row.original.class_name}`}
                    />
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(row.original.check_in_at)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Check-out',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PhotoThumbnail
                        url={row.original.check_out_photo_url}
                        label={`Check-out ${row.original.coach_name ?? row.original.class_name}`}
                    />
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(row.original.check_out_at)}
                    </span>
                </div>
            ),
        },
        ...(isCoach
            ? ([
                  {
                      id: 'actions',
                      header: 'Actions',
                      cell: ({ row }) => <AttendanceActionButton row={row.original} />,
                  },
              ] as ColumnDef<CoachAttendanceRow>[])
            : []),
    ];

    if (session === 'loading') {
        return <div className="px-6 py-8">Loading...</div>;
    }

    return (
        <div className="px-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map((y) => (
                            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isAdmin && (
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Pilih Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Branch</SelectItem>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Table */}
            {isLoading ? (
                <DataTableSkeleton columns={isAdmin ? 9 : 7} rows={6} />
            ) : (
                <DataTable columns={columns} data={data} />
            )}

            {/* Photo Preview Dialog */}
            <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{previewPhoto?.label}</DialogTitle>
                    </DialogHeader>
                    {previewPhoto && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                            <Image
                                src={previewPhoto.url}
                                alt={previewPhoto.label}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}