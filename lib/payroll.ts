// lib/payroll.ts
// Tipe, label, dan helper format untuk modul payroll.

export type PeriodStatus = 'draft' | 'final' | 'paid';
export type ItemStatus = 'no_show' | 'upcoming' | 'incomplete' | 'paid';
export type RescheduleType = 'coach_request' | 'admin_change';

export interface CoachPayrollSummary {
    coach_id: number;
    coach_name: string;
    period_id: number | null;
    total_sessions: number;
    upcoming_sessions: number;
    total_amount: number;
    status: PeriodStatus;
}

export interface PayrollItemRow {
    coach_schedule_id: number | null;
    schedule_id: number | null;
    class_name: string;
    venue_name: string;
    date: string | null;
    role_label: string;
    status: ItemStatus;
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

export interface RescheduleRecord {
    id: number;
    schedule_id: number | null;
    schedule_date: string | null;
    class_name: string | null;
    from_coach_id: number;
    from_coach_name: string | null;
    to_coach_id: number | null;
    to_coach_name: string | null;
    role_label: string;
    type: RescheduleType;
    counts_toward_bonus: boolean;
    reason: string | null;
    created_by_name: string | null;
    created_at: string | null;
}

export interface CoachPayrollBreakdown {
    coach_id: number;
    coach_name: string;
    period_id: number | null;
    status: PeriodStatus;
    finalized_at: string | null;
    paid_at: string | null;
    total_sessions: number;
    upcoming_sessions: number;
    discipline_bonus_eligible: boolean;
    discipline_bonus_amount: number;
    discipline_bonus_reason: string | null;
    discipline_bonus_provisional: boolean;
    reschedule_count: number;
    reschedule_limit: number;
    reschedules: RescheduleRecord[];
    manual_bonus_enabled: boolean;
    manual_bonus_amount: number;
    total_amount: number;
    items: PayrollItemRow[];
}

export interface PayrollSetting {
    id: number;
    key: string;
    value: number;
    label: string;
    description: string | null;
}

export interface PayrollAuditEntry {
    id: number;
    action: string;
    user_id: number | null;
    user_name: string | null;
    meta: Record<string, unknown> | null;
    created_at: string | null;
}

export const MONTHS = [
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

export const currentYear = new Date().getFullYear();

export const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

export function formatRupiah(amount: number): string {
    const sign = amount < 0 ? '-' : '';
    return `${sign}Rp${Math.abs(amount).toLocaleString('id-ID')}`;
}

export function formatDate(date: string | null): string {
    if (!date) return '-';

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(date));
}

export function formatDateTime(date: string | null): string {
    if (!date) return '-';

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    }).format(new Date(date));
}

// ---------------------------------------------------------------------------
// Status periode dan item
// ---------------------------------------------------------------------------

export function getPeriodStatusStyle(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'final':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        default:
            return 'bg-amber-50 text-amber-600 border-amber-200';
    }
}

export function getPeriodStatusLabel(status: string, asEstimate = false): string {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'final':
            return 'Final';
        default:
            return asEstimate ? 'Estimate (not finalized)' : 'Draft';
    }
}

export function getItemStatusStyle(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        case 'upcoming':
            return 'bg-sky-50 text-sky-600 border-sky-200';
        case 'no_show':
            return 'bg-rose-50 text-rose-600 border-rose-200';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

export function getItemStatusLabel(status: string): string {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'upcoming':
            return 'Upcoming';
        case 'incomplete':
            return 'Not Checked Out';
        case 'no_show':
            return 'No Show';
        default:
            return status;
    }
}

// ---------------------------------------------------------------------------
// Bonus disiplin dan reschedule
// ---------------------------------------------------------------------------

const BONUS_REASON_LABELS: Record<string, string> = {
    reschedule_limit: 'Exceeded the reschedule limit',
    no_show: 'Has a no-show',
    attire: 'Attire not compliant in a session',
    late: 'Late check-in in a session',
    no_sessions: 'No evaluated sessions yet',
};

export function getBonusReasonLabel(reason: string | null): string {
    if (!reason) return '';
    return BONUS_REASON_LABELS[reason] ?? reason;
}

export function getRescheduleTypeLabel(type: string): string {
    return type === 'coach_request' ? 'Coach request' : 'Admin change';
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

const AUDIT_ACTION_LABELS: Record<string, string> = {
    finalized: 'Finalized',
    marked_paid: 'Marked as paid',
    reopened: 'Reopened',
    manual_bonus_changed: 'Manual bonus changed',
    flags_updated: 'Flags updated',
    settings_updated: 'Settings updated',
    manual_attendance: 'Manual attendance',
};

export function getAuditActionLabel(action: string): string {
    return AUDIT_ACTION_LABELS[action] ?? action;
}

export function describeAuditEntry(entry: PayrollAuditEntry): string {
    const meta = entry.meta ?? {};

    switch (entry.action) {
        case 'reopened':
            return typeof meta.reason === 'string' ? `Reason: ${meta.reason}` : '';

        case 'finalized':
        case 'marked_paid':
            return typeof meta.total_amount === 'number' ? `Total ${formatRupiah(meta.total_amount)}` : '';

        case 'manual_bonus_changed':
            return meta.enabled ? `Enabled (${formatRupiah(Number(meta.amount ?? 0))})` : 'Disabled';

        case 'flags_updated': {
            const to = meta.to as Record<string, unknown> | undefined;
            if (!to) return '';

            return Object.entries(to)
                .map(([field, value]) => {
                    const label = field === 'attire_compliant' ? 'Attire compliant' : 'Manual present';
                    return `${label}: ${value ? 'yes' : 'no'}`;
                })
                .join(', ');
        }

        case 'manual_attendance': {
            const to = meta.to as Record<string, string | null> | undefined;
            const fmt = (iso: string | null | undefined) =>
                iso
                    ? new Intl.DateTimeFormat('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Jakarta',
                    }).format(new Date(iso))
                    : '-';
            const times = to ? `In ${fmt(to.check_in_at)}, Out ${fmt(to.check_out_at)}` : '';
            const reason = typeof meta.reason === 'string' ? ` | Reason: ${meta.reason}` : '';
            return `${times}${reason}`;
        }

        default:
            return '';
    }
}