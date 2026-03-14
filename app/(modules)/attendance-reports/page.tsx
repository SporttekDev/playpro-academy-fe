'use client'

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
    IconFilePencil,
    IconDownload,
    IconUpload,
    IconReload,
} from '@tabler/icons-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface AttendanceReport {
    id: number;
    schedule_id: string;
    coach_id: string;
    play_kid_id: string;
    attendance: boolean;
    motorik: string;
    locomotor: string;
    body_control: string;
    overall: number;
    schedule: Schedule;
    coach: Coach;
    play_kid: PlayKid;
}

interface Schedule {
    id: number;
    class_id: string;
    venue_id: string;
    start_time: string;
    end_time: string;
    date: string;
    class_model: Class;
    venue: Venue;
}

interface Coach {
    id: number;
    user?: {
        name: string;
    };
}

interface PlayKid {
    id: number;
    name: string;
}

interface Class {
    id: number;
    name: string;
    branch_id: number;
    branch: Branch;
}

interface Branch {
    id: number;
    name: string;
}

interface Venue {
    id: number;
    name: string;
}

interface ImportResult {
    imported_count: number;
    updated_count: number;
    skipped_count: number;
    errors: string[];
    warnings: string[];
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

function AttendanceReportsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Baca initial state dari URL — hanya month, year, branch
    const [selectedMonth, setSelectedMonth] = useState<string>(
        searchParams.get('month') ?? String(new Date().getMonth() + 1)
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        searchParams.get('year') ?? String(currentYear)
    );
    const [selectedBranch, setSelectedBranch] = useState<string>(
        searchParams.get('branch') ?? 'all'
    );

    const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set('month', selectedMonth);
        params.set('year', selectedYear);
        params.set('branch', selectedBranch);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [selectedMonth, selectedYear, selectedBranch]);

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
            const { data } = await response.json();
            setBranches(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchAttendanceReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('token');

            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);
            if (selectedBranch && selectedBranch !== 'all') params.append('branch_id', selectedBranch);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );
            if (!response.ok) throw new Error('Failed to fetch attendance reports');
            const { data } = await response.json();
            setAttendanceReports(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching attendance reports');
        }
        setIsLoading(false);
    }, [selectedMonth, selectedYear, selectedBranch]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchAttendanceReports();
    }, [fetchAttendanceReports]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = ['.xlsx', '.xls', '.csv'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!validTypes.includes(fileExtension || '')) {
                toast.error('File harus dalam format Excel (.xlsx, .xls) atau CSV');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File terlalu besar. Maksimal 10MB');
                return;
            }
            setSelectedFile(file);
            setImportResult(null);
        }
    };

    const downloadTemplate = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/playkid-reports/download-template`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Failed to download template');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'playkid_report_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Template berhasil didownload');
        } catch (error) {
            console.error(error);
            toast.error('Gagal download template');
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }
        setImportLoading(true);
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('file', selectedFile);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/playkid-reports/import`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );
            const result = await response.json();
            if (result.success) {
                setImportResult(result.data);
                toast.success(
                    `Import berhasil: ${result.data.imported_count} data baru, ${result.data.updated_count} data diperbarui`
                );
                fetchAttendanceReports();
                setTimeout(() => {
                    setSelectedFile(null);
                    setImportResult(null);
                    setIsImportDialogOpen(false);
                }, 3000);
            } else {
                toast.error(result.message || 'Import gagal');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saat import file');
        }
        setImportLoading(false);
    };

    const resetImport = () => {
        setSelectedFile(null);
        setImportResult(null);
    };

    const columns: ColumnDef<AttendanceReport>[] = [
        {
            header: 'Play Kid',
            accessorFn: (row) => row.play_kid?.name,
        },
        {
            accessorKey: 'schedule.class_model.name',
            header: 'Class',
        },
        {
            accessorKey: 'schedule.start_time',
            header: 'Start Time',
        },
        {
            accessorKey: 'schedule.date',
            header: 'Date',
        },
        {
            accessorKey: 'attendance',
            header: 'Attendance',
            cell: ({ row }) => (row.original.attendance ? 'Present' : 'Absent'),
        },
        {
            header: 'Reports',
            cell: ({ row }) => {
                const isSubmitted =
                    row.original.motorik || row.original.locomotor || row.original.body_control;
                if (!isSubmitted) return 'Not Submitted';
                const coachName = row.original.coach?.user?.name ?? 'Unknown';
                return `Submitted by ${coachName}`;
            },
        },
        {
            accessorKey: 'overall',
            header: 'Overall',
            cell: ({ row }) => (row.original.overall ? row.original.overall : '-'),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={`/attendance-reports/${row.original.id}?returnTo=${encodeURIComponent('?' + searchParams.toString())}`}
                            >
                                <Button variant="outline" size="icon">
                                    <IconFilePencil size={16} />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Submit Report</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className='px-6 space-y-4'>
            {/* Filter + Actions Row */}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {/* Month */}
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year */}
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((y) => (
                                <SelectItem key={y.value} value={y.value}>
                                    {y.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Branch */}
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Branch</SelectItem>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={fetchAttendanceReports} disabled={isLoading}>
                                <IconReload size={16} className={isLoading ? 'animate-spin' : ''} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh Data</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={downloadTemplate}>
                                <IconDownload size={16} />
                                <span className="ml-2">Template</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Template Excel</TooltipContent>
                    </Tooltip>

                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button>
                                        <IconUpload size={16} />
                                        <span className="ml-2">Import Data</span>
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Import Data</TooltipContent>
                        </Tooltip>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Import Data Reports</DialogTitle>
                                <DialogDescription>
                                    Upload file Excel untuk import data attendance reports
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Format: .xlsx, .xls, .csv (maks. 10MB)
                                    </p>
                                </div>
                                {selectedFile && (
                                    <div className="p-3 border rounded-md bg-muted/50">
                                        <p className="text-sm font-medium">File terpilih:</p>
                                        <p className="text-sm">
                                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    </div>
                                )}
                                {importLoading && (
                                    <p className="text-sm text-center">Sedang mengimport data...</p>
                                )}
                                {importResult && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <p className="font-bold text-green-600">{importResult.imported_count}</p>
                                                <p>Data Baru</p>
                                            </div>
                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <p className="font-bold text-blue-600">{importResult.updated_count}</p>
                                                <p>Data Diupdate</p>
                                            </div>
                                            <div className="text-center p-2 bg-red-50 rounded">
                                                <p className="font-bold text-red-600">{importResult.skipped_count}</p>
                                                <p>Data Dilewati</p>
                                            </div>
                                        </div>
                                        {importResult.errors.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-red-600 mb-2">Error saat import:</p>
                                                <div className="max-h-32 overflow-y-auto text-sm">
                                                    {importResult.errors.map((error, index) => (
                                                        <p key={index} className="text-red-600 py-1">• {error}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {importResult.warnings.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-yellow-600 mb-2">Peringatan:</p>
                                                <div className="max-h-32 overflow-y-auto text-sm">
                                                    {importResult.warnings.map((warning, index) => (
                                                        <p key={index} className="text-yellow-600 py-1">• {warning}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={resetImport}>Reset</Button>
                                    <Button onClick={handleImport} disabled={!selectedFile || importLoading}>
                                        {importLoading ? 'Importing...' : 'Import Data'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={attendanceReports} />
        </div>
    );
}

export default function AttendanceReportsPage() {
    return (
        <Suspense fallback={<div className="px-6 py-8">Loading...</div>}>
            <AttendanceReportsContent />
        </Suspense>
    );
}