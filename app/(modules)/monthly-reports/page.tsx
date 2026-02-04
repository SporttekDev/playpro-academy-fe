'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Cookies from 'js-cookie';
import { IconFileExport } from '@tabler/icons-react';
import { ReportPDF } from '@/components/ui/report-pdf';
import jsPDF from "jspdf"
import html2canvas from 'html2canvas-pro';

export interface ReportResponse {
    play_kid: PlayKid;
    branch: Branch;
    classes: ClassWithCategory[];
    attendance_reports: AttendanceReport[];
    attendance_count: number;
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

export default function RaportPage() {
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [reportPdf, setReportPdf] = useState<ReportResponse | null>(null);
    const [exporting, setExporting] = useState(false);

    const reportRef = useRef<HTMLDivElement | null>(null);

    // function formatMonthFromDate(dateStr?: string | null) {
    //     if (!dateStr) return '-';
    //     const d = new Date(dateStr);
    //     if (isNaN(d.getTime())) return dateStr;
    //     return d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    // }

    const fetchReports = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/playkid-reports`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch reports');
            }

            const { data } = await response.json();
            console.log("Data : ", data);
            setReports(data);
        } catch (error) {
            console.error('Fetch reports error:', error);
            toast.error('Failed to fetch report data');
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownloadPdf = useCallback(async () => {
        const element = reportRef.current;
        if (!element) {
            toast.error('Tidak ada laporan untuk di-download');
            return;
        }

        try {
            setExporting(true);
            toast('Mempersiapkan PDF...', { duration: 2000 });

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                #report-to-export, #report-to-export * {
                  box-shadow: none !important;
                  background-image: none !important;
                  filter: none !important;
                  outline: none !important;
                }
                #report-to-export { background-color: #ffffff !important; }
              `;
                    clonedDoc.head.appendChild(style);

                    clonedDoc.querySelectorAll('#report-to-export img')
                        .forEach((img) => (img as HTMLImageElement).crossOrigin = 'anonymous');
                },
            });

            const imgData = canvas.toDataURL('image/png');
            const pxToMm = (px: number) => px * 0.264583;
            const canvasWidthMm = pxToMm(canvas.width);
            const canvasHeightMm = pxToMm(canvas.height);

            const pdf = new jsPDF({
                orientation: canvasWidthMm > canvasHeightMm ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [canvasWidthMm, canvasHeightMm],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvasWidthMm, canvasHeightMm);

            const fileName = `report-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(fileName);

            toast.success('PDF berhasil di-download ✅');
        } catch (err) {
            console.error('Export PDF error:', err);
            toast.error('Gagal mengekspor PDF. Lihat console untuk detail.');
        } finally {
            setExporting(false);
        }
    }, [reportRef]);

    const columns: ColumnDef<ReportResponse>[] = [
        {
            id: 'play_kid',
            header: 'Play Kid',
            accessorFn: (row) =>
                row.play_kid?.name ?? row.play_kid?.nick_name ?? `#${row.play_kid?.id}`,
            cell: ({ row }) => {
                const report = row.original;
                const pk = report.play_kid;
                return pk ? (pk.name || pk.nick_name || `#${pk.id}`) : '-';
            },
        },
        {
            id: 'branch',
            header: 'Branch',
            accessorFn: (row) => row.branch?.name ?? 'N/A',
            cell: ({ row }) => {
                const branch = row.original.branch;
                return branch ? branch.name : '-';
            },
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
                            <div key={cls.id} className="text-sm">
                                {cls.name}
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'months',
            header: 'Months',
            accessorFn: (row) => row.months_display,
            cell: ({ row }) => {
                const months = row.original.months;
                return months && months.length > 0 ? months.join(', ') : '-';
            },
        },
        {
            id: 'attendance_count',
            header: 'Total Attendance',
            accessorFn: (row) => row.attendance_count ?? 0,
            cell: ({ row }) => {
                const count = row.original.attendance_count ?? 0;
                return <span className="font-medium">{count}</span>;
            },
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
                                <Button variant="outline" size="icon"
                                    onClick={() => {
                                        setReportPdf(report);
                                    }}
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
        <div className="px-6">
            <DataTable columns={columns} data={reports} />

            {reportPdf && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-60 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-7xl max-h-[75vh] flex flex-col">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Preview Laporan - {reportPdf.play_kid.name} - {reportPdf.branch.name}
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
                            <Button
                                onClick={() => setReportPdf(null)}
                                variant="destructive"
                            >
                                Tutup
                            </Button>

                            <Button onClick={handleDownloadPdf} disabled={exporting} variant="default">
                                {exporting ? 'Mengekspor...' : 'Download PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}