// Logika murni untuk input jadwal massal (tanpa React) supaya mudah diuji.

export const SKIP = '__skip';
export const INHERIT = '__inherit';
export const DEFAULT_QUOTA = 15;
export const MAX_ITEMS = 200;
export const MAX_RANGE_DAYS = 93;

export interface ClassLike {
    id: string | number;
    name: string;
    branch_id: string | number;
    sport_id?: string | number | null;
    category_id?: string | number | null;
}

export interface Slot {
    key: string;
    venue_id: string;
    days: number[]; // Date.getDay(): 0 = Minggu
    start_time: string;
    end_time: string;
    quota: number;
    /** Kunci kategori kelas (category_id, atau nama kategori huruf kecil bila id tidak ada). */
    category: string;
}

export type Problem = 'no_class' | 'ambiguous';

export interface Row {
    id: string;
    manual: boolean;
    class_id: string;
    venue_id: string;
    date: string;
    start_time: string;
    end_time: string;
    quota: number;
    problem?: Problem;
}

export interface Week {
    /** Tanggal Senin pekan itu (YYYY-MM-DD). */
    key: string;
    /** Tanggal-tanggal pekan itu yang masuk rentang. */
    dates: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');

export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseIso = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const dayLabel = (iso: string) =>
    parseIso(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

export const shortDate = (iso: string) =>
    parseIso(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

/**
 * Sport dan kategori sebuah kelas. Memakai sport_id / category_id bila ada;
 * bila tidak, jatuh ke segmen nama kelas ("Sport - Kategori - Branch").
 */
export function classMeta(c: ClassLike) {
    const [seg0 = '', seg1 = ''] = c.name.split(' - ').map((s) => s.trim());
    return {
        sportKey: c.sport_id != null ? String(c.sport_id) : seg0.toLowerCase(),
        sportLabel: seg0 || `Sport ${c.sport_id ?? ''}`.trim(),
        categoryKey: c.category_id != null ? String(c.category_id) : seg1.toLowerCase(),
        categoryLabel: seg1 || `Category ${c.category_id ?? ''}`.trim(),
    };
}

export function buildWeeks(start?: Date, end?: Date): Week[] {
    if (!start || !end || end < start) return [];

    const weeks = new Map<string, Week>();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const key = toIso(monday);

        let week = weeks.get(key);
        if (!week) {
            week = { key, dates: [] };
            weeks.set(key, week);
        }
        week.dates.push(toIso(d));
    }

    return [...weeks.values()];
}

export const isSlotReady = (s: Slot) =>
    !!s.venue_id &&
    !!s.category &&
    s.days.length > 0 &&
    validTime(s.start_time) &&
    validTime(s.end_time) &&
    s.end_time > s.start_time &&
    s.quota >= 1;

interface GenerateArgs {
    slots: Slot[];
    weeks: Week[];
    /** weekKey -> sportKey | SKIP. Kosong/tidak ada = belum dipilih (tidak dibuat). */
    weekSport: Record<string, string>;
    /** `${slotKey}|${weekKey}` -> sportKey | SKIP | INHERIT. */
    overrides: Record<string, string>;
    /** Kelas pada branch yang dipilih. */
    classes: ClassLike[];
}

export function generateRows({ slots, weeks, weekSport, overrides, classes }: GenerateArgs): Row[] {
    const withMeta = classes.map((c) => ({ c, meta: classMeta(c) }));
    const rows: Row[] = [];

    for (const slot of slots) {
        if (!isSlotReady(slot)) continue;

        for (const week of weeks) {
            const override = overrides[`${slot.key}|${week.key}`];
            const sport = override && override !== INHERIT ? override : weekSport[week.key];
            if (!sport || sport === SKIP) continue;

            const matches = withMeta.filter(
                (x) => x.meta.sportKey === sport && x.meta.categoryKey === slot.category
            );
            const problem: Problem | undefined =
                matches.length === 0 ? 'no_class' : matches.length > 1 ? 'ambiguous' : undefined;

            for (const date of week.dates) {
                if (!slot.days.includes(parseIso(date).getDay())) continue;

                rows.push({
                    id: `${slot.key}|${date}`,
                    manual: false,
                    class_id: matches[0] ? String(matches[0].c.id) : '',
                    venue_id: slot.venue_id,
                    date,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    quota: slot.quota,
                    problem,
                });
            }
        }
    }

    return rows;
}

export function rowError(r: Row): string | null {
    if (!r.class_id) return 'Choose a class';
    if (!r.venue_id) return 'Choose a venue';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return 'Choose a date';
    if (!validTime(r.start_time) || !validTime(r.end_time)) return 'Enter valid times';
    if (r.end_time <= r.start_time) return 'End time must be after start time';
    if (!(r.quota >= 1)) return 'Quota must be at least 1';
    return null;
}

export const compareRows = (a: Row, b: Row) =>
    (a.date || '9999').localeCompare(b.date || '9999') || a.start_time.localeCompare(b.start_time);