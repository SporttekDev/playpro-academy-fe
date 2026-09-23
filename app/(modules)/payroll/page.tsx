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
import { IconRefresh, IconLockCheck, IconFlag, IconSettings } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Session {
    id: number;
    name: string;
    role: 'admin' | 'coach' | 'parent';
}

interface CoachPayrollSummary {
    coach_id: number;
    coach_name: string;
    period_id: number | null;
    total_sessions: number;
    total_amount: number;
    status: 'draft' | 'final' | 'paid';
}

interface PayrollItemRow {
    coach_schedule_id: number;
    schedule_id: number;
    class_name: string;
    venue_name: string;
    date: string;
    role_label: string;
    status: 'no_show' | 'incomplete' | 'paid';
    base_rate: number;
    base_rate_note: string | null;
    license_allowance: number;
    transport_allowance: number;
    late_minutes: number;
    late_deduction: number;
    attire_deduction: number;
    no_show_deduction: number;
    total: number;
    attire_compliant: boolean;
    manual_present_override: boolean;
}

interface CoachPayrollBreakdown {
    coach_id: number;
    coach_name: string;
    period_id: number | null;
    status: 'draft' | 'final' | 'paid';
    total_sessions: number;
    total_amount: number;
    items: PayrollItemRow[];
}

interface PayrollSetting {
    id: number;
    key: string;
    value: number;
    label: string;
    description: string | null;
}

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatRupiah(amount: number) {
    const sign = amount < 0 ? '-' : '';
    return `${sign}Rp${Math.abs(amount).toLocaleString('id-ID')}`;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(date));
}

function getPeriodStatusStyle(status: string) {
    switch (status) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'final':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        default:
            return 'bg-amber-50 text-amber-600 border-amber-200';
    }
}

function getItemStatusStyle(status: string) {
    switch (status) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'incomplete':
            return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'no_show':
            return 'bg-rose-50 text-rose-600 border-rose-200';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

function getItemStatusLabel(status: string) {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'incomplete':
            return 'Not Checked Out';
        case 'no_show':
            return 'No Show';
        default:
            return status;
    }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function PayrollPage() {
    const [session, setSession] = useState<Session | null | 'loading'>('loading');

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

    // Admin state
    const [summaries, setSummaries] = useState<CoachPayrollSummary[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [detailCoachId, setDetailCoachId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Shared breakdown state (used for admin dialog & coach full page)
    const [breakdown, setBreakdown] = useState<CoachPayrollBreakdown | null>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);

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

    const isAdmin = session !== 'loading' && session !== null && session.role === 'admin';
    const isCoach = session !== 'loading' && session !== null && session.role === 'coach';

    // ── Admin: fetch summary list ──────────────────────────
    const fetchSummaries = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingList(true);
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            params.append('month', selectedMonth);
            params.append('year', selectedYear);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/payroll?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );
            if (!response.ok) throw new Error('Failed to fetch payroll summary');
            const { data } = await response.json();
            setSummaries(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payroll summary');
        } finally {
            setIsLoadingList(false);
        }
    }, [isAdmin, selectedMonth, selectedYear]);

    // ── Fetch breakdown (used for admin dialog & coach self page) ──
    const fetchBreakdown = useCallback(
        async (coachId?: number) => {
            setIsLoadingBreakdown(true);
            try {
                const token = Cookies.get('token');
                const params = new URLSearchParams();
                params.append('month', selectedMonth);
                params.append('year', selectedYear);

                const endpoint = isCoach
                    ? `${process.env.NEXT_PUBLIC_API_URL}/coach/payroll?${params.toString()}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/admin/payroll/${coachId}?${params.toString()}`;

                const response = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                });
                if (!response.ok) throw new Error('Failed to fetch payroll breakdown');
                const { data } = await response.json();
                setBreakdown(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load payroll breakdown');
            } finally {
                setIsLoadingBreakdown(false);
            }
        },
        [isCoach, selectedMonth, selectedYear]
    );

    const fetchSettings = useCallback(async () => {
        try {
            setIsLoadingSettings(true);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payroll-settings`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch settings');
            const { data } = await response.json();
            setSettings(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payroll settings');
        } finally {
            setIsLoadingSettings(false);
        }
    }, []);

    const handleSettingChange = (id: number, value: string) => {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, value: Number(value) || 0 } : s))
        );
    };

    const handleSaveSettings = async () => {
        try {
            setIsSavingSettings(true);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payroll-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    settings: settings.map((s) => ({ id: s.id, value: s.value })),
                }),
            });
            if (!response.ok) throw new Error('Failed to update settings');
            toast.success('Payroll settings saved successfully');
            setIsSettingsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save payroll settings');
        } finally {
            setIsSavingSettings(false);
        }
    };

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

    // ── Admin actions ───────────────────────────────────────
    const handleGenerate = async (coachId?: number) => {
        try {
            setIsGenerating(true);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payroll/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    month: Number(selectedMonth),
                    year: Number(selectedYear),
                    coach_id: coachId,
                }),
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json?.message ?? 'Failed to generate payroll');

            toast.success(json?.message ?? 'Payroll generated successfully');
            await fetchSummaries();
            if (coachId) await fetchBreakdown(coachId);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate payroll');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFinalize = async (periodId: number) => {
        if (!window.confirm('Finalize this payroll? Once finalized, its details can no longer be regenerated.')) {
            return;
        }
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payroll/${periodId}/finalize`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json?.message ?? 'Failed to finalize payroll');

            toast.success('Payroll finalized successfully');
            await fetchSummaries();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Failed to finalize payroll');
        }
    };

    const handleToggleFlag = async (
        coachScheduleId: number,
        field: 'attire_compliant' | 'manual_present_override',
        value: boolean
    ) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/coach-schedule/${coachScheduleId}/payroll-flags`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ [field]: value }),
                }
            );
            if (!response.ok) throw new Error('Failed to update flag');

            // Optimistic local update, numbers stay in sync after "Regenerate"
            setBreakdown((prev) =>
                prev
                    ? {
                        ...prev,
                        items: prev.items.map((item) =>
                            item.coach_schedule_id === coachScheduleId ? { ...item, [field]: value } : item
                        ),
                    }
                    : prev
            );
            toast.success('Flagged. Click "Regenerate" to update the amount.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to flag session');
        }
    };

    // ── Columns: admin summary list ──────────────────────────
    const summaryColumns: ColumnDef<CoachPayrollSummary>[] = [
        { accessorKey: 'coach_name', header: 'Coach' },
        { accessorKey: 'total_sessions', header: 'Paid Sessions' },
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
                <Badge className={`rounded-full border ${getPeriodStatusStyle(row.original.status)}`}>
                    {row.original.status === 'draft' ? 'Draft' : row.original.status === 'final' ? 'Final' : 'Paid'}
                </Badge>
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
                                onClick={() => handleFinalize(summary.period_id!)}
                            >
                                <IconLockCheck size={14} className="mr-1" />
                                Finalize
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    // ── Columns: item breakdown (used in admin dialog & coach page) ──
    const itemColumns: ColumnDef<PayrollItemRow>[] = [
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
        ...(isAdmin
            ? ([
                {
                    id: 'flags',
                    header: 'Flag',
                    cell: ({ row }) => {
                        const r = row.original;
                        const hasFlag = !r.attire_compliant || r.manual_present_override;

                        return (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={hasFlag ? 'secondary' : 'outline'}
                                        size="icon"
                                        className="h-8 w-8 rounded-lg"
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
                                                handleToggleFlag(r.coach_schedule_id, 'attire_compliant', !checked)
                                            }
                                        />
                                    </label>
                                    {r.status === 'incomplete' && (
                                        <label className="flex items-center justify-between gap-2 text-sm">
                                            Manual present
                                            <Switch
                                                checked={r.manual_present_override}
                                                onCheckedChange={(checked) =>
                                                    handleToggleFlag(
                                                        r.coach_schedule_id,
                                                        'manual_present_override',
                                                        checked
                                                    )
                                                }
                                            />
                                        </label>
                                    )}
                                </PopoverContent>
                            </Popover>
                        );
                    },
                },
            ] as ColumnDef<PayrollItemRow>[])
            : []),
    ];

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

            {/* Admin: summary table for all coaches */}
            {isAdmin && (
                isLoadingList ? (
                    <DataTableSkeleton columns={5} rows={6} />
                ) : (
                    <DataTable columns={summaryColumns} data={summaries} />
                )
            )}

            {/* Coach: own payroll breakdown shown directly */}
            {isCoach && (
                <div className="space-y-4">
                    {isLoadingBreakdown ? (
                        <DataTableSkeleton columns={7} rows={6} />
                    ) : breakdown ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total salary this period</p>
                                    <p className="text-2xl font-bold">{formatRupiah(breakdown.total_amount)}</p>
                                </div>
                                <Badge className={`rounded-full border ${getPeriodStatusStyle(breakdown.status)}`}>
                                    {breakdown.status === 'draft'
                                        ? 'Estimate (not finalized)'
                                        : breakdown.status === 'final'
                                            ? 'Final'
                                            : 'Paid'}
                                </Badge>
                            </div>
                            <DataTable columns={itemColumns} data={breakdown.items} />
                        </>
                    ) : (
                        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                            No payroll data for this period yet
                        </div>
                    )}
                </div>
            )}

            {/* Admin: per-coach detail dialog */}
            {isAdmin && (
                <Dialog
                    open={isDetailOpen}
                    onOpenChange={(open) => {
                        setIsDetailOpen(open);
                        if (!open) {
                            setDetailCoachId(null);
                            setBreakdown(null);
                        }
                    }}
                >
                    <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Payroll Details — {breakdown?.coach_name ?? ''}</DialogTitle>
                            <DialogDescription>
                                Flag a session, then click &quot;Regenerate&quot; to update the amount.
                            </DialogDescription>
                        </DialogHeader>

                        {isLoadingBreakdown ? (
                            <DataTableSkeleton columns={8} rows={5} />
                        ) : breakdown ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total salary</p>
                                        <p className="text-xl font-bold">{formatRupiah(breakdown.total_amount)}</p>
                                    </div>
                                    <Badge className={`rounded-full border ${getPeriodStatusStyle(breakdown.status)}`}>
                                        {breakdown.status}
                                    </Badge>
                                </div>
                                <DataTable columns={itemColumns} data={breakdown.items} />
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data</p>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                disabled={isGenerating || (breakdown ? breakdown.status !== 'draft' : false)}
                                onClick={() => detailCoachId && handleGenerate(detailCoachId)}
                            >
                                <IconRefresh size={16} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                Regenerate
                            </Button>
                            <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Admin: payroll settings dialog */}
            {isAdmin && (
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Payroll Settings</DialogTitle>
                            <DialogDescription>
                                Changes here only apply to payroll regenerated afterward — periods already{' '}
                                <strong>Final</strong>/<strong>Paid</strong> will not change.
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