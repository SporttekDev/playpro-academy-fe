'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IconAlertTriangle, IconDownload } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, getErrorMessage } from '@/lib/api';
import { YEARS, currentYear, formatRupiah, getPeriodStatusStyle } from '@/lib/payroll';
import {
    EXCEL_MIME,
    ExpenseMonthDetail,
    ExpenseOverview,
    ExpenseTotals,
    MONTH_NAMES,
    MONTH_SHORT,
    downloadFile,
    expenseExcelFilename,
    formatCompactRupiah,
    getExpenseStatusLabel,
} from '@/lib/payroll-expenses';

type Session = { name?: string; role?: string } | null | 'loading';

interface ChartPoint {
    name: string;
    net: number;
    advance: number;
    gross: number;
}

// Warna grafik: seri 1 (biru) = dibayarkan ke coach, seri 2 (oranye) = kasbon.
// Sudah divalidasi (kontras, jarak warna untuk buta warna) untuk mode terang dan gelap.
const VIZ_CSS = `
.exp-viz { --exp-net: #2a78d6; --exp-adv: #eb6834; --exp-gap: #fcfcfb; }
.dark .exp-viz { --exp-net: #3987e5; --exp-adv: #d95926; --exp-gap: #1a1a19; }
`;

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0].payload;

    return (
        <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-md">
            <div className="mb-1 font-semibold">{point.name}</div>
            <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Salary expense (before advances)</span>
                <span className="font-semibold">{formatRupiah(point.gross)}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="inline-block size-2 rounded-sm" style={{ background: 'var(--exp-net)' }} />
                    Paid to coaches
                </span>
                <span>{formatRupiah(point.net)}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="inline-block size-2 rounded-sm" style={{ background: 'var(--exp-adv)' }} />
                    Cash advances deducted
                </span>
                <span>{formatRupiah(point.advance)}</span>
            </div>
        </div>
    );
}

function StatusChips({ counts }: { counts: ExpenseTotals['status_counts'] }) {
    const entries = (['paid', 'final', 'draft'] as const).filter((s) => counts[s] > 0);
    if (entries.length === 0) return <span className="text-muted-foreground">-</span>;

    return (
        <div className="flex flex-wrap gap-1">
            {entries.map((s) => (
                <Badge key={s} variant="outline" className={`rounded-lg text-[11px] ${getPeriodStatusStyle(s)}`}>
                    {counts[s]} {s === 'draft' ? 'draft' : s === 'final' ? 'final' : 'paid'}
                </Badge>
            ))}
        </div>
    );
}

function StatCard({ label, value, hint, emphasis }: { label: string; value: string; hint?: string; emphasis?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 ${emphasis ? 'bg-muted/40' : ''}`}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`mt-1 font-semibold tabular-nums ${emphasis ? 'text-2xl' : 'text-xl'}`}>{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
    );
}

export default function PayrollExpensesPage() {
    const [session, setSession] = useState<Session>('loading');
    const [year, setYear] = useState(String(currentYear));
    const [includeDraft, setIncludeDraft] = useState(false);
    const [overview, setOverview] = useState<ExpenseOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const [detailMonth, setDetailMonth] = useState<number | null>(null);
    const [detail, setDetail] = useState<ExpenseMonthDetail | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    useEffect(() => {
        const sessionString = Cookies.get('session_key');
        if (!sessionString) {
            setSession(null);
            return;
        }

        try {
            setSession(JSON.parse(sessionString));
        } catch {
            setSession(null);
        }
    }, []);

    const canView = session !== 'loading' && session !== null && (session.role === 'finance' || session.role === 'superadmin');

    const query = useMemo(() => ({ year, include_draft: includeDraft ? '1' : '0' }), [year, includeDraft]);

    const fetchOverview = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiRequest<ExpenseOverview>('/finance/payroll-expenses', { query });
            setOverview(data ?? null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load salary expense report'));
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        if (canView) fetchOverview();
    }, [canView, fetchOverview]);

    useEffect(() => {
        if (detailMonth === null) {
            setDetail(null);
            return;
        }

        let cancelled = false;
        setIsLoadingDetail(true);
        setDetail(null);

        apiRequest<ExpenseMonthDetail>(`/finance/payroll-expenses/${detailMonth}`, { query })
            .then(({ data }) => {
                if (!cancelled) setDetail(data ?? null);
            })
            .catch((error) => {
                if (!cancelled) toast.error(getErrorMessage(error, 'Failed to load month details'));
            })
            .finally(() => {
                if (!cancelled) setIsLoadingDetail(false);
            });

        return () => {
            cancelled = true;
        };
    }, [detailMonth, query]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const params = new URLSearchParams(query).toString();
            await downloadFile(
                `/finance/payroll-expenses/export?${params}`,
                expenseExcelFilename(Number(year), includeDraft),
                EXCEL_MIME
            );
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to download Excel'));
        } finally {
            setIsDownloading(false);
        }
    };

    const chartData: ChartPoint[] = useMemo(
        () =>
            (overview?.months ?? []).map((m) => ({
                name: MONTH_SHORT[m.month - 1],
                net: m.net,
                advance: m.advance,
                gross: m.gross,
            })),
        [overview]
    );

    if (session === 'loading') {
        return <div className="px-6 py-8">Loading...</div>;
    }

    if (!canView) {
        return (
            <div className="px-6">
                <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    This page is only available to finance.
                </div>
            </div>
        );
    }

    const totals = overview?.totals;
    const maxBranchGross = Math.max(...(overview?.branches ?? []).map((b) => b.gross), 1);
    const hasData = (totals?.period_count ?? 0) > 0;
    const unpaid = totals ? totals.gross_by_status.final + totals.gross_by_status.draft : 0;

    return (
        <div className="exp-viz px-6 space-y-5">
            <style>{VIZ_CSS}</style>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Coach Salary Expenses</h1>
                    <p className="text-sm text-muted-foreground">
                        By work month and by branch. The main figure is salary expense before cash advance deductions.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <Switch checked={includeDraft} onCheckedChange={setIncludeDraft} />
                        Include drafts (estimate)
                    </label>

                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-28 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((y) => (
                                <SelectItem key={y.value} value={y.value}>
                                    {y.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleDownload}
                        disabled={isDownloading || isLoading}
                    >
                        <IconDownload size={16} className="mr-1" />
                        {isDownloading ? 'Downloading...' : 'Download Excel'}
                    </Button>
                </div>
            </div>

            {isLoading || !overview || !totals ? (
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-72 rounded-2xl" />
                </div>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            emphasis
                            label={`Salary expense ${overview.year} (before advances)`}
                            value={formatRupiah(totals.gross)}
                            hint={`${totals.coach_count} coaches, ${totals.session_count} sessions`}
                        />
                        <StatCard
                            label="Cash advances deducted"
                            value={formatRupiah(totals.advance)}
                            hint="Deducted from coach pay"
                        />
                        <StatCard
                            label="Paid to coaches (net)"
                            value={formatRupiah(totals.net)}
                            hint="Salary expense minus advances"
                        />
                        <StatCard
                            label="Unpaid"
                            value={formatRupiah(unpaid)}
                            hint={`Final ${formatRupiah(totals.gross_by_status.final)} | Draft ${formatRupiah(totals.gross_by_status.draft)}`}
                        />
                    </div>

                    {includeDraft && totals.gross_by_status.draft > 0 && (
                        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                            <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
                            <span>
                                These figures include {formatRupiah(totals.gross_by_status.draft)} from draft periods. That is an
                                estimate from the last generate and may change until payroll is finalized.
                            </span>
                        </div>
                    )}

                    {overview.not_generated_total > 0 && (
                        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                            <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
                            <span>
                                Some coaches have scheduled sessions but no payroll generated yet (see the Not generated
                                column in the monthly table). Their pay is not included in this report yet.
                            </span>
                        </div>
                    )}

                    {overview.reconciliation.adjustment_total !== 0 && (
                        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
                            <span>
                                {overview.reconciliation.periods.length} period(s) have a total that does not match the sum of
                                their session items and bonuses (difference {formatRupiah(overview.reconciliation.adjustment_total)}).
                                The difference is kept as an adjustment row in the Excel export so the totals stay correct.
                            </span>
                        </div>
                    )}

                    {!hasData ? (
                        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                            No finalized or paid payroll in {overview.year} yet.
                            {!includeDraft && ' Turn on "Include drafts" to see estimates.'}
                        </div>
                    ) : (
                        <>
                            <section className="rounded-2xl border p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-sm font-semibold">Salary expense per month</h2>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block size-2.5 rounded-sm" style={{ background: 'var(--exp-net)' }} />
                                            Paid to coaches
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block size-2.5 rounded-sm" style={{ background: 'var(--exp-adv)' }} />
                                            Cash advances deducted
                                        </span>
                                    </div>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={12}
                                                width={56}
                                                tickFormatter={(v: number) => formatCompactRupiah(v)}
                                            />
                                            <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.06 }} content={<ChartTooltip />} />
                                            <Bar
                                                dataKey="net"
                                                stackId="gross"
                                                fill="var(--exp-net)"
                                                stroke="var(--exp-gap)"
                                                strokeWidth={2}
                                                maxBarSize={36}
                                                isAnimationActive={false}
                                            />
                                            <Bar
                                                dataKey="advance"
                                                stackId="gross"
                                                fill="var(--exp-adv)"
                                                stroke="var(--exp-gap)"
                                                strokeWidth={2}
                                                radius={[4, 4, 0, 0]}
                                                maxBarSize={36}
                                                isAnimationActive={false}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            <section className="rounded-2xl border p-4">
                                <h2 className="mb-1 text-sm font-semibold">By branch ({overview.year})</h2>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Discipline bonus is split by the number of paid sessions per branch, other bonus
                                    proportionally to paid sessions. Cash advances are not allocated to branches.
                                </p>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Branch</TableHead>
                                            <TableHead className="text-right">Coach</TableHead>
                                            <TableHead className="text-right">Sessions</TableHead>
                                            <TableHead className="text-right">Session pay</TableHead>
                                            <TableHead className="text-right">Discipline bonus</TableHead>
                                            <TableHead className="text-right">Other bonus</TableHead>
                                            <TableHead className="text-right">Salary expense</TableHead>
                                            <TableHead className="w-40">Share</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overview.branches.map((b) => (
                                            <TableRow key={b.branch_id ?? 'none'}>
                                                <TableCell className="font-medium">
                                                    {b.branch_name}
                                                    {b.branch_deleted && (
                                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                            (branch deleted)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">{b.coach_count}</TableCell>
                                                <TableCell className="text-right tabular-nums">{b.session_count}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatRupiah(b.sessions_total)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatRupiah(b.discipline)}</TableCell>
                                                <TableCell className="text-right tabular-nums">{formatRupiah(b.manual)}</TableCell>
                                                <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(b.gross)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.max((b.gross / maxBranchGross) * 100, 2)}%`,
                                                                    background: 'var(--exp-net)',
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                                                            {totals.gross > 0 ? Math.round((b.gross / totals.gross) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </section>

                            <section className="rounded-2xl border p-4">
                                <h2 className="mb-3 text-sm font-semibold">By work month</h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead className="text-right">Coach</TableHead>
                                            <TableHead className="text-right">Salary expense</TableHead>
                                            <TableHead className="text-right">Advances</TableHead>
                                            <TableHead className="text-right">Paid out</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Not generated</TableHead>
                                            <TableHead className="w-24" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overview.months.map((m) => {
                                            const empty = m.period_count === 0;
                                            return (
                                                <TableRow
                                                    key={m.month}
                                                    className={empty ? 'text-muted-foreground' : 'cursor-pointer'}
                                                    onClick={() => !empty && setDetailMonth(m.month)}
                                                >
                                                    <TableCell className="font-medium">{MONTH_NAMES[m.month - 1]}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{empty ? '-' : m.coach_count}</TableCell>
                                                    <TableCell className="text-right font-semibold tabular-nums">
                                                        {empty ? '-' : formatRupiah(m.gross)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {empty ? '-' : formatRupiah(m.advance)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {empty ? '-' : formatRupiah(m.net)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusChips counts={m.status_counts} />
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right tabular-nums ${m.not_generated > 0 ? 'font-medium text-amber-600' : 'text-muted-foreground'}`}
                                                    >
                                                        {m.not_generated > 0 ? `${m.not_generated} coach(es)` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!empty && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-xl"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDetailMonth(m.month);
                                                                }}
                                                            >
                                                                Details
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell>Total {overview.year}</TableCell>
                                            <TableCell className="text-right tabular-nums">{totals.coach_count}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatRupiah(totals.gross)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatRupiah(totals.advance)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatRupiah(totals.net)}</TableCell>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </section>
                        </>
                    )}
                </>
            )}

            <Dialog open={detailMonth !== null} onOpenChange={(open) => !open && setDetailMonth(null)}>
                {/* min-w-0 pada anak langsung: DialogContent adalah grid; tanpa ini tabel lebar mendorong dialog melebihi layar. */}
                <DialogContent className="exp-viz w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
                    <DialogHeader>
                        <DialogTitle>
                            Salary expense {detailMonth ? MONTH_NAMES[detailMonth - 1] : ''} {year}
                        </DialogTitle>
                        <DialogDescription>
                            Same work month basis as the Payroll page.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetail || !detail ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 rounded-2xl" />
                            <Skeleton className="h-48 rounded-2xl" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <StatCard label="Salary expense (before advances)" value={formatRupiah(detail.totals.gross)} emphasis />
                                <StatCard label="Cash advances deducted" value={formatRupiah(detail.totals.advance)} />
                                <StatCard label="Paid to coaches" value={formatRupiah(detail.totals.net)} />
                            </div>

                            {detail.not_generated > 0 && (
                                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                    <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
                                    <span>
                                        {detail.not_generated} coach(es) have sessions this month but no payroll generated yet,
                                        so they are not included in these figures.
                                    </span>
                                </div>
                            )}

                            <Tabs defaultValue="branch">
                                <TabsList>
                                    <TabsTrigger value="branch">By Branch</TabsTrigger>
                                    <TabsTrigger value="coach">By Coach</TabsTrigger>
                                    <TabsTrigger value="advance">Advances</TabsTrigger>
                                </TabsList>

                                <TabsContent value="branch">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Branch</TableHead>
                                                <TableHead className="text-right">Coach</TableHead>
                                                <TableHead className="text-right">Sessions</TableHead>
                                                <TableHead className="text-right">Session pay</TableHead>
                                                <TableHead className="text-right">Discipline bonus</TableHead>
                                                <TableHead className="text-right">Other bonus</TableHead>
                                                <TableHead className="text-right">Salary expense</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detail.branches.map((b) => (
                                                <TableRow key={b.branch_id ?? 'none'}>
                                                    <TableCell className="font-medium">{b.branch_name}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{b.coach_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{b.session_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(b.sessions_total)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(b.discipline)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(b.manual)}</TableCell>
                                                    <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(b.gross)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="coach">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coach</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Sessions</TableHead>
                                                <TableHead className="text-right">Session pay</TableHead>
                                                <TableHead className="text-right">Bonus</TableHead>
                                                <TableHead className="text-right">Salary expense</TableHead>
                                                <TableHead className="text-right">Advances</TableHead>
                                                <TableHead className="text-right">Paid out</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detail.coaches.map((c) => (
                                                <TableRow key={c.period_id}>
                                                    <TableCell className="whitespace-normal">
                                                        <div className="font-medium">{c.coach_name}</div>
                                                        {c.branches.length > 1 && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {c.branches
                                                                    .map((b) => `${b.branch_name} ${formatRupiah(b.amount)}`)
                                                                    .join(' | ')}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`rounded-lg text-[11px] ${getPeriodStatusStyle(c.status)}`}
                                                        >
                                                            {getExpenseStatusLabel(c.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">{c.session_count}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(c.sessions_total)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {formatRupiah(c.discipline + c.manual)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(c.gross)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(c.advance)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{formatRupiah(c.net)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="advance">
                                    {detail.advances.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            No cash advances this month.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Requested</TableHead>
                                                    <TableHead className="text-right">Deducted</TableHead>
                                                    <TableHead className="text-right">Not deducted</TableHead>
                                                    <TableHead>Note</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detail.advances.map((a) => (
                                                    <TableRow key={a.period_id}>
                                                        <TableCell className="font-medium">{a.coach_name}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={`rounded-lg text-[11px] ${getPeriodStatusStyle(a.status)}`}
                                                            >
                                                                {getExpenseStatusLabel(a.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">{formatRupiah(a.requested)}</TableCell>
                                                        <TableCell className="text-right tabular-nums">{formatRupiah(a.applied)}</TableCell>
                                                        <TableCell className="text-right tabular-nums">{formatRupiah(a.not_recovered)}</TableCell>
                                                        <TableCell className="max-w-56 whitespace-normal text-xs text-muted-foreground">
                                                            {a.note ?? '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}