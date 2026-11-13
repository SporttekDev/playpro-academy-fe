// lib/payroll-expenses.ts
// Tipe, label, dan helper untuk laporan pengeluaran gaji coach (khusus finance).

import Cookies from 'js-cookie';
import { ApiError } from '@/lib/api';

export type ExpenseStatus = 'draft' | 'final' | 'paid';

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Salary expense (gross) by period status. */
export interface GrossByStatus {
    draft: number;
    final: number;
    paid: number;
}

export interface StatusCounts {
    draft: number;
    final: number;
    paid: number;
}

export interface ExpenseTotals {
    period_count: number;
    coach_count: number;
    session_count: number;
    sessions_total: number;
    discipline: number;
    manual: number;
    /** Beban gaji sebelum kasbon (angka utama). */
    gross: number;
    /** Kasbon yang benar-benar terpotong. */
    advance: number;
    /** Dibayarkan ke coach = gross - advance. */
    net: number;
    /** Selisih rekonsiliasi; normalnya 0. */
    adjustment: number;
    gross_by_status: GrossByStatus;
    status_counts: StatusCounts;
}

export interface BranchRef {
    /** null = "Tanpa cabang" */
    branch_id: number | null;
    branch_name: string;
    branch_deleted: boolean;
}

export interface BranchAmount extends BranchRef {
    amount: number;
}

export interface ExpenseMonthRow extends ExpenseTotals {
    month: number;
    branches: BranchAmount[];
    /** Coach yang berjadwal bulan ini tetapi belum punya payroll sama sekali. */
    not_generated: number;
}

export interface ExpenseBranchTotal extends BranchRef {
    sessions_total: number;
    discipline: number;
    manual: number;
    gross: number;
    session_count: number;
    paid_sessions: number;
    coach_count: number;
}

export interface ExpenseReconciliation {
    adjustment_total: number;
    periods: { period_id: number; coach_id: number; month: number; amount: number }[];
}

export interface ExpenseOverview {
    year: number;
    include_draft: boolean;
    totals: ExpenseTotals;
    months: ExpenseMonthRow[];
    branches: ExpenseBranchTotal[];
    not_generated_total: number;
    reconciliation: ExpenseReconciliation;
}

export interface ExpenseCoachBranch extends BranchRef {
    amount: number;
    sessions_total: number;
    discipline: number;
    manual: number;
    session_count: number;
}

export interface ExpenseCoachRow {
    coach_id: number;
    coach_name: string;
    period_id: number;
    status: ExpenseStatus;
    session_count: number;
    sessions_total: number;
    discipline: number;
    manual: number;
    gross: number;
    advance: number;
    net: number;
    adjustment: number;
    branches: ExpenseCoachBranch[];
}

export interface ExpenseAdvanceRow {
    coach_id: number;
    coach_name: string;
    period_id: number;
    status: ExpenseStatus;
    requested: number;
    applied: number;
    not_recovered: number;
    note: string | null;
}

export interface ExpenseMonthDetail {
    month: number;
    year: number;
    include_draft: boolean;
    totals: ExpenseTotals;
    branches: ExpenseBranchTotal[];
    coaches: ExpenseCoachRow[];
    advances: ExpenseAdvanceRow[];
    not_generated: number;
    reconciliation: ExpenseReconciliation;
}

export function getExpenseStatusLabel(status: string): string {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'final':
            return 'Final';
        default:
            return 'Draft (estimate)';
    }
}

/** Compact format for chart axes: 1.5M / 250K / 1.2B. */
export function formatCompactRupiah(amount: number): string {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    const fmt = (n: number, digits: number) => n.toLocaleString('en-US', { maximumFractionDigits: digits });

    if (abs >= 1_000_000_000) return `${sign}${fmt(abs / 1_000_000_000, 1)}B`;
    if (abs >= 1_000_000) return `${sign}${fmt(abs / 1_000_000, 1)}M`;
    if (abs >= 1_000) return `${sign}${fmt(abs / 1_000, 0)}K`;
    return `${sign}${abs}`;
}

/**
 * Unduh file biner (mis. Excel) dari endpoint yang membutuhkan token. apiRequest hanya
 * untuk JSON, jadi file diambil lewat fetch lalu disimpan lewat tautan sementara.
 */
export async function downloadFile(path: string, filename: string, accept: string): Promise<void> {
    const token = Cookies.get('token');

    const headers: Record<string, string> = { Accept: accept };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`, { headers });

    if (!response.ok) {
        // Error dari backend berbentuk JSON ({ message }), meski yang diminta file.
        let message = `Failed to download file (${response.status})`;
        try {
            const json = (await response.json()) as { message?: string };
            if (json?.message) message = json.message;
        } catch {
            // body bukan JSON; pakai pesan bawaan
        }
        throw new ApiError(message, response.status);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Beri waktu browser memulai unduhan sebelum URL dilepas.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface MonthYear {
    year: number;
    month: number;
}

/** Maximum number of months in one Excel export (same limit as the backend). */
export const MAX_EXPORT_MONTHS = 36;

/** Number of months from `from` to `to`, inclusive. Zero or negative means the range is reversed. */
export function countMonthsInRange(from: MonthYear, to: MonthYear): number {
    return (to.year - from.year) * 12 + (to.month - from.month) + 1;
}

export function formatMonthYear(value: MonthYear): string {
    return `${MONTH_NAMES[value.month - 1]} ${value.year}`;
}

function pad(month: number): string {
    return String(month).padStart(2, '0');
}

export function expenseExcelFilename(from: MonthYear, to: MonthYear, includeDraft: boolean): string {
    const start = `${from.year}-${pad(from.month)}`;
    const end = `${to.year}-${pad(to.month)}`;
    const range = start === end ? start : `${start}_to_${end}`;

    return `Coach-Salary-Expenses-${range}${includeDraft ? '-incl-drafts' : ''}.xlsx`;
}