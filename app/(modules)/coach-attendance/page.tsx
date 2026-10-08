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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimeInput } from '@/components/ui/time-input';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { apiRequest, getErrorMessage } from '@/lib/api';

type AttendanceStatus = 'Not Checked In' | 'Checked In' | 'Checked Out' | 'Cancelled';

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
    status: AttendanceStatus;
    // Butuh patch CoachAttendanceController bagian 6b; tanpa itu field ini kosong.
    schedule_status?: 'scheduled' | 'cancelled' | null;
    check_in_at: string | null;
    check_in_photo_url: string | null;
    check_out_at: string | null;
    check_out_photo_url: string | null;
    // Diisi bila admin/superadmin/finance menginput absensi manual.
    check_in_manual?: boolean;
    check_out_manual?: boolean;
    manual_reason?: string | null;
    manual_by_name?: string | null;
}

interface Branch {
    id: string;
    name: string;
}

interface Session {
    id: number;
    name: string;
    role: 'admin' | 'coach' | 'parent' | 'superadmin' | 'finance';
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

/** ISO -> "HH:mm" di zona Asia/Jakarta (untuk mengisi form absen manual). */
function toJakartaTime(iso: string | null | undefined) {
    if (!iso) return '';
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    }).format(new Date(iso));
}

function getStatusStyle(status: CoachAttendanceRow['status']) {
    switch (status) {
        case 'Checked Out':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'Checked In':
            return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'Cancelled':
            return 'bg-slate-100 text-slate-500 border-slate-200 line-through';
        case 'Not Checked In':
        default:
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

    // Absen manual (admin, superadmin, finance)
    const [manualTarget, setManualTarget] = useState<CoachAttendanceRow | null>(null);
    const [manualCheckIn, setManualCheckIn] = useState('');
    const [manualCheckOut, setManualCheckOut] = useState('');
    const [manualReason, setManualReason] = useState('');
    const [isSavingManual, setIsSavingManual] = useState(false);

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

    const role = session !== 'loading' && session !== null ? session.role : null;
    const isAdmin = role === 'admin' || role === 'superadmin' || role === 'finance';
    // Finance memakai endpoint /finance (middleware payroll.access), admin & superadmin memakai /admin.
    const apiPrefix = role === 'finance' ? '/finance' : '/admin';
    const isCoach = session !== 'loading' && session !== null && session.role === 'coach';

    const fetchBranches = useCallback(async () => {
        try {
            const { data } = await apiRequest<Branch[]>(role === 'finance' ? '/finance/branches' : '/admin/branch');
            setBranches(data ?? []);
        } catch (error) {
            console.error(error);
        }
    }, [role]);

    const fetchAttendance = useCallback(async () => {
        if (session === 'loading') return;

        setIsLoading(true);
        try {
            const { data } = await apiRequest<CoachAttendanceRow[]>(
                isAdmin ? `${apiPrefix}/coach-attendance` : '/coach/attendance-history',
                {
                    query: {
                        month: selectedMonth,
                        year: selectedYear,
                        branch_id: isAdmin && selectedBranch !== 'all' ? selectedBranch : undefined,
                    },
                }
            );
            setData(data ?? []);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Gagal memuat data absensi coach'));
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear, selectedBranch, session, isAdmin, apiPrefix]);

    useEffect(() => {
        if (isAdmin) fetchBranches();
    }, [isAdmin, fetchBranches]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    function openManualDialog(row: CoachAttendanceRow) {
        setManualTarget(row);
        setManualCheckIn(toJakartaTime(row.check_in_at));
        setManualCheckOut(toJakartaTime(row.check_out_at));
        setManualReason('');
    }

    function closeManualDialog() {
        setManualTarget(null);
        setManualCheckIn('');
        setManualCheckOut('');
        setManualReason('');
    }

    async function handleSaveManual() {
        if (!manualTarget) return;

        // Check-in/out asli dari aplikasi tidak bisa ditimpa, jadi tidak ikut dikirim.
        const inLocked = Boolean(manualTarget.check_in_at) && !manualTarget.check_in_manual;
        const outLocked = Boolean(manualTarget.check_out_at) && !manualTarget.check_out_manual;

        const checkInTime = inLocked ? '' : manualCheckIn;
        const checkOutTime = outLocked ? '' : manualCheckOut;

        if (!checkInTime && !checkOutTime) {
            toast.error('Isi jam check-in atau jam check-out.');
            return;
        }
        if (manualReason.trim().length < 5) {
            toast.error('Alasan wajib diisi (minimal 5 karakter).');
            return;
        }

        try {
            setIsSavingManual(true);
            await apiRequest(`${apiPrefix}/coach-schedule/${manualTarget.id}/manual-attendance`, {
                method: 'POST',
                body: {
                    check_in_time: checkInTime || undefined,
                    check_out_time: checkOutTime || undefined,
                    reason: manualReason.trim(),
                },
            });
            toast.success('Absensi manual tersimpan.');
            closeManualDialog();
            await fetchAttendance();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan absensi manual'));
        } finally {
            setIsSavingManual(false);
        }
    }

    function ManualBadge() {
        return (
            <Badge variant="outline" className="rounded-full border-indigo-200 bg-indigo-50 text-[10px] text-indigo-600">
                Manual
            </Badge>
        );
    }

    function ManualActionButton({ row }: { row: CoachAttendanceRow }) {
        const isCancelled = row.status === 'Cancelled';
        const complete =
            Boolean(row.check_in_at) &&
            Boolean(row.check_out_at) &&
            !row.check_in_manual &&
            !row.check_out_manual;
        const hasManual = Boolean(row.check_in_manual || row.check_out_manual);

        return (
            <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={isCancelled || complete}
                onClick={() => openManualDialog(row)}
            >
                {hasManual ? 'Ubah Manual' : 'Absen Manual'}
            </Button>
        );
    }

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

        const isCancelled = row.status === 'Cancelled';
        const isDone = row.status === 'Checked Out';

        const label = isCancelled
            ? 'Dibatalkan'
            : row.status === 'Not Checked In'
                ? 'Check-in'
                : row.status === 'Checked In'
                    ? 'Check-out'
                    : 'Selesai';

        return (
            <Button
                size="sm"
                variant={isDone || isCancelled ? 'outline' : 'default'}
                disabled={isDone || isCancelled}
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
                    {row.original.check_in_manual ? (
                        <ManualBadge />
                    ) : (
                        <PhotoThumbnail
                            url={row.original.check_in_photo_url}
                            label={`Check-in ${row.original.coach_name ?? row.original.class_name}`}
                        />
                    )}
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
                    {row.original.check_out_manual ? (
                        <ManualBadge />
                    ) : (
                        <PhotoThumbnail
                            url={row.original.check_out_photo_url}
                            label={`Check-out ${row.original.coach_name ?? row.original.class_name}`}
                        />
                    )}
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(row.original.check_out_at)}
                    </span>
                </div>
            ),
        },
        ...(isAdmin
            ? ([
                {
                    id: 'manual_actions',
                    header: 'Actions',
                    cell: ({ row }) => <ManualActionButton row={row.original} />,
                },
            ] as ColumnDef<CoachAttendanceRow>[])
            : []),
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
                <DataTableSkeleton columns={isAdmin ? 10 : 7} rows={6} />
            ) : (
                <DataTable columns={columns} data={data} />
            )}

            {/* Absen Manual Dialog (admin, superadmin, finance) */}
            <Dialog open={!!manualTarget} onOpenChange={(open) => !open && closeManualDialog()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Absen Manual</DialogTitle>
                        <DialogDescription>
                            {manualTarget
                                ? `${manualTarget.coach_name ?? 'Coach'} - ${manualTarget.class_name}, ${manualTarget.date} (${formatTime(manualTarget.start_time)} - ${formatTime(manualTarget.end_time)})`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {manualTarget && (
                        <div className="space-y-4">
                            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                                Jam yang Anda isi dipakai apa adanya oleh payroll, termasuk potongan telat bila jam
                                check-in melewati jadwal. Tindakan ini tercatat di riwayat.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Jam Check-in</Label>
                                    <TimeInput
                                        value={manualCheckIn}
                                        onChange={setManualCheckIn}
                                        disabled={Boolean(manualTarget.check_in_at) && !manualTarget.check_in_manual}
                                    />
                                    {Boolean(manualTarget.check_in_at) && !manualTarget.check_in_manual && (
                                        <p className="text-[11px] text-muted-foreground">Check-in asli dari aplikasi.</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label>Jam Check-out</Label>
                                    <TimeInput
                                        value={manualCheckOut}
                                        onChange={setManualCheckOut}
                                        disabled={Boolean(manualTarget.check_out_at) && !manualTarget.check_out_manual}
                                    />
                                    {Boolean(manualTarget.check_out_at) && !manualTarget.check_out_manual && (
                                        <p className="text-[11px] text-muted-foreground">Check-out asli dari aplikasi.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Alasan</Label>
                                <Textarea
                                    value={manualReason}
                                    onChange={(e) => setManualReason(e.target.value)}
                                    placeholder="Contoh: aplikasi error di HP coach, GPS tidak terbaca"
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeManualDialog} disabled={isSavingManual}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleSaveManual} disabled={isSavingManual}>
                            {isSavingManual ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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