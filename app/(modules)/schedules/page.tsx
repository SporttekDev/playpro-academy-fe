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
import { IconArrowBackUp, IconArrowsExchange, IconBan, IconCalendarCog, IconPencil, IconTrash } from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/date-picker';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { apiRequest, getErrorMessage } from '@/lib/api';

type CoachRole = 'head_coach' | 'captain_coach' | 'assistant_coach' | 'assistant_coach_vip';
type RescheduleKind = 'coach_request' | 'admin_change';
type ScheduleStatus = 'scheduled' | 'cancelled';

const COACH_ROLES: { value: CoachRole; label: string }[] = [
    { value: 'head_coach', label: 'Head Coach' },
    { value: 'captain_coach', label: 'Captain Coach' },
    { value: 'assistant_coach', label: 'Assistant Coach' },
    { value: 'assistant_coach_vip', label: 'Assistant Coach VIP' },
];

const RESCHEDULE_TYPES: { value: RescheduleKind; label: string; hint: string }[] = [
    {
        value: 'coach_request',
        label: 'Coach cannot attend',
        hint: "Counts toward the coach's monthly reschedule limit. Going over the limit forfeits their discipline bonus.",
    },
    {
        value: 'admin_change',
        label: 'Admin change',
        hint: 'Schedule reorganized or entered by mistake. Does not count toward the limit.',
    },
];

interface Branch {
    id: string;
    name: string;
}

interface Schedule {
    id: number;
    name: string;
    class_id: string;
    start_time: string;
    end_time: string;
    date: string;
    quota: number;
    venue_id: string;
    status?: ScheduleStatus;
    cancelled_at?: string | null;
    cancel_reason?: string | null;
    class_model?: {
        id: string;
        name: string;
        branch?: Branch;
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
    role: CoachRole;
    role_label: string;
    is_head_coach: boolean;
    attendance?: string;
    /** Diisi backend jika sudah check-in (opsional). Penugasan yang sudah check-in tidak bisa diganti. */
    checked_in?: boolean;
    coach?: {
        id: string;
        name: string;
    };
}

interface CoachScheduleForm {
    id?: number;
    schedule_id: number;
    coach_id: string;
    role: CoachRole;
    attendance?: string;
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

interface RescheduleForm {
    type: RescheduleKind | '';
    replacement_coach_id: string;
    role: CoachRole;
    reason: string;
}

interface RescheduleTarget {
    assignment: CoachSchedule;
    mode: 'replace' | 'remove';
}

interface RescheduleResult {
    reschedule_count_this_month: number;
    reschedule_limit: number;
    discipline_bonus_forfeited: boolean;
}

interface StatusTarget {
    kind: 'cancel' | 'reactivate';
    schedule: Schedule;
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

const defaultForm: ScheduleForm = {
    name: '',
    class_id: '',
    start_time: '',
    end_time: '',
    date: '',
    quota: 0,
    venue_id: '',
};

const defaultCoachScheduleForm: CoachScheduleForm = {
    schedule_id: 0,
    coach_id: '',
    role: 'assistant_coach',
    attendance: '',
};

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

const defaultRescheduleForm: RescheduleForm = {
    type: '',
    replacement_coach_id: '',
    role: 'assistant_coach',
    reason: '',
};

const formatTimeForInput = (timeString: string): string => {
    if (!timeString) return '';
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString.substring(0, 5);
    return timeString;
};

const formatTimeForAPI = (timeString: string): string => {
    if (!timeString) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString.substring(0, 5);
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    return timeString;
};

/** Ambil bulan dan tahun dari tanggal 'YYYY-MM-DD' (atau ISO yang diawali tanggal). */
const splitDate = (date: string): { month: number; year: number } => {
    const [year, month] = date.split('-');
    return { month: Number(month), year: Number(year) };
};

export default function SchedulesPage() {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
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
    const [activeTab, setActiveTab] = useState('coach_schedule');
    const [isCoachEditing, setIsCoachEditing] = useState(false);
    const [isAttendanceEditing, setIsAttendanceEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | ScheduleStatus>('all');

    // Batalkan / aktifkan kembali sesi
    const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isChangingStatus, setIsChangingStatus] = useState(false);

    // Ganti / cabut coach (reschedule)
    const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null);
    const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>(defaultRescheduleForm);
    const [priorRequests, setPriorRequests] = useState<number | null>(null);
    const [isRescheduling, setIsRescheduling] = useState(false);

    const activeSchedule = schedules.find((s) => s.id === activeScheduleId);
    const activeDate = activeSchedule?.date;
    const isActiveCancelled = activeSchedule?.status === 'cancelled';

    const visibleSchedules =
        statusFilter === 'all'
            ? schedules
            : schedules.filter((s) => (s.status ?? 'scheduled') === statusFilter);

    const replacementOptions = coaches
        .filter((coach) => !coachSchedule.some((cs) => String(cs.coach_id) === String(coach.id)))
        .map((coach) => ({ value: coach.id.toString(), label: coach.name }));

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

    const fetchSchedules = useCallback(async () => {
        try {
            const { data } = await apiRequest<Schedule[]>('/admin/schedule', {
                query: {
                    month: selectedMonth,
                    year: selectedYear,
                    branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
                },
            });
            setSchedules(data ?? []);
        } catch (error) {
            console.error('Fetch schedules error:', error);
            toast.error('Failed to fetch schedule data');
        }
    }, [selectedMonth, selectedYear, selectedBranch]);

    const fetchClasses = useCallback(async () => {
        try {
            const { data } = await apiRequest<ClassData[]>('/admin/class');
            setClasses(data ?? []);
        } catch (error) {
            console.error('Fetch classes error:', error);
            toast.error('Failed to fetch class data');
        }
    }, []);

    const fetchVenues = useCallback(async () => {
        try {
            const { data } = await apiRequest<Venue[]>('/admin/venue');
            setVenues(data ?? []);
        } catch (error) {
            console.error('Fetch venues error:', error);
            toast.error('Failed to fetch venue data');
        }
    }, []);

    const fetchCoaches = useCallback(async () => {
        try {
            const { data } = await apiRequest<Coach[]>('/admin/coach');
            setCoaches((data ?? []).sort((a: Coach, b: Coach) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Fetch coaches error:', error);
            toast.error('Failed to fetch coach data');
        }
    }, []);

    const fetchEligiblePlayKids = useCallback(async (scheduleId: number) => {
        try {
            const { data } = await apiRequest<
                (PlayKid & { memberships?: { sessions?: { count: number }[] }[] })[]
            >(`/admin/schedule/${scheduleId}/eligible-playkids`);

            const playKidsWithValidSessions = (data ?? []).filter(
                (playKid) =>
                    playKid.memberships &&
                    playKid.memberships.length > 0 &&
                    playKid.memberships.some(
                        (membership) =>
                            membership.sessions &&
                            membership.sessions.length > 0 &&
                            membership.sessions.some((session: { count: number }) => session.count > 0)
                    )
            );
            setPlayKids(playKidsWithValidSessions);
        } catch (error) {
            console.error('Fetch eligible play kids error:', error);
            toast.error('Failed to fetch eligible play kid data');
        }
    }, []);

    const fetchCoachSchedules = useCallback(async (scheduleId: number) => {
        try {
            const { data } = await apiRequest<CoachSchedule[]>(`/admin/schedule/${scheduleId}/coaches`);
            setCoachSchedule(data ?? []);
        } catch (error) {
            console.error('Fetch coach schedules error:', error);
            toast.error('Failed to fetch coach schedule data');
        }
    }, []);

    const fetchAttendanceReports = useCallback(async (scheduleId: number) => {
        try {
            const { data } = await apiRequest<AttendanceReport[]>(`/admin/schedule/${scheduleId}/attendance`);
            setAttendanceReport(data ?? []);
        } catch (error) {
            console.error('Fetch attendance reports error:', error);
            toast.error('Failed to fetch attendance report data');
        }
    }, []);

    useEffect(() => {
        fetchBranches();
        fetchClasses();
        fetchVenues();
        fetchCoaches();
    }, [fetchBranches, fetchClasses, fetchVenues, fetchCoaches]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

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
        setFormData((prev) => ({ ...prev, venue_id: '' }));
    }, [formData.class_id]);

    // Berapa kali coach ini sudah meminta reschedule di bulan sesi, supaya admin tahu dampaknya
    // sebelum memilih "Coach cannot attend".
    const rescheduleCoachId = rescheduleTarget?.assignment.coach_id;
    useEffect(() => {
        if (!rescheduleCoachId || rescheduleForm.type !== 'coach_request' || !activeDate) {
            setPriorRequests(null);
            return;
        }

        let ignore = false;
        const { month, year } = splitDate(activeDate);

        apiRequest<unknown[]>('/admin/reschedules', {
            query: { month, year, coach_id: rescheduleCoachId, type: 'coach_request' },
        })
            .then(({ data }) => {
                if (!ignore) setPriorRequests(Array.isArray(data) ? data.length : 0);
            })
            .catch(() => {
                if (!ignore) setPriorRequests(null);
            });

        return () => {
            ignore = true;
        };
    }, [rescheduleCoachId, rescheduleForm.type, activeDate]);

    // -- Jadwal ----------------------------------------------------------------

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

            let submitData = {
                ...formData,
                start_time: startTime,
                end_time: endTime,
                quota: Number(formData.quota),
            };

            if (!isEditing) {
                const selectedClass = classes.find((cls) => cls.id.toString() === formData.class_id);
                const selectedVenue = venues.find((venue) => venue.id.toString() === formData.venue_id);
                if (selectedClass && selectedVenue) {
                    const generatedName = `${selectedClass.name}, ${selectedVenue.name}, ${formData.date}, ${startTime}-${endTime}`;
                    submitData = { ...submitData, name: generatedName };
                }
            }

            await apiRequest(isEditing ? `/admin/schedule/${editId}` : '/admin/schedule', {
                method: isEditing ? 'PUT' : 'POST',
                body: submitData,
            });

            await fetchSchedules();
            setIsDialogOpen(false);
            setIsEditing(false);
            setEditId(null);
            setFormData(defaultForm);
            toast.success(isEditing ? 'Schedule updated successfully!' : 'Schedule created successfully!');
        } catch (error) {
            console.error('Save schedule error:', error);
            toast.error(getErrorMessage(error, 'Failed to save schedule'));
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteSchedule() {
        try {
            await apiRequest(`/admin/schedule/${deleteId}`, { method: 'DELETE' });
            await fetchSchedules();
            toast.success('Schedule deleted successfully!');
        } catch (error) {
            console.error('Delete schedule error:', error);
            // Pesan dari server, misalnya jika payroll untuk sesi ini sudah final.
            toast.error(getErrorMessage(error, 'Failed to delete schedule'));
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
            setFormData((prev) => ({ ...prev, date: `${year}-${month}-${day}` }));
        }
    };

    const handleTimeChange = (time: string, field: 'start_time' | 'end_time') => {
        setFormData((prev) => ({ ...prev, [field]: time }));
    };

    // -- Batalkan / aktifkan kembali sesi --------------------------------------

    const closeStatusDialog = () => {
        setStatusTarget(null);
        setCancelReason('');
    };

    const handleConfirmStatusChange = async () => {
        if (!statusTarget) return;

        const { kind, schedule } = statusTarget;

        try {
            setIsChangingStatus(true);
            await apiRequest(`/admin/schedule/${schedule.id}/${kind}`, {
                method: 'POST',
                body: kind === 'cancel' ? { reason: cancelReason.trim() || undefined } : undefined,
            });

            await fetchSchedules();
            toast.success(kind === 'cancel' ? 'Schedule cancelled' : 'Schedule reactivated');
            closeStatusDialog();
        } catch (error) {
            console.error('Change schedule status error:', error);
            toast.error(getErrorMessage(error, 'Failed to update schedule status'));
        } finally {
            setIsChangingStatus(false);
        }
    };

    // -- Coach pada jadwal -----------------------------------------------------

    const handleSaveCoachSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!coachScheduleFormData.coach_id || coachScheduleFormData.role === undefined) {
            toast.error('Coach and role are required');
            return;
        }

        const scheduleId = activeScheduleId;
        if (!scheduleId) {
            toast.error('No schedule selected');
            return;
        }

        try {
            setIsLoading(true);

            if (isCoachEditing) {
                // Mengganti coach tidak lewat sini lagi: hanya role yang diubah.
                await apiRequest(`/admin/schedule/${scheduleId}/coaches/${coachScheduleFormData.id}`, {
                    method: 'PUT',
                    body: {
                        role: coachScheduleFormData.role,
                        attendance: coachScheduleFormData.attendance || null,
                    },
                });
            } else {
                await apiRequest(`/admin/schedule/${scheduleId}/coaches`, {
                    method: 'POST',
                    body: {
                        coach_id: coachScheduleFormData.coach_id,
                        role: coachScheduleFormData.role,
                        attendance: coachScheduleFormData.attendance || null,
                    },
                });
            }

            await fetchCoachSchedules(scheduleId);
            setCoachScheduleFormData(defaultCoachScheduleForm);
            setIsCoachEditing(false);
            toast.success(isCoachEditing ? 'Coach schedule updated successfully!' : 'Coach schedule created successfully!');
        } catch (error) {
            console.error('Save coach schedule error:', error);
            toast.error(getErrorMessage(error, 'Failed to save coach schedule'));
        } finally {
            setIsLoading(false);
        }
    };

    const openReschedule = (assignment: CoachSchedule, mode: RescheduleTarget['mode']) => {
        setRescheduleForm({ ...defaultRescheduleForm, role: assignment.role });
        setPriorRequests(null);
        setRescheduleTarget({ assignment, mode });
    };

    const closeReschedule = () => {
        setRescheduleTarget(null);
        setRescheduleForm(defaultRescheduleForm);
        setPriorRequests(null);
    };

    const handleSubmitReschedule = async () => {
        if (!rescheduleTarget || !activeScheduleId) return;

        const { assignment, mode } = rescheduleTarget;
        const reason = rescheduleForm.reason.trim();

        if (!rescheduleForm.type) {
            toast.error('Please choose why the coach is being changed');
            return;
        }
        if (mode === 'replace' && !rescheduleForm.replacement_coach_id) {
            toast.error('Please choose a replacement coach');
            return;
        }
        if (rescheduleForm.type === 'coach_request' && !reason) {
            toast.error('A reason is required when the coach cannot attend');
            return;
        }

        try {
            setIsRescheduling(true);

            const { data } = await apiRequest<RescheduleResult>(
                `/admin/schedule/${activeScheduleId}/coaches/${assignment.id}/reschedule`,
                {
                    method: 'POST',
                    body: {
                        type: rescheduleForm.type,
                        replacement_coach_id:
                            mode === 'replace' ? Number(rescheduleForm.replacement_coach_id) : undefined,
                        role: mode === 'replace' ? rescheduleForm.role : undefined,
                        reason: reason || undefined,
                    },
                }
            );

            await fetchCoachSchedules(activeScheduleId);
            closeReschedule();

            toast.success(mode === 'replace' ? 'Coach replaced' : 'Coach removed from the session');

            if (rescheduleForm.type === 'coach_request' && data) {
                const summary = `${data.reschedule_count_this_month} of ${data.reschedule_limit} allowed this month`;

                if (data.discipline_bonus_forfeited) {
                    toast.warning(`This coach is over the reschedule limit (${summary}). Their discipline bonus is forfeited.`);
                } else {
                    toast.info(`Reschedule recorded: ${summary}.`);
                }
            }
        } catch (error) {
            console.error('Reschedule error:', error);
            toast.error(getErrorMessage(error, 'Failed to change the coach'));
        } finally {
            setIsRescheduling(false);
        }
    };

    // -- Absensi anak ----------------------------------------------------------

    const handleSaveAttendanceReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!attendanceFormData.play_kid_id || attendanceFormData.play_kid_id.length === 0) {
            toast.error('Play Kids are required');
            return;
        }

        const scheduleId = activeScheduleId;
        if (!scheduleId) {
            toast.error('No schedule selected');
            return;
        }

        try {
            setIsLoading(true);

            const submitData = isAttendanceEditing
                ? {
                    coach_id: attendanceFormData.coach_id || null,
                    play_kid_id: attendanceFormData.play_kid_id[0],
                    attendance: attendanceFormData.attendance || false,
                    motorik: attendanceFormData.motorik || null,
                    locomotor: attendanceFormData.locomotor || null,
                    body_control: attendanceFormData.body_control || null,
                    overall: attendanceFormData.overall || null,
                }
                : {
                    coach_id: attendanceFormData.coach_id || null,
                    play_kid_id: attendanceFormData.play_kid_id,
                    attendance: attendanceFormData.attendance || false,
                    motorik: attendanceFormData.motorik || null,
                    locomotor: attendanceFormData.locomotor || null,
                    body_control: attendanceFormData.body_control || null,
                    overall: attendanceFormData.overall || null,
                };

            await apiRequest(
                isAttendanceEditing
                    ? `/admin/schedule/${scheduleId}/attendance/${attendanceFormData.id}`
                    : `/admin/schedule/${scheduleId}/attendance`,
                { method: isAttendanceEditing ? 'PUT' : 'POST', body: submitData }
            );

            await fetchAttendanceReports(scheduleId);
            await fetchSchedules();
            await fetchEligiblePlayKids(scheduleId);
            setAttendanceFormData(defaultAttendanceReportForm);
            setIsAttendanceEditing(false);
            toast.success(isAttendanceEditing ? 'Attendance report updated successfully!' : 'Attendance report created successfully!');
        } catch (error) {
            console.error('Save attendance report error:', error);
            toast.error(getErrorMessage(error, 'Failed to save attendance report'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAttendanceReport = async () => {
        const scheduleId = activeScheduleId;
        if (!scheduleId || !deleteId) return;

        try {
            await apiRequest(`/admin/schedule/${scheduleId}/attendance/${deleteId}`, { method: 'DELETE' });
            await fetchAttendanceReports(scheduleId);
            await fetchEligiblePlayKids(scheduleId);
            await fetchSchedules();
            toast.success('Attendance report deleted successfully!');
        } catch (error) {
            console.error('Delete attendance report error:', error);
            toast.error(getErrorMessage(error, 'Failed to delete attendance report'));
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    // -- Kolom -----------------------------------------------------------------

    const columns: ColumnDef<Schedule>[] = [
        {
            accessorKey: 'class_id',
            header: 'Class',
            cell: ({ row }) => row.original.class_model?.name || row.original.class_id,
        },
        {
            accessorKey: 'venue_id',
            header: 'Venue',
            cell: ({ row }) => row.original.venue?.name || row.original.venue_id,
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
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) =>
                row.original.status === 'cancelled' ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge className="rounded-full border bg-rose-50 text-rose-600 border-rose-200">
                                Cancelled
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {row.original.cancel_reason || 'No reason given'}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Badge className="rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                        Scheduled
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const schedule = row.original;
                const cancelled = schedule.status === 'cancelled';

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
                            <TooltipContent side="top">Manage Schedule</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setStatusTarget({ kind: cancelled ? 'reactivate' : 'cancel', schedule })
                                    }
                                >
                                    {cancelled ? (
                                        <IconArrowBackUp className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <IconBan className="w-4 h-4 text-amber-600" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">{cancelled ? 'Reactivate' : 'Cancel session'}</TooltipContent>
                        </Tooltip>
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
                            <TooltipContent side="top">Delete (prefer Cancel to keep history)</TooltipContent>
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
            cell: ({ row }) => row.original.coach?.name || 'Unknown',
        },
        {
            accessorKey: 'role_label',
            header: 'Role',
            cell: ({ row }) => row.original.role_label,
        },
        {
            accessorKey: 'attendance',
            header: 'Attendance',
            cell: ({ row }) => row.getValue('attendance') || 'Not Set',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const cs = row.original;
                const locked = isActiveCancelled;
                const checkedIn = cs.checked_in === true;

                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={locked}
                                    onClick={() => {
                                        setIsCoachEditing(true);
                                        setCoachScheduleFormData({
                                            id: cs.id,
                                            schedule_id: cs.schedule_id,
                                            coach_id: cs.coach_id.toString(),
                                            role: cs.role,
                                            attendance: cs.attendance || '',
                                        });
                                    }}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Edit role</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={locked || checkedIn}
                                    onClick={() => openReschedule(cs, 'replace')}
                                >
                                    <IconArrowsExchange className="w-4 h-4 text-blue-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {checkedIn ? 'Already checked in' : 'Replace coach (reschedule)'}
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={locked || checkedIn}
                                    onClick={() => openReschedule(cs, 'remove')}
                                >
                                    <IconTrash className="w-4 h-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {checkedIn ? 'Already checked in' : 'Remove coach'}
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
                const r = row.original;
                return r.motorik || r.locomotor || r.body_control || r.overall ? 'Reported' : 'Not Reported';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const ar = row.original;
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
                                            id: ar.id,
                                            schedule_id: ar.schedule_id,
                                            coach_id: ar.coach_id,
                                            play_kid_id: [ar.play_kid_id],
                                            attendance: ar.attendance,
                                            motorik: ar.motorik || '',
                                            locomotor: ar.locomotor || '',
                                            body_control: ar.body_control || '',
                                            overall: ar.overall || 0,
                                        });
                                    }}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setDeleteId(ar.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <IconTrash className="w-4 h-4 text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Delete</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    const selectedRescheduleType = RESCHEDULE_TYPES.find((t) => t.value === rescheduleForm.type);
    const rescheduleCoachName = rescheduleTarget?.assignment.coach?.name ?? 'this coach';

    return (
        <>
            <div className="px-6 space-y-4">
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

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | ScheduleStatus)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DataTable columns={columns} data={visibleSchedules} />
            </div>

            <FloatingAddButton
                onClick={() => {
                    setIsEditing(false);
                    setFormData(defaultForm);
                    setIsDialogOpen(true);
                }}
                tooltip="Add Schedule"
            />

            {/* Form jadwal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Edit schedule details as needed.' : 'Fill in the form below to add a new schedule.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveSchedule}>
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label>Class</Label>
                                <SearchableSelect
                                    value={formData.class_id}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, class_id: value }))
                                    }
                                    options={classes.map((cls) => ({
                                        value: cls.id.toString(),
                                        label: cls.name,
                                    }))}
                                    placeholder="Choose class"
                                    searchPlaceholder="Search class..."
                                    emptyText="No classes available"
                                />
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
                                                    <SelectItem key={venue.id} value={venue.id.toString()}>{venue.name}</SelectItem>
                                                ))
                                        ) : (
                                            <SelectItem value="0" disabled>Please select a class first</SelectItem>
                                        )}
                                        {formData.class_id &&
                                            venues.filter((venue) => {
                                                const selectedClass = classes.find((cls) => cls.id.toString() === formData.class_id);
                                                return selectedClass ? venue.branch.id === selectedClass.branch_id : false;
                                            }).length === 0 && (
                                                <SelectItem value="0" disabled>No venues available for this class</SelectItem>
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
                                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => handleTimeChange(e.target.value, 'end_time')}
                                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
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

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Loading...' : isEditing ? 'Save Changes' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Kelola jadwal: coach dan anak */}
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Manage Schedule</DialogTitle>
                        <DialogDescription>
                            Manage coach and play kid list for the selected schedule.
                        </DialogDescription>
                    </DialogHeader>

                    {isActiveCancelled && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            This session is cancelled
                            {activeSchedule?.cancel_reason ? ` (${activeSchedule.cancel_reason})` : ''}. Coaches and play
                            kids can no longer be added. Reactivate it from the schedule list to make changes.
                        </div>
                    )}

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
                                        <SearchableSelect
                                            value={coachScheduleFormData.coach_id}
                                            onValueChange={(value) =>
                                                setCoachScheduleFormData((prev) => ({
                                                    ...prev,
                                                    coach_id: value,
                                                }))
                                            }
                                            options={coaches.map((coach) => ({
                                                value: coach.id.toString(),
                                                label: coach.name,
                                            }))}
                                            placeholder="Choose coach"
                                            searchPlaceholder="Search coach..."
                                            emptyText="No coaches available"
                                            disabled={coaches.length === 0 || isCoachEditing}
                                        />
                                        {isCoachEditing && (
                                            <p className="text-xs text-muted-foreground">
                                                The coach cannot be changed here. Use the replace button in the table so the
                                                change is recorded.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Role</Label>
                                        <Select
                                            value={coachScheduleFormData.role}
                                            onValueChange={(value) =>
                                                setCoachScheduleFormData((prev) => ({ ...prev, role: value as CoachRole }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COACH_ROLES.map((r) => (
                                                    <SelectItem key={r.value} value={r.value}>
                                                        {r.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={isLoading || isActiveCancelled} className="flex-1">
                                            {isLoading ? 'Loading...' : isCoachEditing ? 'Update Role' : 'Add Coach Schedule'}
                                        </Button>
                                        {isCoachEditing && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsCoachEditing(false);
                                                    setCoachScheduleFormData(defaultCoachScheduleForm);
                                                }}
                                            >
                                                Cancel edit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="attendance_report" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    Available Quota: {activeSchedule?.quota || 0}
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
                                                setAttendanceFormData((prev) => ({ ...prev, play_kid_id: value.map(Number) }))
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
                                    <Button type="submit" disabled={isLoading || (isActiveCancelled && !isAttendanceEditing)}>
                                        {isLoading ? 'Loading...' : isAttendanceEditing ? 'Update Attendance Report' : 'Add Attendance Report'}
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

            {/* Ganti atau cabut coach (reschedule) */}
            <Dialog
                open={rescheduleTarget !== null}
                onOpenChange={(open) => {
                    if (!open && !isRescheduling) closeReschedule();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {rescheduleTarget?.mode === 'replace' ? 'Replace coach' : 'Remove coach'}
                        </DialogTitle>
                        <DialogDescription>
                            {rescheduleTarget?.mode === 'replace'
                                ? `Choose who takes over from ${rescheduleCoachName}. The change is recorded.`
                                : `${rescheduleCoachName} is removed from this session with no replacement. The change is recorded.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="space-y-1">
                            <Label>Why is the coach being changed?</Label>
                            <Select
                                value={rescheduleForm.type}
                                onValueChange={(value) =>
                                    setRescheduleForm((prev) => ({ ...prev, type: value as RescheduleKind }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a reason type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RESCHEDULE_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedRescheduleType && (
                                <p className="text-xs text-muted-foreground">{selectedRescheduleType.hint}</p>
                            )}
                            {rescheduleForm.type === 'coach_request' && priorRequests !== null && (
                                <p className="text-xs text-amber-600">
                                    {rescheduleCoachName} already has {priorRequests} coach-requested reschedule(s) in this
                                    session&apos;s month. This one will be recorded on top of that.
                                </p>
                            )}
                        </div>

                        {rescheduleTarget?.mode === 'replace' && (
                            <>
                                <div className="space-y-1">
                                    <Label>Replacement coach</Label>
                                    <SearchableSelect
                                        value={rescheduleForm.replacement_coach_id}
                                        onValueChange={(value) =>
                                            setRescheduleForm((prev) => ({ ...prev, replacement_coach_id: value }))
                                        }
                                        options={replacementOptions}
                                        placeholder="Choose replacement"
                                        searchPlaceholder="Search coach..."
                                        emptyText="No coaches available"
                                        disabled={replacementOptions.length === 0}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label>Role of the replacement</Label>
                                    <Select
                                        value={rescheduleForm.role}
                                        onValueChange={(value) =>
                                            setRescheduleForm((prev) => ({ ...prev, role: value as CoachRole }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COACH_ROLES.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <Label htmlFor="reschedule-reason">
                                Reason{rescheduleForm.type === 'coach_request' ? ' (required)' : ' (optional)'}
                            </Label>
                            <Textarea
                                id="reschedule-reason"
                                value={rescheduleForm.reason}
                                maxLength={500}
                                placeholder="For example: sick, family matter, schedule clash"
                                onChange={(e) => setRescheduleForm((prev) => ({ ...prev, reason: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeReschedule} disabled={isRescheduling}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReschedule}
                            disabled={
                                isRescheduling ||
                                !rescheduleForm.type ||
                                (rescheduleTarget?.mode === 'replace' && !rescheduleForm.replacement_coach_id)
                            }
                        >
                            {isRescheduling
                                ? 'Saving...'
                                : rescheduleTarget?.mode === 'replace'
                                    ? 'Replace coach'
                                    : 'Remove coach'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Batalkan atau aktifkan kembali sesi */}
            <Dialog
                open={statusTarget !== null}
                onOpenChange={(open) => {
                    if (!open && !isChangingStatus) closeStatusDialog();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {statusTarget?.kind === 'cancel' ? 'Cancel this session?' : 'Reactivate this session?'}
                        </DialogTitle>
                        <DialogDescription>
                            {statusTarget?.kind === 'cancel'
                                ? 'The session disappears from the public booking page and is left out of coach payroll. Play kids already registered are not refunded automatically.'
                                : 'The session appears again on the booking page and counts toward coach payroll.'}
                        </DialogDescription>
                    </DialogHeader>

                    {statusTarget?.kind === 'cancel' && (
                        <div className="space-y-1">
                            <Label htmlFor="cancel-reason">Reason (optional)</Label>
                            <Textarea
                                id="cancel-reason"
                                value={cancelReason}
                                maxLength={255}
                                placeholder="For example: bad weather, venue unavailable"
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeStatusDialog} disabled={isChangingStatus}>
                            Back
                        </Button>
                        <Button
                            variant={statusTarget?.kind === 'cancel' ? 'destructive' : 'default'}
                            onClick={handleConfirmStatusChange}
                            disabled={isChangingStatus}
                        >
                            {isChangingStatus
                                ? 'Saving...'
                                : statusTarget?.kind === 'cancel'
                                    ? 'Cancel session'
                                    : 'Reactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hapus jadwal / hapus absensi anak */}
            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={() => {
                    if (activeTab === 'attendance_report' && isScheduleDialogOpen) {
                        handleDeleteAttendanceReport();
                    } else {
                        handleDeleteSchedule();
                    }
                }}
            />
        </>
    );
}