'use client'

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { FloatingAddButton } from '@/components/floating-add-button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconCalendarCog, IconPencil, IconTrash } from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    class: Class;
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

interface AttendanceReportForm {
    attendance: boolean;
    motorik: string;
    locomotor: string;
    body_control: string;
    overall: number;
}

const defaultForm: AttendanceReportForm = {
    attendance: false,
    motorik: '',
    locomotor: '',
    body_control: '',
    overall: 0,
};

export default function AttendanceReportsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
    const [formData, setFormData] = useState<AttendanceReportForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);

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
            const data = await response.json();
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

    const handleSaveAttendanceReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report`;
            const token = Cookies.get('token');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => null);
                console.error('Server error response:', errorResponse);

                if (response.status === 422 && errorResponse?.errors) {
                    const errors = Object.values(errorResponse.errors).flat();
                    toast.error(errors.join(', '));
                    return;
                }

                const errorMessage = errorResponse?.message || 'Failed to save schedule';
                throw new Error(errorMessage);
            }

            await fetchAttendanceReports();
            setIsDialogOpen(false);
            setIsEditing(false);
            setEditId(null);
            setFormData(defaultForm);
            toast.success(`Attendance report ${isEditing ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error(error);
            toast.error((error as Error).message || 'Error saving attendance report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'overall' ? parseInt(value) || 0 : value,
        }));
    };

    const column: ColumnDef<AttendanceReport>[] = [
        {
            accessorKey: 'play_kid.name',
            header: 'Play Kid',
        },
        {
            accessorKey: 'schedule.class.name',
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
            accessorKey: 'overall',
            header: 'Overall',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    const report = row.original;
                                    setFormData({
                                        attendance: report.attendance,
                                        motorik: report.motorik,
                                        locomotor: report.locomotor,
                                        body_control: report.body_control,
                                        overall: report.overall,
                                    });
                                    setIsEditing(true);
                                    setEditId(report.id);
                                    setIsDialogOpen(true);
                                }}
                            >
                                <IconPencil size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Attendance Report</TooltipContent>
                    </Tooltip>
                </div>
            ),
        }
    ];

    console.log('Attendance Reports:', attendanceReports);


    return (
        <div className='px-6'>
            Attendance Report
        </div>
    )
}