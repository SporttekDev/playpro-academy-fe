'use client'

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { IconFilePencil } from '@tabler/icons-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

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
    name: string;
}

interface PlayKid {
    id: number;
    name: string;
}

interface Class {
    id: number;
    name: string;
}

interface Venue {
    id: number;
    name: string;
}

export default function AttendanceReportsPage() {

    const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const fetchAttendanceReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch attendance reports');
            }
            const { data } = await response.json();
            setAttendanceReports(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching attendance reports');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAttendanceReports();
    }, [fetchAttendanceReports]);

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
            accessorKey: 'schedule.end_time',
            header: 'End Time'
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
            cell: ({ row }) => (row.original.motorik || row.original.locomotor || row.original.body_control ? 'Submitted' : 'Not Submitted'),
        },
        {
            accessorKey: 'overall',
            header: 'Overall',
            cell: ({ row }) => (row.original.overall? row.original.overall : '-'),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href={`/attendance-reports/${row.original.id}`}>
                                <Button variant="outline" size="icon">
                                    <IconFilePencil />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Submit Report</TooltipContent>
                    </Tooltip>
                </div>
            ),
        }
    ];

    return (
        <div className='px-6'>
            <DataTable columns={columns} data={attendanceReports} />
        </div>
    )
}