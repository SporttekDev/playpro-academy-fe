'use client';

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconRefresh, IconLockCheck, IconLockOpen, IconCash, IconFlag, IconSettings } from '@tabler/icons-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { apiRequest, getErrorMessage } from '@/lib/api';
import {
    CoachPayrollBreakdown,
    CoachPayrollSummary,
    MONTHS,
    PayrollAuditEntry,
    PayrollItemRow,
    PayrollSetting,
    YEARS,
    currentYear,
    describeAuditEntry,
    formatDate,
    formatDateTime,
    formatRupiah,
    getAuditActionLabel,
    getBonusReasonLabel,
    getItemStatusLabel,
    getItemStatusStyle,
    getPeriodStatusLabel,
    getPeriodStatusStyle,
    getRescheduleTypeLabel,
} from '@/lib/payroll';

// ---------------------------------------------------------------------------
// Types lokal
// ---------------------------------------------------------------------------

interface Session {
    id: number;
    name: string;
    role: 'admin' | 'coach' | 'parent' | 'superadmin' | 'finance';
}

type FlagField = 'attire_compliant' | 'manual_present_override';

interface PeriodAction {
    kind: 'finalize' | 'mark-paid';
    periodId: number;
    coachId: number;
    coachName: string;
}

interface ReopenTarget {
    periodId: number;
    coachId: number;
    coachName: string;
}

// ---------------------------------------------------------------------------
// Kolom tabel sesi (dipakai dialog finance dan halaman coach)
// ---------------------------------------------------------------------------

function buildItemColumns(options: {
    canManage: boolean;
    locked: boolean;
    onToggleFlag: (coachScheduleId: number, field: FlagField, value: boolean) => void;
}): ColumnDef<PayrollItemRow>[] {
    const { canManage, locked, onToggleFlag } = options;

    const columns: ColumnDef<PayrollItemRow>[] = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => formatDate(row.original.date),
        },
        { accessorKey: 'class_name', header: 'Class' },
        { accessorKey: 'venue_name', header: 'Venue' },
        { accessorKey: 'role_label', header: 'Role' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={`rounded-full border ${getItemStatusStyle(row.original.status)}`}>
                    {getItemStatusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            header: 'Breakdown',
            cell: ({ row }) => {
                const r = row.original;

                if (r.status === 'no_show') {
                    return (
                        <div className="text-xs text-rose-600">
                            No-show {formatRupiah(r.no_show_deduction)}
                        </div>
                    );
                }

                if (r.status !== 'paid') {
                    return <span className="text-xs text-muted-foreground">-</span>;
                }

                return (
                    <div className="space-y-0.5 text-xs">
                        <div>
                            {formatRupiah(r.base_rate)}{' '}
                            <span className="text-muted-foreground">({r.base_rate_note})</span>
                        </div>
                        {r.license_allowance > 0 && (
                            <div className="text-emerald-600">+ License {formatRupiah(r.license_allowance)}</div>
                        )}
                        {r.transport_allowance > 0 && (
                            <div className="text-emerald-600">+ Transport {formatRupiah(r.transport_allowance)}</div>
                        )}
                        {r.late_deduction < 0 && (
                            <div className="text-rose-600">
                                - Late {r.late_minutes}m {formatRupiah(Math.abs(r.late_deduction))}
                            </div>
                        )}
                        {r.attire_deduction < 0 && (
                            <div className="text-rose-600">- Attire {formatRupiah(Math.abs(r.attire_deduction))}</div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'total',
            header: 'Total',
            cell: ({ row }) => (
                <span className={row.original.total < 0 ? 'text-rose-600 font-semibold' : 'font-semibold'}>
                    {formatRupiah(row.original.total)}
                </span>
            ),
        },
    ];

    if (canManage) {
        columns.push({
            id: 'flags',
            header: 'Flag',
            cell: ({ row }) => {
                const r = row.original;
                const hasFlag = !r.attire_compliant || r.manual_present_override;
                const id = r.coach_schedule_id;

                // Item tanpa penugasan (sudah terhapus) atau periode terkunci tidak bisa diubah.
                const disabled = locked || id === null;

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={hasFlag ? 'secondary' : 'outline'}
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={disabled}
                                title={locked ? 'Reopen the payroll to change flags' : undefined}
                            >
                                <IconFlag size={14} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 space-y-3">
                            <label className="flex items-center justify-between gap-2 text-sm">
                                No attire
                                <Switch
                                    checked={!r.attire_compliant}
                                    onCheckedChange={(checked) =>
                                        id !== null && onToggleFlag(id, 'attire_compliant', !checked)
                                    }
                                />
                            </label>
                            {r.status === 'incomplete' && (
                                <label className="flex items-center justify-between gap-2 text-sm">
                                    Manual present
                                    <Switch
                                        checked={r.manual_present_override}
                                        onCheckedChange={(checked) =>
                                            id !== null && onToggleFlag(id, 'manual_present_override', checked)
                                        }
                                    />
                                </label>
                            )}
                        </PopoverContent>
                    </Popover>
                );
            },
        });
    }

    return columns;
}

// ---------------------------------------------------------------------------
// Tampilan rincian satu coach (dipakai dialog finance dan halaman coach)
// ---------------------------------------------------------------------------

interface BreakdownViewProps {
    breakdown: CoachPayrollBreakdown;
    columns: ColumnDef<PayrollItemRow>[];
    canManage: boolean;
    audit: PayrollAuditEntry[];
    isLoadingAudit: boolean;
    isTogglingBonus: boolean;
    onToggleManualBonus: (enabled: boolean) => void;
}

function BreakdownView({
    breakdown,
    columns,
    canManage,
    audit,
    isLoadingAudit,
    isTogglingBonus,
    onToggleManualBonus,
}: BreakdownViewProps) {
    const locked = breakdown.status !== 'draft';
    const sessionsSubtotal =
        breakdown.total_amount - breakdown.discipline_bonus_amount - breakdown.manual_bonus_amount;
    const overLimit = breakdown.reschedule_count > breakdown.reschedule_limit;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <div>
                    <p className="text-sm text-muted-foreground">Total salary</p>
                    <p className="text-2xl font-bold">{formatRupiah(breakdown.total_amount)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge className={`rounded-full border ${getPeriodStatusStyle(breakdown.status)}`}>
                        {getPeriodStatusLabel(breakdown.status, !canManage)}
                    </Badge>
                    {breakdown.paid_at ? (
                        <span className="text-xs text-muted-foreground">Paid {formatDateTime(breakdown.paid_at)}</span>
                    ) : breakdown.finalized_at ? (
                        <span className="text-xs text-muted-foreground">
                            Finalized {formatDateTime(breakdown.finalized_at)}
                        </span>
                    ) : null}
                </div>
            </div>

            {breakdown.upcoming_sessions > 0 && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
                    {breakdown.upcoming_sessions} session(s) have not ended yet. They are not included in the total
                    {canManage ? ' and they block finalizing.' : '.'}
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Sessions subtotal</p>
                    <p className="text-lg font-semibold">{formatRupiah(sessionsSubtotal)}</p>
                    <p className="text-xs text-muted-foreground">{breakdown.total_sessions} evaluated session(s)</p>
                </div>

                <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Discipline bonus</p>
                    <p
                        className={`text-lg font-semibold ${
                            breakdown.discipline_bonus_eligible ? 'text-emerald-600' : 'text-muted-foreground'
                        }`}
                    >
                        {breakdown.discipline_bonus_eligible
                            ? `+${formatRupiah(breakdown.discipline_bonus_amount)}`
                            : 'Not earned'}
                    </p>
                    {breakdown.discipline_bonus_provisional && (
                        <p className="text-xs text-sky-600">Provisional: sessions still pending</p>
                    )}
                    {!breakdown.discipline_bonus_eligible && breakdown.discipline_bonus_reason && (
                        <p className="text-xs text-muted-foreground">
                            {getBonusReasonLabel(breakdown.discipline_bonus_reason)}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Manual bonus</p>
                            <p className="text-lg font-semibold">
                                {breakdown.manual_bonus_enabled ? `+${formatRupiah(breakdown.manual_bonus_amount)}` : 'Off'}
                            </p>
                        </div>
                        {canManage && (
                            <Switch
                                checked={breakdown.manual_bonus_enabled}
                                disabled={locked || !breakdown.period_id || isTogglingBonus}
                                onCheckedChange={onToggleManualBonus}
                            />
                        )}
                    </div>
                    {canManage && !breakdown.period_id && (
                        <p className="text-xs text-muted-foreground">Generate the payroll first</p>
                    )}
                </div>

                <div className="rounded-2xl border p-4">
                    <p className="text-xs text-muted-foreground">Reschedules this month</p>
                    <p className={`text-lg font-semibold ${overLimit ? 'text-rose-600' : ''}`}>
                        {breakdown.reschedule_count} / {breakdown.reschedule_limit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {overLimit ? 'Over the limit: no discipline bonus' : 'Coach requests only'}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="sessions">
                <TabsList>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="reschedules">Reschedules ({breakdown.reschedules.length})</TabsTrigger>
                    {canManage && <TabsTrigger value="history">History</TabsTrigger>}
                </TabsList>

                <TabsContent value="sessions" className="pt-2">
                    <DataTable columns={columns} data={breakdown.items} />
                </TabsContent>

                <TabsContent value="reschedules" className="pt-2">
                    {breakdown.reschedules.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No reschedules this month
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {breakdown.reschedules.map((r) => (
                                <li key={r.id} className="rounded-xl border p-3 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-medium">
                                            {formatDate(r.schedule_date)} {r.class_name ? `- ${r.class_name}` : ''}
                                        </span>
                                        <Badge
                                            className={`rounded-full border ${
                                                r.counts_toward_bonus
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            {getRescheduleTypeLabel(r.type)}
                                            {r.counts_toward_bonus ? ' (counts)' : ''}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {r.role_label}: replaced by {r.to_coach_name ?? 'no replacement'}
                                        {r.created_by_name ? ` | recorded by ${r.created_by_name}` : ''}
                                    </p>
                                    {r.reason && <p className="mt-1 text-xs">Reason: {r.reason}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </TabsContent>

                {canManage && (
                    <TabsContent value="history" className="pt-2">
                        {!breakdown.period_id ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No history yet. Generate the payroll first.
                            </div>
                        ) : isLoadingAudit ? (
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                                ))}
                            </div>
                        ) : audit.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No actions recorded for this period yet
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {audit.map((entry) => {
                                    const description = describeAuditEntry(entry);

                                    return (
                                        <li key={entry.id} className="rounded-xl border p-3 text-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-medium">{getAuditActionLabel(entry.action)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(entry.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                by {entry.user_name ?? 'unknown user'}
                                            </p>
                                            {description && <p className="mt-1 text-xs">{description}</p>}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Halaman
// ---------------------------------------------------------------------------

export default function PayrollPage() {
    const [session, setSession] = useState<Session | null | 'loading'>('loading');

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

    // Finance state
    const [summaries, setSummaries] = useState<CoachPayrollSummary[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [detailCoachId, setDetailCoachId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Breakdown dipakai dialog finance dan halaman coach
    const [breakdown, setBreakdown] = useState<CoachPayrollBreakdown | null>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);

    const [audit, setAudit] = useState<PayrollAuditEntry[]>([]);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [isTogglingBonus, setIsTogglingBonus] = useState(false);

    const [confirmAction, setConfirmAction] = useState<PeriodAction | null>(null);
    const [isActing, setIsActing] = useState(false);

    const [reopenTarget, setReopenTarget] = useState<ReopenTarget | null>(null);
    const [reopenReason, setReopenReason] = useState('');
    const [isReopening, setIsReopening] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<PayrollSetting[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

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

    const isAdmin =
        session !== 'loading' &&
        session !== null &&
        (session.role === 'superadmin' || session.role === 'finance');
    const isCoach = session !== 'loading' && session !== null && session.role === 'coach';

    // -- Fetch -----------------------------------------------------------------

    const fetchSummaries = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingList(true);
        try {
            const { data } = await apiRequest<CoachPayrollSummary[]>('/finance/payroll', {
                query: { month: selectedMonth, year: selectedYear },
            });
            setSummaries(data ?? []);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to load payroll summary'));
        } finally {
            setIsLoadingList(false);
        }
    }, [isAdmin, selectedMonth, selectedYear]);

    const fetchBreakdown = useCallback(
        async (coachId?: number) => {
            setIsLoadingBreakdown(true);
            try {
                const path = isCoach ? '/coach/payroll' : `/finance/payroll/${coachId}`;
                const { data } = await apiRequest<CoachPayrollBreakdown>(path, {
                    query: { month: selectedMonth, year: selectedYear },
                });
                setBreakdown(data);
            } catch (error) {
                console.error(error);
                toast.error(getErrorMessage(error, 'Failed to load payroll breakdown'));
            } finally {
                setIsLoadingBreakdown(false);
            }
        },
        [isCoach, selectedMonth, selectedYear]
    );

    const fetchAudit = useCallback(async (periodId: number) => {
        setIsLoadingAudit(true);
        try {
            const { data } = await apiRequest<PayrollAuditEntry[]>(`/finance/payroll/${periodId}/audit`);
            setAudit(data ?? []);
        } catch (error) {
            console.error(error);
            setAudit([]);
        } finally {
            setIsLoadingAudit(false);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoadingSettings(true);
            const { data } = await apiRequest<PayrollSetting[]>('/finance/payroll-settings');
            setSettings(data ?? []);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to load payroll settings'));
        } finally {
            setIsLoadingSettings(false);
        }
    }, []);

    useEffect(() => {
        if (isSettingsOpen) fetchSettings();
    }, [isSettingsOpen, fetchSettings]);

    useEffect(() => {
        if (isAdmin) fetchSummaries();
    }, [isAdmin, fetchSummaries]);

    useEffect(() => {
        if (isCoach) fetchBreakdown();
    }, [isCoach, fetchBreakdown]);

    useEffect(() => {
        if (isDetailOpen && detailCoachId) {
            fetchBreakdown(detailCoachId);
        }
    }, [isDetailOpen, detailCoachId, fetchBreakdown]);

    // Riwayat dimuat ulang setiap rincian dimuat ulang (setelah aksi apa pun).
    useEffect(() => {
        if (isAdmin && isDetailOpen && breakdown?.period_id) {
            fetchAudit(breakdown.period_id);
        } else {
            setAudit((prev) => (prev.length ? [] : prev));
        }
    }, [isAdmin, isDetailOpen, breakdown, fetchAudit]);

    // -- Settings --------------------------------------------------------------

    const handleSettingChange = (id: number, value: string) => {
        setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value: Number(value) || 0 } : s)));
    };

    const handleSaveSettings = async () => {
        try {
            setIsSavingSettings(true);
            await apiRequest('/finance/payroll-settings', {
                method: 'PUT',
                body: { settings: settings.map((s) => ({ id: s.id, value: s.value })) },
            });
            toast.success('Payroll settings saved successfully');
            setIsSettingsOpen(false);
            // Setting baru langsung memengaruhi semua periode draft.
            await fetchSummaries();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to save payroll settings'));
        } finally {
            setIsSavingSettings(false);
        }
    };

    // -- Aksi finance ----------------------------------------------------------

    const refreshAfterChange = async (coachId: number) => {
        await fetchSummaries();
        if (isDetailOpen && detailCoachId === coachId) {
            await fetchBreakdown(coachId);
        }
    };

    const handleGenerate = async (coachId?: number) => {
        try {
            setIsGenerating(true);
            const { message } = await apiRequest('/finance/payroll/generate', {
                method: 'POST',
                body: {
                    month: Number(selectedMonth),
                    year: Number(selectedYear),
                    coach_id: coachId,
                },
            });

            toast.success(message || 'Payroll generated successfully');
            await fetchSummaries();
            if (coachId) await fetchBreakdown(coachId);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to generate payroll'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        const { kind, periodId, coachId } = confirmAction;

        try {
            setIsActing(true);
            await apiRequest(`/finance/payroll/${periodId}/${kind}`, { method: 'POST' });
            toast.success(kind === 'finalize' ? 'Payroll finalized successfully' : 'Payroll marked as paid');
            setConfirmAction(null);
            await refreshAfterChange(coachId);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Action failed'));
            setConfirmAction(null);
        } finally {
            setIsActing(false);
        }
    };

    const handleReopen = async () => {
        if (!reopenTarget) return;

        const reason = reopenReason.trim();
        if (!reason) {
            toast.error('Please enter a reason for reopening');
            return;
        }

        try {
            setIsReopening(true);
            await apiRequest(`/finance/payroll/${reopenTarget.periodId}/reopen`, {
                method: 'POST',
                body: { reason },
            });
            toast.success('Payroll reopened. It is a draft again.');
            const coachId = reopenTarget.coachId;
            setReopenTarget(null);
            setReopenReason('');
            await refreshAfterChange(coachId);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to reopen payroll'));
        } finally {
            setIsReopening(false);
        }
    };

    const handleToggleFlag = async (coachScheduleId: number, field: FlagField, value: boolean) => {
        try {
            await apiRequest(`/finance/coach-schedule/${coachScheduleId}/payroll-flags`, {
                method: 'PATCH',
                body: { [field]: value },
            });

            toast.success('Flag updated');

            // Rincian draft dihitung langsung di server, jadi angka langsung ikut berubah.
            await Promise.all([
                breakdown ? fetchBreakdown(breakdown.coach_id) : Promise.resolve(),
                fetchSummaries(),
            ]);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update flag'));
        }
    };

    const handleToggleManualBonus = async (enabled: boolean) => {
        if (!breakdown?.period_id) return;

        try {
            setIsTogglingBonus(true);
            await apiRequest(`/finance/payroll/${breakdown.period_id}/manual-bonus`, {
                method: 'PATCH',
                body: { enabled },
            });

            toast.success(enabled ? 'Manual bonus enabled' : 'Manual bonus disabled');
            await Promise.all([fetchBreakdown(breakdown.coach_id), fetchSummaries()]);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update manual bonus'));
        } finally {
            setIsTogglingBonus(false);
        }
    };

    // -- Kolom -----------------------------------------------------------------

    const summaryColumns: ColumnDef<CoachPayrollSummary>[] = [
        { accessorKey: 'coach_name', header: 'Coach' },
        { accessorKey: 'total_sessions', header: 'Sessions' },
        {
            accessorKey: 'upcoming_sessions',
            header: 'Upcoming',
            cell: ({ row }) =>
                row.original.upcoming_sessions > 0 ? (
                    <Badge className={`rounded-full border ${getItemStatusStyle('upcoming')}`}>
                        {row.original.upcoming_sessions}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            accessorKey: 'total_amount',
            header: 'Total Salary',
            cell: ({ row }) => (
                <span className={row.original.total_amount < 0 ? 'font-semibold text-rose-600' : ''}>
                    {formatRupiah(row.original.total_amount)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-1">
                    <Badge className={`rounded-full border ${getPeriodStatusStyle(row.original.status)}`}>
                        {getPeriodStatusLabel(row.original.status)}
                    </Badge>
                    {row.original.status === 'draft' && !row.original.period_id && (
                        <span className="text-xs text-muted-foreground">Not generated</span>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const summary = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                                setDetailCoachId(summary.coach_id);
                                setIsDetailOpen(true);
                            }}
                        >
                            Details
                        </Button>
                        {summary.status === 'draft' && summary.period_id && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-xl"
                                disabled={summary.upcoming_sessions > 0}
                                title={
                                    summary.upcoming_sessions > 0
                                        ? 'Some sessions have not ended yet'
                                        : undefined
                                }
                                onClick={() =>
                                    setConfirmAction({
                                        kind: 'finalize',
                                        periodId: summary.period_id!,
                                        coachId: summary.coach_id,
                                        coachName: summary.coach_name,
                                    })
                                }
                            >
                                <IconLockCheck size={14} className="mr-1" />
                                Finalize
                            </Button>
                        )}
                        {summary.status === 'final' && summary.period_id && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-xl"
                                onClick={() =>
                                    setConfirmAction({
                                        kind: 'mark-paid',
                                        periodId: summary.period_id!,
                                        coachId: summary.coach_id,
                                        coachName: summary.coach_name,
                                    })
                                }
                            >
                                <IconCash size={14} className="mr-1" />
                                Mark paid
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    const financeItemColumns = buildItemColumns({
        canManage: isAdmin,
        locked: breakdown ? breakdown.status !== 'draft' : false,
        onToggleFlag: handleToggleFlag,
    });

    const coachItemColumns = buildItemColumns({
        canManage: false,
        locked: true,
        onToggleFlag: handleToggleFlag,
    });

    if (session === 'loading') {
        return <div className="px-6 py-8">Loading...</div>;
    }

    return (
        <div className="px-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((y) => (
                                <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Payroll Settings"
                        >
                            <IconSettings size={18} />
                        </Button>

                        <Button
                            onClick={() => handleGenerate()}
                            disabled={isGenerating}
                            className="rounded-xl"
                        >
                            <IconRefresh size={16} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Generating...' : 'Generate This Month\'s Payroll'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Finance: ringkasan semua coach */}
            {isAdmin && (
                isLoadingList ? (
                    <DataTableSkeleton columns={6} rows={6} />
                ) : (
                    <DataTable columns={summaryColumns} data={summaries} />
                )
            )}

            {/* Coach: rincian gaji sendiri */}
            {isCoach && (
                <div className="space-y-4">
                    {isLoadingBreakdown ? (
                        <DataTableSkeleton columns={7} rows={6} />
                    ) : breakdown ? (
                        <BreakdownView
                            breakdown={breakdown}
                            columns={coachItemColumns}
                            canManage={false}
                            audit={[]}
                            isLoadingAudit={false}
                            isTogglingBonus={false}
                            onToggleManualBonus={() => undefined}
                        />
                    ) : (
                        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                            No payroll data for this period yet
                        </div>
                    )}
                </div>
            )}

            {/* Finance: dialog rincian per coach */}
            {isAdmin && (
                <Dialog
                    open={isDetailOpen}
                    onOpenChange={(open) => {
                        setIsDetailOpen(open);
                        if (!open) {
                            setDetailCoachId(null);
                            setBreakdown(null);
                            setAudit([]);
                        }
                    }}
                >
                    <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Payroll Details - {breakdown?.coach_name ?? ''}</DialogTitle>
                            <DialogDescription>
                                Amounts for a draft are calculated live. Finalize recalculates one last time before locking.
                            </DialogDescription>
                        </DialogHeader>

                        {isLoadingBreakdown && !breakdown ? (
                            <DataTableSkeleton columns={8} rows={5} />
                        ) : breakdown ? (
                            <BreakdownView
                                breakdown={breakdown}
                                columns={financeItemColumns}
                                canManage
                                audit={audit}
                                isLoadingAudit={isLoadingAudit}
                                isTogglingBonus={isTogglingBonus}
                                onToggleManualBonus={handleToggleManualBonus}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">No data</p>
                        )}

                        <DialogFooter className="gap-2 sm:gap-2">
                            {breakdown?.status === 'draft' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        disabled={isGenerating}
                                        onClick={() => detailCoachId && handleGenerate(detailCoachId)}
                                    >
                                        <IconRefresh size={16} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                        Regenerate
                                    </Button>
                                    {breakdown.period_id && (
                                        <Button
                                            variant="secondary"
                                            className="rounded-xl"
                                            disabled={breakdown.upcoming_sessions > 0}
                                            title={
                                                breakdown.upcoming_sessions > 0
                                                    ? 'Some sessions have not ended yet'
                                                    : undefined
                                            }
                                            onClick={() =>
                                                setConfirmAction({
                                                    kind: 'finalize',
                                                    periodId: breakdown.period_id!,
                                                    coachId: breakdown.coach_id,
                                                    coachName: breakdown.coach_name,
                                                })
                                            }
                                        >
                                            <IconLockCheck size={16} className="mr-2" />
                                            Finalize
                                        </Button>
                                    )}
                                </>
                            )}

                            {breakdown?.status === 'final' && breakdown.period_id && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() =>
                                            setReopenTarget({
                                                periodId: breakdown.period_id!,
                                                coachId: breakdown.coach_id,
                                                coachName: breakdown.coach_name,
                                            })
                                        }
                                    >
                                        <IconLockOpen size={16} className="mr-2" />
                                        Reopen
                                    </Button>
                                    <Button
                                        className="rounded-xl"
                                        onClick={() =>
                                            setConfirmAction({
                                                kind: 'mark-paid',
                                                periodId: breakdown.period_id!,
                                                coachId: breakdown.coach_id,
                                                coachName: breakdown.coach_name,
                                            })
                                        }
                                    >
                                        <IconCash size={16} className="mr-2" />
                                        Mark as paid
                                    </Button>
                                </>
                            )}

                            <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Finance: konfirmasi finalize / mark paid */}
            {isAdmin && (
                <AlertDialog
                    open={confirmAction !== null}
                    onOpenChange={(open) => {
                        if (!open && !isActing) setConfirmAction(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {confirmAction?.kind === 'finalize' ? 'Finalize payroll?' : 'Mark payroll as paid?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmAction?.kind === 'finalize'
                                    ? `Amounts for ${confirmAction?.coachName ?? 'this coach'} are recalculated one last time, then locked. A finalized payroll can only be changed by reopening it.`
                                    : `This confirms that ${confirmAction?.coachName ?? 'this coach'} has been paid. A paid payroll cannot be reopened.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isActing}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={isActing}
                                onClick={(event) => {
                                    event.preventDefault();
                                    void handleConfirmAction();
                                }}
                            >
                                {isActing ? 'Processing...' : 'Confirm'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Finance: buka kembali payroll final */}
            {isAdmin && (
                <Dialog
                    open={reopenTarget !== null}
                    onOpenChange={(open) => {
                        if (!open && !isReopening) {
                            setReopenTarget(null);
                            setReopenReason('');
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reopen payroll</DialogTitle>
                            <DialogDescription>
                                {reopenTarget?.coachName ?? 'This coach'}&apos;s payroll goes back to draft so it can be
                                corrected. The reason is recorded in the history.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="reopen-reason">Reason</Label>
                            <Textarea
                                id="reopen-reason"
                                value={reopenReason}
                                maxLength={500}
                                placeholder="Why does this payroll need to be reopened?"
                                onChange={(e) => setReopenReason(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                disabled={isReopening}
                                onClick={() => {
                                    setReopenTarget(null);
                                    setReopenReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleReopen} disabled={isReopening || !reopenReason.trim()}>
                                {isReopening ? 'Reopening...' : 'Reopen'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Finance: pengaturan payroll */}
            {isAdmin && (
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Payroll Settings</DialogTitle>
                            <DialogDescription>
                                Changes apply immediately to every payroll that is still <strong>Draft</strong>.
                                Periods already <strong>Final</strong> or <strong>Paid</strong> will not change.
                            </DialogDescription>
                        </DialogHeader>

                        {isLoadingSettings ? (
                            <div className="space-y-3 py-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                                ))}
                            </div>
                        ) : (
                            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
                                {settings.map((setting) => (
                                    <div key={setting.id} className="space-y-1">
                                        <Label htmlFor={`setting-${setting.id}`}>{setting.label}</Label>
                                        {setting.description && (
                                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                                        )}
                                        <Input
                                            id={`setting-${setting.id}`}
                                            type="number"
                                            min={0}
                                            value={setting.value}
                                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveSettings} disabled={isSavingSettings || isLoadingSettings}>
                                {isSavingSettings ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}