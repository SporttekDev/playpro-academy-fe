'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Cookies from 'js-cookie';
import { IconFileExport, IconFileZip } from '@tabler/icons-react';
import { ReportPDF } from '@/components/ui/report-pdf';
import jsPDF from "jspdf";
import html2canvas from 'html2canvas-pro';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { flushSync } from 'react-dom';
import JSZip from 'jszip'; // IconFileZip ditambahkan


export interface ReportResponse {
    play_kid: PlayKid;
    branch: Branch;
    classes: ClassWithCategory[];
    attendance_reports: AttendanceReport[];
    attendance_count: number;
    month_year: string;
    month_display: string;
    months: string[];
    months_display: string;
}

export interface PlayKid {
    id: number;
    name: string;
    nick_name: string | null;
    birth_date: string;
    gender: "M" | "F" | string;
    school_origin: string | null;
    photo?: string | null;
    medical_history?: string | null;
}

export interface Branch {
    id: number;
    name: string;
    description: string | null;
}

export interface ClassWithCategory {
    id: number;
    name: string;
    sport_id: number;
    category_id: number;
    category: Category | null;
    sport: Sport | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Sport {
    id: number;
    name: string;
}

export interface AttendanceReport {
    id: number;
    class_id: number;
    class_name: string;
    date: string;
    start_time: string;
    end_time: string;
    attendance: number;
    motorik: string | null;
    locomotor: string | null;
    body_control: string | null;
    overall: number | null;
    coach: CoachSummary;
    month_year: string;
}

export interface CoachSummary {
    id: number;
    user_id: number;
    name: string;
    photo?: string | null;
}

interface BranchOption {
    id: string;
    name: string;
}

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

const pxToMm = (px: number) => px * 0.264583;

const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

// Memuat ulang semua <img> di dalam element (cache-bust + CORS) dan menunggu sampai selesai.
async function waitForImages(root: HTMLElement) {
    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
        images.map(
            (img) =>
                new Promise<void>((resolve) => {
                    const done = () => resolve();
                    img.loading = 'eager'; // next/image default-nya lazy
                    img.crossOrigin = 'anonymous';
                    img.onload = done;
                    img.onerror = done; // jangan sampai satu foto gagal menggantung seluruh proses
                    const url = new URL(img.src);
                    url.searchParams.set('cache_bust', Date.now().toString());
                    img.src = url.toString();
                    setTimeout(done, 15000); // timeout pengaman
                })
        )
    );
}

// Render element menjadi PDF (Blob). Dipakai oleh download satuan dan download all.
async function elementToPdfBlob(element: HTMLElement): Promise<Blob> {
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
                #${element.id}, #${element.id} * {
                    box-shadow: none !important;
                    background-image: none !important;
                    filter: none !important;
                    outline: none !important;
                }
                #${element.id} { background-color: #ffffff !important; }
            `;
            clonedDoc.head.appendChild(style);
            clonedDoc
                .querySelectorAll(`#${element.id} img`)
                .forEach((img) => ((img as HTMLImageElement).crossOrigin = 'anonymous'));
        },
    });

    const widthMm = pxToMm(canvas.width);
    const heightMm = pxToMm(canvas.height);

    const pdf = new jsPDF({
        orientation: widthMm > heightMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthMm, heightMm],
    });

    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, widthMm, heightMm);
    const blob = pdf.output('blob');

    // bebaskan memori canvas, penting untuk batch besar
    canvas.width = 0;
    canvas.height = 0;

    return blob;
}

function saveBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function RaportPage() {

    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [reportPdf, setReportPdf] = useState<ReportResponse | null>(null);
    const [exporting, setExporting] = useState(false);
    const [branches, setBranches] = useState<BranchOption[]>([]);

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedBranch, setSelectedBranch] = useState<string>('all');

    const [batchReport, setBatchReport] = useState<ReportResponse | null>(null);
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
    const batchRef = useRef<HTMLDivElement | null>(null);
    const cancelRef = useRef(false);

    const reportRef = useRef<HTMLDivElement | null>(null);

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) return;
            const result = await response.json();
            setBranches(result.data ?? result);
        } catch (error) {
            console.error('Fetch branches error:', error);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);
            if (selectedBranch && selectedBranch !== 'all') params.append('branch_id', selectedBranch);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/playkid-reports?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch reports');
            }

            const { data } = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Fetch reports error:', error);
            toast.error('Failed to fetch report data');
        }
    }, [selectedMonth, selectedYear, selectedBranch]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownloadPdf = useCallback(async () => {
        const element = reportRef.current;
        if (!element || !reportPdf) {
            toast.error('Tidak ada laporan untuk di-download');
            return;
        }

        try {
            setExporting(true);
            toast('Mempersiapkan PDF...', { duration: 2000 });

            await waitForImages(element);
            const blob = await elementToPdfBlob(element);
            saveBlob(blob, `${sanitizeFileName(reportPdf.play_kid.name)} - ${reportPdf.month_display}.pdf`);

            toast.success('PDF berhasil di-download');
        } catch (err) {
            console.error('Export PDF error:', err);
            toast.error('Gagal mengekspor PDF. Lihat console untuk detail.');
        } finally {
            setExporting(false);
        }
    }, [reportPdf]);

    const handleDownloadAll = useCallback(async () => {
        if (reports.length === 0) {
            toast.error('Tidak ada laporan untuk di-download');
            return;
        }

        cancelRef.current = false;
        const total = reports.length;
        setBatchProgress({ current: 0, total });

        const zip = new JSZip();
        const usedNames = new Map<string, number>();
        let failed = 0;

        try {
            for (let i = 0; i < total; i++) {
                if (cancelRef.current) break;

                const report = reports[i];

                // render laporan ini ke container tersembunyi, lalu tunggu DOM siap
                flushSync(() => setBatchReport(report));
                const element = batchRef.current;

                try {
                    if (!element) throw new Error('Container tidak ditemukan');
                    await waitForImages(element);
                    await nextFrame();
                    const blob = await elementToPdfBlob(element);

                    // nama file: "Nama - Bulan Tahun.pdf", beri suffix bila kembar
                    const base = sanitizeFileName(`${report.play_kid.name} - ${report.month_display}`);
                    const count = (usedNames.get(base) ?? 0) + 1;
                    usedNames.set(base, count);
                    zip.file(count > 1 ? `${base} (${count}).pdf` : `${base}.pdf`, blob);
                } catch (err) {
                    failed++;
                    console.error(`Gagal membuat PDF untuk ${report.play_kid.name}:`, err);
                }

                setBatchProgress({ current: i + 1, total });
            }

            if (cancelRef.current) {
                toast.info('Download dibatalkan');
                return;
            }

            if (failed === total) {
                toast.error('Semua laporan gagal dibuat');
                return;
            }

            // PDF sudah terkompres, jadi STORE (tanpa kompresi ulang) lebih cepat
            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

            const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;
            const branchLabel =
                selectedBranch === 'all'
                    ? 'Semua Branch'
                    : branches.find((b) => String(b.id) === selectedBranch)?.name ?? selectedBranch;

            saveBlob(zipBlob, sanitizeFileName(`Laporan ${monthLabel} ${selectedYear} - ${branchLabel}`) + '.zip');

            if (failed > 0) {
                toast.warning(`${total - failed} laporan berhasil, ${failed} gagal`);
            } else {
                toast.success(`${total} laporan berhasil di-download`);
            }
        } catch (err) {
            console.error('Download all error:', err);
            toast.error('Gagal membuat ZIP');
        } finally {
            setBatchReport(null);
            setBatchProgress(null);
        }
    }, [reports, branches, selectedMonth, selectedYear, selectedBranch]);

    const columns: ColumnDef<ReportResponse>[] = [
        {
            id: 'play_kid',
            header: 'Play Kid',
            accessorFn: (row) => row.play_kid?.name ?? row.play_kid?.nick_name ?? `#${row.play_kid?.id}`,
            cell: ({ row }) => {
                const pk = row.original.play_kid;
                return pk ? (pk.name || pk.nick_name || `#${pk.id}`) : '-';
            },
        },
        {
            id: 'branch',
            header: 'Branch',
            accessorFn: (row) => row.branch?.name ?? 'N/A',
            cell: ({ row }) => row.original.branch?.name ?? '-',
        },
        {
            id: 'month',
            header: 'Bulan',
            accessorFn: (row) => row.month_display,
            cell: ({ row }) => (
                <span className="font-medium">{row.original.month_display}</span>
            ),
        },
        {
            id: 'classes',
            header: 'Classes',
            accessorFn: (row) => row.classes?.map(cls => cls.name).join(', ') ?? 'N/A',
            cell: ({ row }) => {
                const classes = row.original.classes;
                if (!classes || classes.length === 0) return '-';
                return (
                    <div className="max-w-xs">
                        {classes.map((cls) => (
                            <div key={cls.id} className="text-sm">{cls.name}</div>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'attendance_count',
            header: 'Total Attendance',
            accessorFn: (row) => row.attendance_count ?? 0,
            cell: ({ row }) => (
                <span className="font-medium">{row.original.attendance_count ?? 0}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setReportPdf(report)}
                                >
                                    <IconFileExport />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export Report</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];



    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map((y) => (
                            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Pilih Branch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Branch</SelectItem>
                        {branches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2">
                {batchProgress && (
                    <Button variant="outline" onClick={() => (cancelRef.current = true)}>
                        Batal
                    </Button>
                )}
                <Button onClick={handleDownloadAll} disabled={!!batchProgress || reports.length === 0}>
                    <IconFileZip size={16} />
                    <span className="ml-2">
                        {batchProgress
                            ? `Mengekspor ${batchProgress.current}/${batchProgress.total}...`
                            : `Download Semua (${reports.length})`}
                    </span>
                </Button>
            </div>

            <DataTable columns={columns} data={reports} />

            {reportPdf && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-60 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-7xl max-h-[75vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Preview Laporan - {reportPdf.play_kid.name} - {reportPdf.branch.name} - {reportPdf.month_display}
                            </h2>
                            <button
                                onClick={() => setReportPdf(null)}
                                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                            <div className="w-full h-full flex justify-center">
                                <div className="w-full max-w-5xl" ref={reportRef} id="report-to-export">
                                    <ReportPDF report={reportPdf} />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-white dark:bg-gray-900 rounded-b-2xl space-x-2">
                            <Button onClick={() => setReportPdf(null)} variant="destructive">
                                Tutup
                            </Button>
                            <Button onClick={handleDownloadPdf} disabled={exporting} variant="default">
                                {exporting ? 'Mengekspor...' : 'Download PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {batchReport && (
                <div
                    aria-hidden
                    style={{ position: 'fixed', top: 0, left: 0, width: 1024, zIndex: -1, pointerEvents: 'none' }}
                >
                    <div ref={batchRef} id="batch-report-to-export" style={{ width: 1024, background: '#fff' }}>
                        <ReportPDF report={batchReport} />
                    </div>
                </div>
            )}
        </div>
    );
}