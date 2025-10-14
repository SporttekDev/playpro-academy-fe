'use client';

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
import { DatePicker } from '@/components/date-picker';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/multi-select';

interface Schedule {
    id: number;
    name: string;
    class_id: string;
    start_time: string;
    end_time: string;
    date: string;
    quota: number;
    venue_id: string;
    class_model?: {
        id: string;
        name: string;
    };
    venue?: {
        id: string;
        name: string;
    };
}

interface ScheduleForm {
    name: string;
    class_id: string;
    start_time: string;
    end_time: string;
    date: string;
    quota: number;
    venue_id: string;
}

interface ClassData {
    id: string;
    name: string;
    branch_id: string;
}

interface Venue {
    id: string;
    name: string;
    branch: {
        id: string;
    };
}

interface Coach {
    id: string;
    name: string;
}

interface CoachSchedule {
    id: number;
    coach_id: number;
    schedule_id: number;
    is_head_coach: boolean;
    attendance?: string;
    coach?: {
        id: string;
        name: string;
    };
}

interface AttendanceReport {
    id: number;
    schedule_id: number;
    coach_id: number;
    play_kid_id: number;
    attendance: boolean;
    motorik?: string;
    locomotor?: string;
    body_control?: string;
    overall?: number;
    play_kid?: {
        id: string;
        name: string;
        gender: string;
    };
    coach?: {
        id: string;
        name: string;
    };
}

interface PlayKid {
    id: string;
    name: string;
    gender: string;
}

const defaultForm: ScheduleForm = {
    name: '',
    class_id: '',
    start_time: '',
    end_time: '',
    date: '',
    quota: 0,
    venue_id: '',
};

interface CoachScheduleForm {
    id?: number;
    schedule_id: number;
    coach_id: string;
    is_head_coach: boolean;
    attendance?: string;
}

const defaultCoachScheduleForm: CoachScheduleForm = {
    schedule_id: 0,
    coach_id: "",
    is_head_coach: false,
    attendance: '',
};

interface AttendanceReportForm {
    id?: number;
    schedule_id: number;
    coach_id?: number | null;
    play_kid_id: number[];
    attendance: boolean;
    motorik?: string;
    locomotor?: string;
    body_control?: string;
    overall?: number;
}

const defaultAttendanceReportForm: AttendanceReportForm = {
    schedule_id: 0,
    coach_id: null,
    play_kid_id: [],
    attendance: false,
    motorik: '',
    locomotor: '',
    body_control: '',
    overall: 0,
};

const formatTimeForInput = (timeString: string): string => {
    if (!timeString) return '';

    if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        return timeString.substring(0, 5);
    }

    return timeString;
};

const formatTimeForAPI = (timeString: string): string => {
    if (!timeString) return '';

    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
        return timeString.substring(0, 5);
    }

    if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
    }

    return timeString;
};

export default function SchedulesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [playKids, setPlayKids] = useState<PlayKid[]>([]);
    const [coachSchedule, setCoachSchedule] = useState<CoachSchedule[]>([]);
    const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);

    const [formData, setFormData] = useState<ScheduleForm>(defaultForm);
    const [coachScheduleFormData, setCoachScheduleFormData] = useState<CoachScheduleForm>(defaultCoachScheduleForm);
    const [attendanceFormData, setAttendanceFormData] = useState<AttendanceReportForm>(defaultAttendanceReportForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("coach_schedule");
    const [isCoachEditing, setIsCoachEditing] = useState(false);
    const [isAttendanceEditing, setIsAttendanceEditing] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const fetchSchedules = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch schedules');
            }

            const { data } = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Fetch schedules error:', error);
            toast.error('Failed to fetch schedule data');
        }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/class`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("error : ", error);
                throw new Error('Failed to fetch classes');
            }

            const { data } = await response.json();
            setClasses(data);
        } catch (error) {
            console.error('Fetch classes error:', error);
            toast.error('Failed to fetch class data');
        }
    }, []);

    const fetchVenues = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/venue`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch venues');
            }

            const { data } = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Fetch venues error:', error);
            toast.error('Failed to fetch venue data');
        }
    }, []);

    const fetchCoaches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Fetch coaches error:', error);
                throw new Error('Failed to fetch coaches');
            }

            const { data } = await response.json();
            console.log('Fetched coaches:', data);
            setCoaches(data);
        } catch (error) {
            console.error('Fetch coaches error:', error);
            toast.error('Failed to fetch coach data');
        }
    }, []);

    const fetchEligiblePlayKids = useCallback(async (scheduleId: number) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/eligible-playkids`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch eligible play kids');
            }

            const { data } = await response.json();
            setPlayKids(data);
        } catch (error) {
            console.error('Fetch eligible play kids error:', error);
            toast.error('Failed to fetch eligible play kid data');
        }
    }, []);

    const fetchCoachSchedules = useCallback(async (scheduleId: number) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/coaches`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch coach schedules');
            }

            const { data } = await response.json();
            setCoachSchedule(data);
        } catch (error) {
            console.error('Fetch coach schedules error:', error);
            toast.error('Failed to fetch coach schedule data');
        }
    }, []);

    const fetchAttendanceReports = useCallback(async (scheduleId: number) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/attendance`, {
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
            setAttendanceReport(data);
        } catch (error) {
            console.error('Fetch attendance reports error:', error);
            toast.error('Failed to fetch attendance report data');
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
        fetchClasses();
        fetchVenues();
        fetchCoaches();
    }, [fetchSchedules, fetchClasses, fetchVenues, fetchCoaches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    useEffect(() => {
        if (isScheduleDialogOpen && activeScheduleId) {
            fetchCoachSchedules(activeScheduleId);
            fetchAttendanceReports(activeScheduleId);
            fetchEligiblePlayKids(activeScheduleId);
        }
    }, [isScheduleDialogOpen, activeScheduleId, fetchCoachSchedules, fetchAttendanceReports, fetchEligiblePlayKids]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            venue_id: '', 
        }));
    }, [formData.class_id]);

    const handleSaveSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.class_id || !formData.start_time.trim() || !formData.end_time.trim() || !formData.date.trim() || !formData.quota || !formData.venue_id) {
            toast.error('All fields are required');
            return;
        }

        const startTime = formatTimeForAPI(formData.start_time);
        const endTime = formatTimeForAPI(formData.end_time);

        if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
            toast.error('Please enter valid time format (HH:MM)');
            return;
        }

        if (startTime >= endTime) {
            toast.error('End time must be after start time');
            return;
        }

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule`;
            const token = Cookies.get('token');

            let submitData = {
                ...formData,
                start_time: startTime,
                end_time: endTime,
                quota: Number(formData.quota),
            };

            if (!isEditing) {
                const selectedClass = classes.find(cls => cls.id.toString() === formData.class_id);
                const selectedVenue = venues.find(venue => venue.id.toString() === formData.venue_id);
                if (selectedClass && selectedVenue) {
                    const generatedName = `${selectedClass.name}, ${selectedVenue.name}, ${formData.date}, ${startTime}-${endTime}`;
                    submitData = { ...submitData, name: generatedName };
                }
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(submitData),
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

            await fetchSchedules();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? 'Schedule updated successfully!' : 'Schedule created successfully!');
        } catch (error) {
            console.error('Save schedule error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save schedule');
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteSchedule() {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            await fetchSchedules();
            toast.success('Schedule deleted successfully!');
        } catch (error) {
            console.error('Delete schedule error:', error);
            toast.error('Failed to delete schedule');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'quota' ? parseInt(value) || 0 : value,
        }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            setFormData((prev) => ({
                ...prev,
                date: `${year}-${month}-${day}`,
            }));
        }
    };

    const handleTimeChange = (time: string, field: 'start_time' | 'end_time') => {
        setFormData((prev) => ({
            ...prev,
            [field]: time,
        }));
    };

    const handleSaveCoachSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!coachScheduleFormData.coach_id || coachScheduleFormData.is_head_coach === undefined) {
            toast.error('Coach and Head Coach status are required');
            return;
        }
        try {
            setIsLoading(true);
            const token = Cookies.get('token');
            const scheduleId = activeScheduleId;
            if (!scheduleId) {
                toast.error('No schedule selected');
                return;
            }

            const method = isCoachEditing ? 'PUT' : 'POST';
            const url = isCoachEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/coaches/${coachScheduleFormData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/coaches`;

            const submitData = {
                coach_id: coachScheduleFormData.coach_id,
                is_head_coach: coachScheduleFormData.is_head_coach,
                attendance: coachScheduleFormData.attendance || null,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                toast.error(errorResponse.message || 'Failed to save coach schedule');
                return;
            }

            await fetchCoachSchedules(scheduleId);
            setCoachScheduleFormData(defaultCoachScheduleForm);
            setIsCoachEditing(false);
            toast.success(isCoachEditing ? 'Coach schedule updated successfully!' : 'Coach schedule created successfully!');
        } catch (error) {
            console.error('Save coach schedule error:', error);
            toast.error('Failed to save coach schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCoachSchedule = async () => {
        try {
            const token = Cookies.get('token');
            const scheduleId = activeScheduleId;
            if (!scheduleId || !deleteId) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/coaches/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete coach schedule');
            }

            await fetchCoachSchedules(scheduleId);
            toast.success('Coach schedule deleted successfully!');
        } catch (error) {
            console.error('Delete coach schedule error:', error);
            toast.error('Failed to delete coach schedule');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const handleSaveAttendanceReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!attendanceFormData.play_kid_id || attendanceFormData.play_kid_id.length === 0) {
            toast.error('Play Kids are required');
            return;
        }

        try {
            setIsLoading(true);
            const token = Cookies.get('token');
            const scheduleId = activeScheduleId;
            if (!scheduleId) {
                toast.error('No schedule selected');
                return;
            }

            const method = isAttendanceEditing ? 'PUT' : 'POST';
            const url = isAttendanceEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/attendance/${attendanceFormData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/attendance`;

            const submitData = isAttendanceEditing ? {
                coach_id: attendanceFormData.coach_id || null,
                play_kid_id: attendanceFormData.play_kid_id[0],
                attendance: attendanceFormData.attendance || false,
                motorik: attendanceFormData.motorik || null,
                locomotor: attendanceFormData.locomotor || null,
                body_control: attendanceFormData.body_control || null,
                overall: attendanceFormData.overall || null,
            } : {
                coach_id: attendanceFormData.coach_id || null,
                play_kid_id: attendanceFormData.play_kid_id,
                attendance: attendanceFormData.attendance || false,
                motorik: attendanceFormData.motorik || null,
                locomotor: attendanceFormData.locomotor || null,
                body_control: attendanceFormData.body_control || null,
                overall: attendanceFormData.overall || null,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            console.log("Response : ", response);

            if (!response.ok) {
                const errorResponse = await response.json();
                toast.error(errorResponse.message || 'Failed to save attendance report');
                return;
            }

            await fetchAttendanceReports(scheduleId);
            await fetchSchedules();
            await fetchEligiblePlayKids(scheduleId);
            setAttendanceFormData(defaultAttendanceReportForm);
            setIsAttendanceEditing(false);
            toast.success(isAttendanceEditing ? 'Attendance report updated successfully!' : 'Attendance report created successfully!');
        } catch (error) {
            console.error('Save attendance report error:', error);
            toast.error('Failed to save attendance report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAttendanceReport = async () => {
        try {
            const token = Cookies.get('token');
            const scheduleId = activeScheduleId;
            if (!scheduleId || !deleteId) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${scheduleId}/attendance/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete attendance report');
            }

            await fetchAttendanceReports(scheduleId);
            await fetchEligiblePlayKids(scheduleId);
            await fetchSchedules();
            
            toast.success('Attendance report deleted successfully!');
        } catch (error) {
            console.error('Delete attendance report error:', error);
            toast.error('Failed to delete attendance report');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const columns: ColumnDef<Schedule>[] = [
        {
            accessorKey: 'class_id',
            header: 'Class',
            cell: ({ row }) => {
                const schedule = row.original;
                return schedule.class_model?.name || schedule.class_id;
            },
        },
        {
            accessorKey: 'venue_id',
            header: 'Venue',
            cell: ({ row }) => {
                const schedule = row.original;
                return schedule.venue?.name || schedule.venue_id;
            },
        },
        { accessorKey: 'date', header: 'Date' },
        {
            accessorKey: 'start_time',
            header: 'Start Time',
            cell: ({ row }) => formatTimeForInput(row.getValue('start_time')),
        },
        {
            accessorKey: 'end_time',
            header: 'End Time',
            cell: ({ row }) => formatTimeForInput(row.getValue('end_time')),
        },
        { accessorKey: 'quota', header: 'Quota' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const schedule = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setActiveScheduleId(schedule.id);
                                        setIsScheduleDialogOpen(true);
                                    }}
                                >
                                    <IconCalendarCog className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Manage Schedule
                            </TooltipContent>
                        </Tooltip>
                        {/* <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(schedule.id);
                                        setFormData({
                                            name: schedule.name || '',
                                            class_id: schedule.class_id.toString(),
                                            start_time: formatTimeForInput(schedule.start_time),
                                            end_time: formatTimeForInput(schedule.end_time),
                                            date: schedule.date,
                                            quota: schedule.quota,
                                            venue_id: schedule.venue_id.toString(),
                                        });
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Edit
                            </TooltipContent>
                        </Tooltip> */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setDeleteId(schedule.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <IconTrash className="w-4 h-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Delete
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    const coachColumns: ColumnDef<CoachSchedule>[] = [
        {
            accessorKey: 'coach.name',
            header: 'Coach',
            cell: ({ row }) => row.original.coach?.name || 'Unknown', // Fallback for missing name
        },
        {
            accessorKey: 'is_head_coach',
            header: 'Head Coach',
            cell: ({ row }) => (row.original.is_head_coach ? 'Yes' : 'No'),
        },
        {
            accessorKey: 'attendance',
            header: 'Attendance',
            cell: ({ row }) => {
                const attendance = row.getValue('attendance');
                return attendance || 'Not Set';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const coachSchedule = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsCoachEditing(true);
                                        setCoachScheduleFormData({
                                            id: coachSchedule.id,
                                            schedule_id: coachSchedule.schedule_id,
                                            coach_id: coachSchedule.coach_id.toString(),
                                            is_head_coach: coachSchedule.is_head_coach,
                                            attendance: coachSchedule.attendance || '',
                                        });
                                    }}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Edit
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setDeleteId(coachSchedule.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <IconTrash className="w-4 h-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Delete
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    const attendanceColumns: ColumnDef<AttendanceReport>[] = [
        {
            accessorKey: 'play_kid.name',
            header: 'Play Kid',
            cell: ({ row }) => row.original.play_kid?.name || 'Unknown',
        },
        {
            accessorKey: 'play_kid.gender',
            header: 'Gender',
            cell: ({ row }) => {
                const gender = row.original.play_kid?.gender;
                return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Unknown';
            },
        },
        {
            accessorKey: 'attendance',
            header: 'Attendance',
            cell: ({ row }) => (row.original.attendance ? 'Present' : 'Absent'),
        },
        {
            accessorKey: 'coach.name',
            header: 'Coach',
            cell: ({ row }) => row.original.coach?.name || 'Not assigned',
        },
        {
            header: 'Report',
            cell: ({ row }) => {
                const report = row.original;
                const isReported = report.motorik || report.locomotor || report.body_control || report.overall;
                return isReported ? 'Reported' : 'Not Reported';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const attendanceReport = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsAttendanceEditing(true);
                                        setAttendanceFormData({
                                            id: attendanceReport.id,
                                            schedule_id: attendanceReport.schedule_id,
                                            coach_id: attendanceReport.coach_id,
                                            play_kid_id: Array.isArray(attendanceReport.play_kid_id) ? attendanceReport.play_kid_id : [attendanceReport.play_kid_id], 
                                            attendance: attendanceReport.attendance,
                                            motorik: attendanceReport.motorik || '',
                                            locomotor: attendanceReport.locomotor || '',
                                            body_control: attendanceReport.body_control || '',
                                            overall: attendanceReport.overall || 0,
                                        });
                                    }}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Edit
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setDeleteId(attendanceReport.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <IconTrash className="w-4 h-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Delete
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="px-6">
                <DataTable columns={columns} data={schedules} />
            </div>

            <FloatingAddButton
                onClick={() => {
                    setIsEditing(false);
                    setFormData(defaultForm);
                    setIsDialogOpen(true);
                }}
                tooltip="Add Schedule"
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit schedule details as needed.'
                                : 'Fill in the form below to add a new schedule.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveSchedule}>
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label>Class</Label>
                                <Select
                                    value={formData.class_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, class_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.length > 0 ? (
                                            classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="0" disabled>
                                                No classes available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Venue</Label>
                                <Select
                                    value={formData.venue_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, venue_id: value }))}
                                    disabled={!formData.class_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.class_id ? 'Choose venue' : 'Select a class first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.class_id ? (
                                            venues
                                                .filter((venue) => {
                                                    const selectedClass = classes.find((cls) => cls.id.toString() === formData.class_id);
                                                    return selectedClass ? venue.branch.id === selectedClass.branch_id : false;
                                                })
                                                .map((venue) => (
                                                    <SelectItem key={venue.id} value={venue.id.toString()}>
                                                        {venue.name}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <SelectItem value="0" disabled>
                                                Please select a class first
                                            </SelectItem>
                                        )}
                                        {formData.class_id &&
                                            venues.filter((venue) => {
                                                const selectedClass = classes.find((cls) => cls.id.toString() === formData.class_id);
                                                return selectedClass ? venue.branch.id === selectedClass.branch_id : false;
                                            }).length === 0 && (
                                                <SelectItem value="0" disabled>
                                                    No venues available for this class
                                                </SelectItem>
                                            )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Date</Label>
                                <DatePicker
                                    value={formData.date ? new Date(formData.date) : undefined}
                                    onChange={handleDateChange}
                                    modal={true}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => handleTimeChange(e.target.value, 'start_time')}
                                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => handleTimeChange(e.target.value, 'end_time')}
                                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Quota</Label>
                                <Input
                                    name="quota"
                                    type="number"
                                    min="1"
                                    value={formData.quota || ''}
                                    onChange={handleChange}
                                    placeholder="Enter quota"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Loading...' : isEditing ? 'Save Changes' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Manage Schedule</DialogTitle>
                        <DialogDescription>
                            Manage coach and play kid list for the selected schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="coach_schedule">Coach</TabsTrigger>
                            <TabsTrigger value="attendance_report">Play Kids</TabsTrigger>
                        </TabsList>

                        <TabsContent value="coach_schedule" className="space-y-4">
                            <DataTable columns={coachColumns} data={coachSchedule} />
                            <form onSubmit={handleSaveCoachSchedule}>
                                <div className="grid gap-4">
                                    <div className="space-y-1">
                                        <Label>Coach</Label>
                                        <Select
                                            value={coachScheduleFormData.coach_id}
                                            onValueChange={(value) =>
                                                setCoachScheduleFormData((prev) => ({
                                                    ...prev,
                                                    coach_id: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose coach" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {coaches.length > 0 ? (
                                                    coaches.map((coach) => (
                                                        <SelectItem key={coach.id} value={coach.id.toString()}>
                                                            {coach.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="0" disabled>
                                                        No coaches available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Is Head Coach</Label>
                                        <Select
                                            value={coachScheduleFormData.is_head_coach ? 'true' : 'false'}
                                            onValueChange={(value) =>
                                                setCoachScheduleFormData((prev) => ({
                                                    ...prev,
                                                    is_head_coach: value === 'true',
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading
                                            ? 'Loading...'
                                            : isCoachEditing
                                                ? 'Update Coach Schedule'
                                                : 'Add Coach Schedule'}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="attendance_report" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    Available Quota: {schedules.find(s => s.id === activeScheduleId)?.quota || 0}
                                </div>
                            </div>
                            
                            <DataTable columns={attendanceColumns} data={attendanceReport} />
                            
                            <form onSubmit={handleSaveAttendanceReport}>
                                <div className="grid gap-4">
                                    <div className="space-y-1">
                                        <Label>Play Kid</Label>
                                        <MultiSelect
                                            value={attendanceFormData.play_kid_id.map(String)}
                                            onValueChange={(value) =>
                                                setAttendanceFormData((prev) => ({ 
                                                    ...prev, 
                                                    play_kid_id: value.map(Number)
                                                }))
                                            }
                                            options={playKids.map((kid) => ({
                                                value: kid.id.toString(),
                                                label: `${kid.name} (${kid.gender === 'M' ? 'Male' : 'Female'})`,
                                            }))}
                                            placeholder="Select play kids"
                                            modalPopover={true}
                                            disabled={isAttendanceEditing} 
                                        />
                                    </div>
                                    
                                    {/* {isAttendanceEditing && (
                                        <>
                                            <div className="space-y-1">
                                                <Label>Coach</Label>
                                                <Select
                                                    value={attendanceFormData.coach_id?.toString() || ''}
                                                    onValueChange={(value) =>
                                                        setAttendanceFormData((prev) => ({
                                                            ...prev,
                                                            coach_id: parseInt(value, 10),
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose coach" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {coaches.length > 0 ? (
                                                            coaches.map((coach) => (
                                                                <SelectItem key={coach.id} value={coach.id.toString()}>
                                                                    {coach.name}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="0" disabled>
                                                                No coaches available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <Label>Attendance</Label>
                                                <Select
                                                    value={attendanceFormData.attendance ? 'true' : 'false'}
                                                    onValueChange={(value) =>
                                                        setAttendanceFormData((prev) => ({
                                                            ...prev,
                                                            attendance: value === 'true',
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select attendance" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Present</SelectItem>
                                                        <SelectItem value="false">Absent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )} */}
                                    
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading
                                            ? 'Loading...'
                                            : isAttendanceEditing
                                                ? 'Update Attendance Report'
                                                : 'Add Attendance Report'}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                    
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsScheduleDialogOpen(false);
                                setActiveScheduleId(null);
                                setCoachSchedule([]);
                                setAttendanceReport([]);
                                setAttendanceFormData(defaultAttendanceReportForm);
                                setCoachScheduleFormData(defaultCoachScheduleForm);
                                setIsCoachEditing(false);
                                setIsAttendanceEditing(false);
                            }}
                            disabled={isLoading}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={() => {
                    if (activeTab === 'coach_schedule' && isScheduleDialogOpen) {
                        handleDeleteCoachSchedule();
                    } else if (activeTab === 'attendance_report' && isScheduleDialogOpen) {
                        handleDeleteAttendanceReport();
                    } else {
                        handleDeleteSchedule();
                    }
                }}
            />
        </>
    );
}