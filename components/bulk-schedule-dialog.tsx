'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { IconAlertTriangle, IconCopy, IconPencil, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
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
import {
    DEFAULT_QUOTA,
    INHERIT,
    MAX_ITEMS,
    MAX_RANGE_DAYS,
    SKIP,
    buildWeeks,
    classMeta,
    compareRows,
    dayLabel,
    generateRows,
    isSlotReady,
    parseIso,
    rowError,
    shortDate,
    toIso,
    type ClassLike,
    type Row,
    type Slot,
} from '@/lib/bulk-schedule-utils';

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
const dayShort = (d: number) => DAYS.find((x) => x.value === d)?.label ?? '';

const SKIP_REASONS: Record<string, string> = {
    already_exists: 'Already exists',
    duplicate_in_request: 'Duplicate in this input',
    invalid_time: 'End time must be after start time',
    venue_branch_mismatch: 'Venue does not belong to the class branch',
};

export interface BulkBranchOption {
    id: string | number;
    name: string;
}

// Removed BulkClassOption as it is equivalent to ClassLike

export interface BulkVenueOption {
    id: string | number;
    name: string;
    branch: { id: string | number };
}

interface TemplateSlot {
    venue_id: number;
    days: number[];
    start_time: string;
    end_time: string;
    quota: number;
    category_key: string;
}

interface Template {
    id: number;
    branch_id: number;
    name: string;
    slots: TemplateSlot[];
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
    branches: BulkBranchOption[];
    classes: ClassLike[];
    venues: BulkVenueOption[];
    /** Dipanggil setelah ada jadwal yang berhasil dibuat, untuk memuat ulang daftar. */
    onCreated: () => void;
}

let counter = 0;
const nextKey = (prefix: string) => `${prefix}${++counter}`;

const newSlot = (base?: Partial<Slot>): Slot => ({
    venue_id: '',
    days: [],
    start_time: '',
    end_time: '',
    quota: DEFAULT_QUOTA,
    category: '',
    ...base,
    key: nextKey('s'),
});

export function BulkScheduleDialog({ open, onOpenChange, branches, classes, venues, onCreated }: Props) {
    const [branchId, setBranchId] = useState('');
    const [rangeStart, setRangeStart] = useState<Date | undefined>();
    const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
    const [slots, setSlots] = useState<Slot[]>(() => [newSlot()]);
    const [weekSport, setWeekSport] = useState<Record<string, string>>({});
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [perSlot, setPerSlot] = useState(false);

    const [removed, setRemoved] = useState<Set<string>>(new Set());
    const [edits, setEdits] = useState<Record<string, Partial<Row>>>({});
    const [manualRows, setManualRows] = useState<Row[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [templates, setTemplates] = useState<Template[]>([]);
    const [templateName, setTemplateName] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<BulkResult | null>(null);

    // -- Data turunan ----------------------------------------------------------

    const branchClasses = useMemo(
        () => classes.filter((c) => String(c.branch_id) === branchId),
        [classes, branchId]
    );
    const branchVenues = useMemo(
        () => venues.filter((v) => String(v.branch.id) === branchId),
        [venues, branchId]
    );
    const classById = useMemo(() => new Map(classes.map((c) => [String(c.id), c])), [classes]);
    const venueById = useMemo(() => new Map(venues.map((v) => [String(v.id), v])), [venues]);

    const sportOptions = useMemo(() => {
        const map = new Map<string, string>();
        branchClasses.forEach((c) => {
            const m = classMeta(c);
            if (!map.has(m.sportKey)) map.set(m.sportKey, m.sportLabel);
        });
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [branchClasses]);

    const categoryOptions = useMemo(() => {
        const map = new Map<string, string>();
        branchClasses.forEach((c) => {
            const m = classMeta(c);
            if (!map.has(m.categoryKey)) map.set(m.categoryKey, m.categoryLabel);
        });
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [branchClasses]);

    const rangeError = useMemo(() => {
        if (!rangeStart || !rangeEnd) return null;
        if (rangeEnd < rangeStart) return 'End date must be on or after start date';
        const days = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;
        if (days > MAX_RANGE_DAYS) return `Date range is limited to ${MAX_RANGE_DAYS} days`;
        return null;
    }, [rangeStart, rangeEnd]);

    const weeks = useMemo(
        () => (rangeError ? [] : buildWeeks(rangeStart, rangeEnd)),
        [rangeStart, rangeEnd, rangeError]
    );

    const generated = useMemo(
        () => generateRows({ slots, weeks, weekSport, overrides, classes: branchClasses }),
        [slots, weeks, weekSport, overrides, branchClasses]
    );

    const rows = useMemo<Row[]>(() => {
        const fromGrid = generated
            .filter((r) => !removed.has(r.id))
            .map((r) => {
                const e = edits[r.id];
                if (!e) return r;
                return { ...r, ...e, problem: e.class_id !== undefined ? undefined : r.problem };
            });
        return [...fromGrid, ...manualRows].sort(compareRows);
    }, [generated, removed, edits, manualRows]);

    const validRows = useMemo(() => rows.filter((r) => !rowError(r)), [rows]);
    const invalidCount = rows.length - validRows.length;

    // -- Template --------------------------------------------------------------

    useEffect(() => {
        if (!open || !branchId) {
            setTemplates([]);
            return;
        }

        let ignore = false;
        apiRequest<Template[]>('/admin/schedule-templates', { query: { branch_id: branchId } })
            .then(({ data }) => {
                if (!ignore) setTemplates(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!ignore) setTemplates([]);
            });

        return () => {
            ignore = true;
        };
    }, [open, branchId]);

    const reloadTemplates = async () => {
        try {
            const { data } = await apiRequest<Template[]>('/admin/schedule-templates', {
                query: { branch_id: branchId },
            });
            setTemplates(Array.isArray(data) ? data : []);
        } catch {
            /* daftar template hanya kemudahan; abaikan bila gagal */
        }
    };

    const handleSaveTemplate = async () => {
        const ready = slots.filter(isSlotReady);
        const name = templateName.trim();

        if (!name) {
            toast.error('Enter a template name first');
            return;
        }
        if (ready.length === 0) {
            toast.error('Complete at least one slot before saving a template');
            return;
        }

        try {
            await apiRequest('/admin/schedule-templates', {
                method: 'POST',
                body: {
                    branch_id: Number(branchId),
                    name,
                    slots: ready.map((s) => ({
                        venue_id: Number(s.venue_id),
                        days: s.days,
                        start_time: s.start_time,
                        end_time: s.end_time,
                        quota: s.quota,
                        category_key: s.category,
                    })),
                },
            });
            await reloadTemplates();
            toast.success('Template saved');
        } catch (error) {
            console.error('Save template error:', error);
            toast.error(getErrorMessage(error, 'Failed to save template'));
        }
    };

    const handleLoadTemplate = (id: string) => {
        const t = templates.find((x) => String(x.id) === id);
        if (!t) return;

        setSlots(
            t.slots.map((s) =>
                newSlot({
                    venue_id: String(s.venue_id),
                    days: s.days,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    quota: s.quota,
                    category: s.category_key,
                })
            )
        );
        setOverrides({});
        setRemoved(new Set());
        setEdits({});
        setTemplateName(t.name);
    };

    const handleDeleteTemplate = async () => {
        const t = templates.find((x) => x.name === templateName.trim());
        if (!t) return;
        if (!window.confirm(`Delete template "${t.name}"?`)) return;

        try {
            await apiRequest(`/admin/schedule-templates/${t.id}`, { method: 'DELETE' });
            await reloadTemplates();
            setTemplateName('');
            toast.success('Template deleted');
        } catch (error) {
            console.error('Delete template error:', error);
            toast.error(getErrorMessage(error, 'Failed to delete template'));
        }
    };

    // -- Aksi ------------------------------------------------------------------

    const resetAll = () => {
        setBranchId('');
        setRangeStart(undefined);
        setRangeEnd(undefined);
        setSlots([newSlot()]);
        setWeekSport({});
        setOverrides({});
        setPerSlot(false);
        setRemoved(new Set());
        setEdits({});
        setManualRows([]);
        setEditingId(null);
        setTemplateName('');
        setResult(null);
        setIsSaving(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (isSaving) return;
        if (!next) resetAll();
        onOpenChange(next);
    };

    const changeBranch = (next: string) => {
        setBranchId(next);
        setSlots([newSlot()]);
        setWeekSport({});
        setOverrides({});
        setRemoved(new Set());
        setEdits({});
        setManualRows([]);
        setEditingId(null);
        setTemplateName('');
    };

    const updateSlot = (key: string, patch: Partial<Slot>) =>
        setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

    const toggleDay = (slot: Slot, day: number) =>
        updateSlot(slot.key, {
            days: slot.days.includes(day) ? slot.days.filter((d) => d !== day) : [...slot.days, day],
        });

    const fillAllWeeks = (value: string) => {
        const next: Record<string, string> = {};
        weeks.forEach((w) => {
            next[w.key] = value;
        });
        setWeekSport(next);
    };

    const updateRow = (row: Row, patch: Partial<Row>) => {
        if (row.manual) {
            setManualRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
        } else {
            setEdits((prev) => ({ ...prev, [row.id]: { ...prev[row.id], ...patch } }));
        }
    };

    const removeRow = (row: Row) => {
        if (row.manual) {
            setManualRows((prev) => prev.filter((r) => r.id !== row.id));
        } else {
            setRemoved((prev) => new Set(prev).add(row.id));
        }
        if (editingId === row.id) setEditingId(null);
    };

    const addManualRow = () => {
        const row: Row = {
            id: nextKey('m'),
            manual: true,
            class_id: '',
            venue_id: '',
            date: '',
            start_time: '',
            end_time: '',
            quota: DEFAULT_QUOTA,
        };
        setManualRows((prev) => [...prev, row]);
        setEditingId(row.id);
    };

    const handleSubmit = async () => {
        if (validRows.length === 0) return;
        if (validRows.length > MAX_ITEMS) {
            toast.error(`A maximum of ${MAX_ITEMS} schedules can be created at once`);
            return;
        }

        try {
            setIsSaving(true);
            const { data } = await apiRequest<BulkResult>('/admin/schedule/bulk', {
                method: 'POST',
                body: {
                    items: validRows.map((r) => ({
                        class_id: Number(r.class_id),
                        venue_id: Number(r.venue_id),
                        date: r.date,
                        start_time: r.start_time,
                        end_time: r.end_time,
                        quota: r.quota,
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

    // -- Tampilan --------------------------------------------------------------

    const weekLabel = (dates: string[]) =>
        dates.length === 1 ? shortDate(dates[0]) : `${shortDate(dates[0])} – ${shortDate(dates[dates.length - 1])}`;

    const slotTitle = (s: Slot, i: number) => {
        const venue = venueById.get(s.venue_id)?.name;
        const days = [...s.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(dayShort).join('/');
        return venue && days ? `${venue} · ${days} ${s.start_time}` : `Slot ${i + 1}`;
    };

    const sportSelectItems = (
        <>
            {sportOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
        </>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Multiple Schedules</DialogTitle>
                    <DialogDescription>
                        Define the weekly slots once, choose the sport for each week, then review and edit the list
                        before saving. Schedules that already exist are skipped.
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
                        {/* 1. Branch dan rentang tanggal */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label>Branch</Label>
                                <Select value={branchId} onValueChange={changeBranch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Start date</Label>
                                <DatePicker value={rangeStart} onChange={setRangeStart} modal={true} />
                            </div>
                            <div className="space-y-1">
                                <Label>End date</Label>
                                <DatePicker value={rangeEnd} onChange={setRangeEnd} modal={true} />
                            </div>
                            {rangeError && <p className="text-xs text-red-600 sm:col-span-3">{rangeError}</p>}
                        </div>

                        {!branchId ? (
                            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                Choose a branch to start.
                            </p>
                        ) : (
                            <>
                                {/* 2. Slot mingguan */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label>Weekly slots</Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {templates.length > 0 && (
                                                <Select value="" onValueChange={handleLoadTemplate}>
                                                    <SelectTrigger className="w-44">
                                                        <SelectValue placeholder="Load template" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {templates.map((t) => (
                                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <Button type="button" variant="outline" size="sm" onClick={() => setSlots((p) => [...p, newSlot()])}>
                                                <IconPlus className="w-4 h-4" /> Add slot
                                            </Button>
                                        </div>
                                    </div>

                                    {slots.map((slot, idx) => (
                                        <div key={slot.key} className="space-y-3 rounded-xl border p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Slot {idx + 1}</span>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Duplicate slot"
                                                        onClick={() =>
                                                            setSlots((p) => [
                                                                ...p.slice(0, idx + 1),
                                                                newSlot({ ...slot, days: [...slot.days] }),
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
                                                        title="Remove slot"
                                                        disabled={slots.length === 1}
                                                        onClick={() => setSlots((p) => p.filter((s) => s.key !== slot.key))}
                                                    >
                                                        <IconTrash className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label>Venue</Label>
                                                    <Select value={slot.venue_id} onValueChange={(v) => updateSlot(slot.key, { venue_id: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose venue" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {branchVenues.length === 0 ? (
                                                                <SelectItem value="0" disabled>No venues in this branch</SelectItem>
                                                            ) : (
                                                                branchVenues.map((v) => (
                                                                    <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Category</Label>
                                                    <Select value={slot.category} onValueChange={(v) => updateSlot(slot.key, { category: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categoryOptions.length === 0 ? (
                                                                <SelectItem value="0" disabled>No classes in this branch</SelectItem>
                                                            ) : (
                                                                categoryOptions.map((o) => (
                                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
                                                            variant={slot.days.includes(d.value) ? 'default' : 'outline'}
                                                            onClick={() => toggleDay(slot, d.value)}
                                                        >
                                                            {d.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Start</Label>
                                                    <TimeInput value={slot.start_time} onChange={(v) => updateSlot(slot.key, { start_time: v })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>End</Label>
                                                    <TimeInput value={slot.end_time} onChange={(v) => updateSlot(slot.key, { end_time: v })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Quota</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={slot.quota || ''}
                                                        onChange={(e) => updateSlot(slot.key, { quota: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>

                                            {slot.start_time && slot.end_time && slot.end_time <= slot.start_time && (
                                                <p className="text-xs text-red-600">End time must be after start time</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Simpan / hapus template */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Input
                                            className="w-56"
                                            placeholder="Template name"
                                            value={templateName}
                                            maxLength={100}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={handleSaveTemplate}>
                                            Save slots as template
                                        </Button>
                                        {templates.some((t) => t.name === templateName.trim()) && (
                                            <Button type="button" variant="ghost" size="sm" onClick={handleDeleteTemplate}>
                                                <IconTrash className="w-4 h-4 text-red-600" /> Delete template
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Olahraga per pekan */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label>Sport per week</Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Select value="" onValueChange={fillAllWeeks} disabled={weeks.length === 0}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder="Set all weeks to…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sportSelectItems}
                                                    <SelectItem value={SKIP}>— Skip —</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant={perSlot ? 'default' : 'outline'} size="sm" onClick={() => setPerSlot((v) => !v)}>
                                                Set per slot
                                            </Button>
                                        </div>
                                    </div>

                                    {weeks.length === 0 ? (
                                        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                            Choose a valid date range to see the weeks.
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto rounded-md border">
                                            <div className="min-w-max divide-y text-sm">
                                                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                                                    <span className="w-36 shrink-0">Week (Mon–Sun)</span>
                                                    <span className="w-48 shrink-0">{perSlot ? 'Default for all slots' : 'Sport'}</span>
                                                    {perSlot &&
                                                        slots.map((s, i) => (
                                                            <span key={s.key} className="w-48 shrink-0 truncate" title={slotTitle(s, i)}>
                                                                {slotTitle(s, i)}
                                                            </span>
                                                        ))}
                                                </div>

                                                {weeks.map((w) => (
                                                    <div key={w.key} className="flex items-center gap-2 px-3 py-1.5">
                                                        <span className="w-36 shrink-0">{weekLabel(w.dates)}</span>
                                                        <div className="w-48 shrink-0">
                                                            <Select
                                                                value={weekSport[w.key] ?? ''}
                                                                onValueChange={(v) => setWeekSport((p) => ({ ...p, [w.key]: v }))}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pick sport" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {sportSelectItems}
                                                                    <SelectItem value={SKIP}>— Skip this week —</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {perSlot &&
                                                            slots.map((s) => (
                                                                <div key={s.key} className="w-48 shrink-0">
                                                                    <Select
                                                                        value={overrides[`${s.key}|${w.key}`] ?? INHERIT}
                                                                        onValueChange={(v) =>
                                                                            setOverrides((p) => ({ ...p, [`${s.key}|${w.key}`]: v }))
                                                                        }
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value={INHERIT}>Same as week</SelectItem>
                                                                            {sportSelectItems}
                                                                            <SelectItem value={SKIP}>— Skip —</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Pratinjau yang bisa diedit */}
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label>
                                            Preview ({validRows.length}
                                            {invalidCount > 0 ? `, ${invalidCount} need attention` : ''})
                                        </Label>
                                        <div className="flex gap-2">
                                            {(removed.size > 0 || Object.keys(edits).length > 0) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => {
                                                        setRemoved(new Set());
                                                        setEdits({});
                                                    }}
                                                >
                                                    Restore removed / edited
                                                </Button>
                                            )}
                                            <Button type="button" variant="outline" size="xs" onClick={addManualRow}>
                                                <IconPlus className="w-3 h-3" /> Add row
                                            </Button>
                                        </div>
                                    </div>

                                    {rows.length === 0 ? (
                                        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                            Complete a slot and pick a sport for at least one week to see the schedules here.
                                        </p>
                                    ) : (
                                        <div className="max-h-96 overflow-y-auto rounded-md border divide-y text-sm">
                                            {rows.map((r) => {
                                                const err = rowError(r);
                                                const editing = editingId === r.id;
                                                const cls = classById.get(r.class_id);

                                                return (
                                                    <div key={r.id} className={err ? 'bg-red-50/60' : undefined}>
                                                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                                                            <span className="min-w-0">
                                                                <span className="font-medium">{r.date ? dayLabel(r.date) : '—'}</span>
                                                                {' · '}
                                                                {r.start_time || '--:--'}-{r.end_time || '--:--'} ·{' '}
                                                                {cls?.name ?? 'No class'} · {venueById.get(r.venue_id)?.name ?? 'No venue'} · quota {r.quota}
                                                                {r.problem === 'ambiguous' && (
                                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600" title="More than one class matches; the first was used">
                                                                        <IconAlertTriangle className="w-3 h-3" /> check class
                                                                    </span>
                                                                )}
                                                                {err && <span className="ml-2 text-xs text-red-600">{err}</span>}
                                                            </span>
                                                            <span className="flex shrink-0 gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    title="Edit"
                                                                    onClick={() => setEditingId(editing ? null : r.id)}
                                                                >
                                                                    <IconPencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button type="button" variant="ghost" size="icon-sm" title="Remove" onClick={() => removeRow(r)}>
                                                                    <IconX className="w-4 h-4" />
                                                                </Button>
                                                            </span>
                                                        </div>

                                                        {editing && (
                                                            <div className="grid grid-cols-1 gap-3 border-t bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                <div className="space-y-1">
                                                                    <Label>Date</Label>
                                                                    <DatePicker
                                                                        value={r.date ? parseIso(r.date) : undefined}
                                                                        onChange={(d) => d && updateRow(r, { date: toIso(d) })}
                                                                        modal={true}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1 sm:col-span-1 lg:col-span-2">
                                                                    <Label>Class</Label>
                                                                    <SearchableSelect
                                                                        value={r.class_id}
                                                                        onValueChange={(v) => updateRow(r, { class_id: v })}
                                                                        options={branchClasses.map((c) => ({ value: String(c.id), label: c.name }))}
                                                                        placeholder="Choose class"
                                                                        searchPlaceholder="Search class..."
                                                                        emptyText="No classes available"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label>Venue</Label>
                                                                    <Select value={r.venue_id} onValueChange={(v) => updateRow(r, { venue_id: v })}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Choose venue" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {branchVenues.map((v) => (
                                                                                <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3 sm:col-span-1 lg:col-span-2">
                                                                    <div className="space-y-1">
                                                                        <Label>Start</Label>
                                                                        <TimeInput value={r.start_time} onChange={(v) => updateRow(r, { start_time: v })} />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label>End</Label>
                                                                        <TimeInput value={r.end_time} onChange={(v) => updateRow(r, { end_time: v })} />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label>Quota</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            value={r.quota || ''}
                                                                            onChange={(e) => updateRow(r, { quota: parseInt(e.target.value) || 0 })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {validRows.length > MAX_ITEMS && (
                                        <p className="text-xs text-red-600">
                                            Too many schedules ({validRows.length}). The limit is {MAX_ITEMS} per input.
                                        </p>
                                    )}
                                    {invalidCount > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Rows marked in red are not saved until you fix or remove them.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving || validRows.length === 0 || validRows.length > MAX_ITEMS}
                            >
                                {isSaving ? 'Saving...' : `Create ${validRows.length} schedule(s)`}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}