'use client';

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { IconDownload } from '@tabler/icons-react';

import { DataTable } from '@/components/data-table';
import { DataTableSkeleton } from '@/components/data-table-skeleton';
import { Button } from '@/components/ui/button';
import { apiRequest, getErrorMessage } from '@/lib/api';
import { formatDate, formatRupiah } from '@/lib/payroll';
import { downloadPdf, payslipFilename, PayslipSummary } from '@/lib/payslip';

type Session = { name?: string; role?: string } | null | 'loading';

export default function PayslipsPage() {
    const [session, setSession] = useState<Session>('loading');
    const [slips, setSlips] = useState<PayslipSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

    const isCoach = session !== 'loading' && session !== null && session.role === 'coach';
    const coachName = session !== 'loading' && session !== null ? (session.name ?? 'Coach') : 'Coach';

    const fetchSlips = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiRequest<PayslipSummary[]>('/coach/payslips');
            setSlips(data ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal memuat slip gaji'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isCoach) fetchSlips();
    }, [isCoach, fetchSlips]);

    const handleDownload = useCallback(
        async (slip: PayslipSummary) => {
            setDownloadingId(slip.period_id);
            try {
                await downloadPdf(
                    `/coach/payslips/${slip.period_id}/pdf`,
                    payslipFilename(coachName, slip.year, slip.month)
                );
            } catch (error) {
                toast.error(getErrorMessage(error, 'Gagal mengunduh slip gaji'));
            } finally {
                setDownloadingId(null);
            }
        },
        [coachName]
    );

    const columns: ColumnDef<PayslipSummary>[] = [
        { accessorKey: 'period_label', header: 'Periode' },
        { accessorKey: 'total_sessions', header: 'Sesi' },
        {
            accessorKey: 'total_amount',
            header: 'Total Diterima',
            cell: ({ row }) => (
                <span className={row.original.total_amount < 0 ? 'font-semibold text-rose-600' : 'font-medium'}>
                    {formatRupiah(row.original.total_amount)}
                </span>
            ),
        },
        {
            accessorKey: 'paid_at',
            header: 'Tanggal Dibayar',
            cell: ({ row }) => formatDate(row.original.paid_at),
        },
        {
            id: 'actions',
            header: 'Slip',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={downloadingId === row.original.period_id}
                    onClick={() => handleDownload(row.original)}
                >
                    <IconDownload size={14} className="mr-1" />
                    {downloadingId === row.original.period_id ? 'Mengunduh...' : 'Unduh PDF'}
                </Button>
            ),
        },
    ];

    if (session === 'loading') {
        return <div className="px-6 py-8">Loading...</div>;
    }

    if (!isCoach) {
        return (
            <div className="px-6">
                <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Halaman ini hanya untuk coach. Finance dapat mengunduh slip dari rincian payroll.
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 space-y-4">
            <div>
                <h1 className="text-xl font-semibold">Slip Gaji</h1>
                <p className="text-sm text-muted-foreground">
                    Slip tersedia setelah gaji periode tersebut dibayarkan.
                </p>
            </div>

            {isLoading ? (
                <DataTableSkeleton columns={5} rows={5} />
            ) : slips.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Belum ada slip gaji
                </div>
            ) : (
                <DataTable columns={columns} data={slips} />
            )}
        </div>
    );
}