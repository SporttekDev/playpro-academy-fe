'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { IconCopy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TimeInput } from '@/components/ui/time-input';
import { DatePicker } from '@/components/date-picker';
import { apiRequest, getErrorMessage } from '@/lib/api';

const MAX_ITEMS = 200;
const MAX_RANGE_DAYS = 93;
const DEFAULT_QUOTA = 15;

// Urutan tampilan Senin..Minggu; nilai = Date.getDay() (0 = Minggu).
const DAYS: { value: number; label: string }[] = [
    { value: 1, label: 'Sen' },
    { value: 2, label: 'Sel' },
    { value: 3, label: 'Rab' },
    { value: 4, label: 'Kam' },
    { value: 5, label: 'Jum' },
    { value: 6, label: 'Sab' },
    { value: 0, label: 'Min' },
];

const SKIP_REASONS: Record<string, string> = {
    already_exists: 'Already exists',
    duplicate_in_request: 'Duplicate in this input',
    invalid_time: 'End time must be after start time',
    venue_branch_mismatch: 'Venue does not belong to the class branch',
};

export interface BulkClassOption {
    id: string | number;
    name: string;
    branch_id: string | number;
}

export interface BulkVenueOption {
    id: string | number;
    name: string;
    branch: { id: string | number };
}

interface Rule {
    key: string;
    class_id: string;
    venue_id: string;
    days: number[];
    start_time: string;
    end_time: string;
    quota: number;
}

interface PreviewItem {
    id: string;
    class_id: string;
    venue_id: string;
    date: string;
    start_time: string;
    end_time: string;
    quota: number;
}

interface SkippedItem {
    index: number;
    date: string;
    start_time: string;
    end_time: string;
    class: string;
    venue: string;
    reason: string;
}

interface BulkResult {
    created: number;
    skipped: SkippedItem[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: BulkClassOption[];
    venues: BulkVenueOption[];
    /** Dipanggil setelah ada jadwal yang berhasil dibuat, untuk memuat ulang daftar. */
    onCreated: () => void;
}

let ruleCounter = 0;
const newRule = (base?: Partial<Rule>): Rule => ({
    class_id: '',
    venue_id: '',
    days: [],
    start_time: '',
    end_time: '',
    quota: DEFAULT_QUOTA,
    ...base,
    // Selalu key baru, termasuk saat menduplikasi aturan yang sudah ada.
    key: `r${++ruleCounter}`,
});

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};
const dayLabel = (iso: string) =>
    parseIso(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

const isRuleReady = (r: Rule) =>
    !!r.class_id &&
    !!r.venue_id &&
    r.days.length > 0 &&
    /^\d{2}:\d{2}$/.test(r.start_time) &&
    /^\d{2}:\d{2}$/.test(r.end_time) &&
    r.end_time > r.start_time &&
    r.quota >= 1;

export function BulkScheduleDialog({ open, onOpenChange, classes, venues, onCreated }: Props) {
    const [rangeStart, setRangeStart] = useState<Date | undefined>();
    const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
    const [rules, setRules] = useState<Rule[]>(() => [newRule()]);
    const [removed, setRemoved] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<BulkResult | null>(null);

    const classById = useMemo(() => new Map(classes.map((c) => [String(c.id), c])), [classes]);
    const venueById = useMemo(() => new Map(venues.map((v) => [String(v.id), v])), [venues]);

    const rangeError = useMemo(() => {
        if (!rangeStart || !rangeEnd) return null;
        if (rangeEnd < rangeStart) return 'End date must be on or after start date';
        const days = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;
        if (days > MAX_RANGE_DAYS) return `Date range is limited to ${MAX_RANGE_DAYS} days`;
        return null;
    }, [rangeStart, rangeEnd]);

    // Pratinjau selalu diturunkan dari aturan + rentang tanggal; tanggal yang dihapus user
    // disimpan terpisah supaya tetap terhapus saat aturan lain diubah.
    const preview = useMemo<PreviewItem[]>(() => {
        if (!rangeStart || !rangeEnd || rangeError) return [];

        const items: PreviewItem[] = [];
        for (const rule of rules) {
            if (!isRuleReady(rule)) continue;

            for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                if (!rule.days.includes(d.getDay())) continue;
                const date = toIso(d);
                const id = `${rule.key}|${date}`;
                if (removed.has(id)) continue;
                items.push({
                    id,
                    class_id: rule.class_id,
                    venue_id: rule.venue_id,
                    date,
                    start_time: rule.start_time,
                    end_time: rule.end_time,
                    quota: rule.quota,
                });
            }
        }

        return items.sort((a, b) =>
            a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date.localeCompare(b.date)
        );
    }, [rules, rangeStart, rangeEnd, rangeError, removed]);

    const updateRule = (key: string, patch: Partial<Rule>) =>
        setRules((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

    const toggleDay = (rule: Rule, day: number) =>
        updateRule(rule.key, {
            days: rule.days.includes(day) ? rule.days.filter((d) => d !== day) : [...rule.days, day],
        });

    const venueOptionsFor = (classId: string) => {
        const cls = classById.get(classId);
        if (!cls) return [];
        return venues.filter((v) => String(v.branch.id) === String(cls.branch_id));
    };

    const reset = () => {
        setRangeStart(undefined);
        setRangeEnd(undefined);
        setRules([newRule()]);
        setRemoved(new Set());
        setResult(null);
        setIsSaving(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (isSaving) return;
        if (!next) reset();
        onOpenChange(next);
    };

    const handleSubmit = async () => {
        if (preview.length === 0) return;
        if (preview.length > MAX_ITEMS) {
            toast.error(`A maximum of ${MAX_ITEMS} schedules can be created at once`);
            return;
        }

        try {
            setIsSaving(true);
            const { data } = await apiRequest<BulkResult>('/admin/schedule/bulk', {
                method: 'POST',
                body: {
                    items: preview.map((p) => ({
                        class_id: Number(p.class_id),
                        venue_id: Number(p.venue_id),
                        date: p.date,
                        start_time: p.start_time,
                        end_time: p.end_time,
                        quota: p.quota,
                    })),
                },
            });

            setResult(data);
            if (data.created > 0) onCreated();
        } catch (error) {
            console.error('Bulk create schedules error:', error);
            toast.error(getErrorMessage(error, 'Failed to create schedules'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Multiple Schedules</DialogTitle>
                    <DialogDescription>
                        Pick a date range, then add one pattern for each class, venue and time. Extra days or hours
                        are just another pattern. Schedules that already exist are skipped.
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-emerald-50 p-4 text-sm text-emerald-800">
                            <span className="font-semibold">{result.created}</span> schedule(s) created
                            {result.skipped.length > 0 && (
                                <>
                                    , <span className="font-semibold">{result.skipped.length}</span> skipped
                                </>
                            )}
                            .
                        </div>

                        {result.skipped.length > 0 && (
                            <div className="space-y-2">
                                <Label>Skipped</Label>
                                <div className="max-h-64 overflow-y-auto rounded-md border divide-y text-sm">
                                    {result.skipped.map((s) => (
                                        <div key={s.index} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                                            <span>
                                                {dayLabel(s.date)} · {s.start_time}-{s.end_time} · {s.class} · {s.venue}
                                            </span>
                                            <span className="text-xs text-amber-600">
                                                {SKIP_REASONS[s.reason] ?? s.reason}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>Done</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 1. Rentang tanggal */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Start date</Label>
                                <DatePicker value={rangeStart} onChange={setRangeStart} modal={true} />
                            </div>
                            <div className="space-y-1">
                                <Label>End date</Label>
                                <DatePicker value={rangeEnd} onChange={setRangeEnd} modal={true} />
                            </div>
                            {rangeError && <p className="text-xs text-red-600 sm:col-span-2">{rangeError}</p>}
                        </div>

                        {/* 2. Aturan pola */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Patterns</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => setRules((p) => [...p, newRule()])}>
                                    <IconPlus className="w-4 h-4" /> Add pattern
                                </Button>
                            </div>

                            {rules.map((rule, idx) => {
                                const venueOptions = venueOptionsFor(rule.class_id);

                                return (
                                    <div key={rule.key} className="space-y-3 rounded-xl border p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Pattern {idx + 1}</span>
                                            <div className="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    title="Duplicate"
                                                    onClick={() =>
                                                        setRules((p) => [
                                                            ...p.slice(0, idx + 1),
                                                            newRule({ ...rule, days: [...rule.days] }),
                                                            ...p.slice(idx + 1),
                                                        ])
                                                    }
                                                >
                                                    <IconCopy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    title="Remove pattern"
                                                    disabled={rules.length === 1}
                                                    onClick={() => setRules((p) => p.filter((r) => r.key !== rule.key))}
                                                >
                                                    <IconTrash className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label>Class</Label>
                                                <SearchableSelect
                                                    value={rule.class_id}
                                                    onValueChange={(value) => updateRule(rule.key, { class_id: value, venue_id: '' })}
                                                    options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                                                    placeholder="Choose class"
                                                    searchPlaceholder="Search class..."
                                                    emptyText="No classes available"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Venue</Label>
                                                <Select
                                                    value={rule.venue_id}
                                                    onValueChange={(value) => updateRule(rule.key, { venue_id: value })}
                                                    disabled={!rule.class_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={rule.class_id ? 'Choose venue' : 'Select a class first'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {venueOptions.length === 0 ? (
                                                            <SelectItem value="0" disabled>No venues available for this class</SelectItem>
                                                        ) : (
                                                            venueOptions.map((v) => (
                                                                <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Days</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {DAYS.map((d) => (
                                                    <Button
                                                        key={d.value}
                                                        type="button"
                                                        size="sm"
                                                        variant={rule.days.includes(d.value) ? 'default' : 'outline'}
                                                        onClick={() => toggleDay(rule, d.value)}
                                                    >
                                                        {d.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label>Start</Label>
                                                <TimeInput value={rule.start_time} onChange={(v) => updateRule(rule.key, { start_time: v })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>End</Label>
                                                <TimeInput value={rule.end_time} onChange={(v) => updateRule(rule.key, { end_time: v })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Quota</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={rule.quota || ''}
                                                    onChange={(e) => updateRule(rule.key, { quota: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        {rule.start_time && rule.end_time && rule.end_time <= rule.start_time && (
                                            <p className="text-xs text-red-600">End time must be after start time</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 3. Pratinjau */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Preview ({preview.length})</Label>
                                {removed.size > 0 && (
                                    <Button type="button" variant="ghost" size="xs" onClick={() => setRemoved(new Set())}>
                                        Restore removed
                                    </Button>
                                )}
                            </div>

                            {preview.length === 0 ? (
                                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                    Fill in the dates and at least one complete pattern to see the schedules here.
                                </p>
                            ) : (
                                <div className="max-h-64 overflow-y-auto rounded-md border divide-y text-sm">
                                    {preview.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
                                            <span>
                                                <span className="font-medium">{dayLabel(p.date)}</span> · {p.start_time}-{p.end_time} ·{' '}
                                                {classById.get(p.class_id)?.name} · {venueById.get(p.venue_id)?.name} · quota {p.quota}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                title="Remove this date"
                                                onClick={() => setRemoved((prev) => new Set(prev).add(p.id))}
                                            >
                                                <IconX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {preview.length > MAX_ITEMS && (
                                <p className="text-xs text-red-600">
                                    Too many schedules ({preview.length}). The limit is {MAX_ITEMS} per input.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving || preview.length === 0 || preview.length > MAX_ITEMS}
                            >
                                {isSaving ? 'Saving...' : `Create ${preview.length} schedule(s)`}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}