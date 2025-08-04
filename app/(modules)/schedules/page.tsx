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
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/date-picker'; // Pastikan Anda memiliki komponen DatePicker
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Schedule {
    id: number;
    class_id: string;
    start_time: string;
    end_time: string;
    date: string;
    quota: number;
    venue_id: string;
}

interface ScheduleForm {
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
}

interface Venue {
    id: string;
    name: string;
}

const defaultForm: ScheduleForm = {
    class_id: '',
    start_time: '',
    end_time: '',
    date: '',
    quota: 0,
    venue_id: '',
};

export default function SchedulesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [formData, setFormData] = useState<ScheduleForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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

    useEffect(() => {
        fetchSchedules();
        fetchClasses();
        fetchVenues();
    }, [fetchSchedules, fetchClasses, fetchVenues]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.class_id || !formData.start_time.trim() || !formData.end_time.trim() || !formData.date.trim() || !formData.quota || !formData.venue_id) {
            toast.error('All fields are required');
            return;
        }

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/schedule`;
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
            toast.error('Failed to save schedule');
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
            [name]: name === 'quota' ? parseInt(value) : value,
        }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                date: date.toISOString().split('T')[0],
            }));
        }
    };

    const handleTimeChange = (time: string, field: 'start_time' | 'end_time') => {
        setFormData((prev) => ({
            ...prev,
            [field]: time,
        }));
    };

    const columns: ColumnDef<Schedule>[] = [
        { accessorKey: 'class_id', header: 'Class ID' },
        { accessorKey: 'start_time', header: 'Start Time' },
        { accessorKey: 'end_time', header: 'End Time' },
        { accessorKey: 'date', header: 'Date' },
        { accessorKey: 'quota', header: 'Quota' },
        { accessorKey: 'venue_id', header: 'Venue ID' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const schedule = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(schedule.id);
                                setFormData({
                                    class_id: schedule.class_id.toString(),
                                    start_time: schedule.start_time,
                                    end_time: schedule.end_time,
                                    date: schedule.date,
                                    quota: schedule.quota,
                                    venue_id: schedule.venue_id.toString(),
                                });
                                setIsDialogOpen(true);
                            }}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
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
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Venue</Label>
                                <Select
                                    value={formData.venue_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, venue_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.id} value={venue.id.toString()}>
                                                {venue.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Date</Label>
                                <DatePicker
                                    value={formData.date ? new Date(formData.date) : undefined}
                                    onChange={handleDateChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Start Time</Label>
                                <Input
                                    type='time'
                                    step={1}
                                    value={formData.start_time}
                                    onChange={(e) => handleTimeChange(e.target.value, 'start_time')}
                                    className='appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>End Time</Label>
                                <Input
                                    type='time'
                                    step={1}
                                    value={formData.end_time}
                                    onChange={(e) => handleTimeChange(e.target.value, 'end_time')}
                                    className='appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Quota</Label>
                                <Input
                                    name="quota"
                                    type="number"
                                    value={formData.quota}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? 'Loading...'
                                    : isEditing
                                        ? 'Save Changes'
                                        : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={handleDeleteSchedule}
            />
        </>
    );
}