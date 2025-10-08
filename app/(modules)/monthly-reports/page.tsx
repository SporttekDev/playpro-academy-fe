'use client'

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { IconFileExport } from '@tabler/icons-react';


export interface ReportResponse {
    play_kid: PlayKid;
    class: ClassWithBranch;
    attendance_reports: AttendanceReport[];
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

export interface ClassWithBranch {
    id: number;
    name: string;
    sport_id: number;
    category_id: number;
    branch: Branch;
}

export interface Branch {
    id: number;
    name: string;
    description: string | null;
}

export interface AttendanceReport {
    id: number;
    date: string;          // YYYY-MM-DD (dari schedules.date)
    start_time: string;    // HH:mm:ss
    end_time: string;      // HH:mm:ss
    attendance: number;    // 1 = hadir, 0 = tidak hadir
    motorik: string | null;
    locomotor: string | null;
    body_control: string | null;
    overall: number | null;
    coach: CoachSummary;
}

export interface CoachSummary {
    id: number;
    user_id: number;
}

const dataReport = [
    {
        "play_kid": {
            "id": 1,
            "name": "Michael Johnson",
            "nick_name": "Mikey",
            "birth_date": "2020-08-22",
            "gender": "M",
            "school_origin": "Sunshine Kindergarten"
        },
        "class": {
            "id": 2,
            "name": "Basketball Basics",
            "sport_id": 2,
            "category_id": 2,
            "branch": {
                "id": 2,
                "name": "Tangerang BSD",
                "description": "Sabtu 10:00 - 11:00 (Toddler) & 11:00 - 12:00 (Junior)"
            }
        },
        "attendance_reports": [
            {
                "id": 1,
                "date": "2025-08-15",
                "start_time": "11:11:00",
                "end_time": "12:22:00",
                "attendance": 1,
                "motorik": "Bagus banget",
                "locomotor": "Not Bad",
                "body_control": "Ada kemajuan",
                "overall": 5,
                "coach": {
                    "id": 2,
                    "user_id": 4
                }
            },
            {
                "id": 2,
                "date": "2025-08-15",
                "start_time": "11:11:00",
                "end_time": "12:22:00",
                "attendance": 1,
                "motorik": "Bagus banget",
                "locomotor": "Not Bad",
                "body_control": "Ada kemajuan",
                "overall": 5,
                "coach": {
                    "id": 2,
                    "user_id": 4
                }
            }
        ]
    }
]


export default function RaportPage() {
    const [reports, setReports] = useState<ReportResponse[]>([]);

    function formatMonthFromDate(dateStr?: string | null) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        // tampilkan dalam bahasa Indonesia (contoh: "Agustus 2025")
        return d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    }

    const fetchReports = useCallback(async () => {
        try {
            // const token = Cookies.get('token');
            // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         Accept: 'application/json',
            //     },
            // });

            // if (!response.ok) {
            //     const error = await response.text();
            //     console.error(error);
            //     throw new Error('Failed to fetch schedules');
            // }

            // const { data } = await response.json();
            setReports(dataReport);
        } catch (error) {
            console.error('Fetch schedules error:', error);
            toast.error('Failed to fetch schedule data');
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

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
            id: 'class_branch',
            header: 'Class / Branch',
            accessorFn: (row) =>
                `${row.class?.name ?? 'N/A'}${row.class?.branch ? ` — ${row.class.branch.name}` : ''}`,
            cell: ({ row }) => {
                const cls = row.original.class;
                const branch = cls?.branch;
                const className = cls?.name ?? `#${cls?.id ?? '-'}`;
                return branch ? `${className} — ${branch.name}` : className;
            },
        },
        {
            id: 'month',
            header: 'Month',
            accessorFn: (row) => {
                // derive from first attendance report date (fallback '-')
                const date = row.attendance_reports?.[0]?.date ?? null;
                return date;
            },
            cell: ({ row }) => {
                const r = row.original;
                const date = r.attendance_reports?.[0]?.date ?? null;
                // Format user-friendly month (e.g. "Agustus 2025"); kalau gagal tampilkan raw date
                return date ? formatMonthFromDate(date) : '-';
            },
        },
        {
            id: 'attendance_count',
            header: 'Attendance Count',
            accessorFn: (row) => row.attendance_reports?.length ?? 0,
            cell: ({ row }) => {
                const count = row.original.attendance_reports?.length ?? 0;
                return <span>{count}</span>;
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
                                        console.log("Export");
                                    }}
                                >
                                    <IconFileExport />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];


    return (
        <div className="px-6">
            <DataTable columns={columns} data={reports} />
        </div>
    )
}