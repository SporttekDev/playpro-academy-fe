// lib/payslip.ts
// Tipe dan helper unduh slip gaji (PDF).

import Cookies from 'js-cookie';
import { ApiError } from '@/lib/api';

export interface PayslipSummary {
    period_id: number;
    month: number;
    year: number;
    /** Contoh: "Oktober 2026" */
    period_label: string;
    total_sessions: number;
    total_amount: number;
    paid_at: string | null;
}

/**
 * Unduh PDF dari endpoint yang membutuhkan token. apiRequest hanya untuk JSON, jadi
 * file diambil lewat fetch sendiri lalu disimpan lewat tautan sementara.
 *
 * @param path      contoh: `/coach/payslips/12/pdf` atau `/finance/payroll/12/payslip`
 * @param filename  nama file saat disimpan
 */
export async function downloadPdf(path: string, filename: string): Promise<void> {
    const token = Cookies.get('token');

    const headers: Record<string, string> = { Accept: 'application/pdf' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`, { headers });

    if (!response.ok) {
        // Error dari backend berbentuk JSON ({ message }), meski yang diminta PDF.
        let message = `Gagal mengunduh slip (${response.status})`;
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

export function payslipFilename(coachName: string, year: number, month: number): string {
    const slug = coachName.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'Coach';
    return `Slip-Gaji-${slug}-${year}-${String(month).padStart(2, '0')}.pdf`;
}