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
// import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Roster {
    id: number;
    coach_id: string;
    schedule_id: string;
    is_head_coach: boolean;
    attendance: string | null;
}

interface RosterForm {
    coach_id: string;
    schedule_id: string;
    is_head_coach: boolean;
    attendance: string | null;
}

interface Coach {
    id: string;
    user: User;
}

interface User {
    name: string
}

interface Schedule {
    id: string;
    name: string;
}

const defaultForm: RosterForm = {
    coach_id: '',
    schedule_id: '',
    is_head_coach: false,
    attendance: null,
};

export default function RostersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [rosters, setRosters] = useState<Roster[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [formData, setFormData] = useState<RosterForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchRosters = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach-schedule`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Error : ", error);
                throw new Error('Failed to fetch rosters');
            }

            const { data } = await response.json();
            setRosters(data);
        } catch (error) {
            console.error('Fetch rosters error:', error);
            toast.error('Failed to fetch roster data');
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
                console.error("Error : ", error);
                throw new Error('Failed to fetch coaches');
            }

            const { data } = await response.json();
            console.log("Data Coach : ", data);
            setCoaches(data);
        } catch (error) {
            console.error('Fetch coaches error:', error);
            toast.error('Failed to fetch coach data');
        }
    }, []);

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
                console.error("Error : ", error);
                throw new Error('Failed to fetch schedules');
            }

            const { data } = await response.json();
            console.log("Data Schedule : ", data);
            setSchedules(data);
        } catch (error) {
            console.error('Fetch schedules error:', error);
            toast.error('Failed to fetch schedule data');
        }
    }, []);

    useEffect(() => {
        fetchRosters();
        fetchCoaches();
        fetchSchedules();
    }, [fetchRosters, fetchCoaches, fetchSchedules]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveRoster = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.coach_id || !formData.schedule_id) {
            toast.error('Coach ID and Schedule ID are required');
            return;
        }

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/coach-schedule/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/coach-schedule`;
            const token = Cookies.get('token');

            console.log("Form Data : ", formData);

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
                const errorMessage = errorResponse?.message || 'Failed to save roster';
                throw new Error(errorMessage);
            }

            await fetchRosters();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? 'Roster updated successfully!' : 'Roster created successfully!');
        } catch (error) {
            console.error('Save roster error:', error);
            toast.error('Failed to save roster');
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteRoster() {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach-schedule/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete roster');
            }

            await fetchRosters();
            toast.success('Roster deleted successfully!');
        } catch (error) {
            console.error('Delete roster error:', error);
            toast.error('Failed to delete roster');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value, type, checked } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: type === 'checkbox' ? checked : value,
    //     }));
    // };

    const handleToggleHeadCoach = (value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            is_head_coach: value,
        }));
    };

    const columns: ColumnDef<Roster>[] = [
        { accessorKey: 'coach_id', header: 'Coach ID' },
        { accessorKey: 'schedule_id', header: 'Schedule ID' },
        {
            accessorKey: 'is_head_coach',
            header: 'Is Head Coach',
            cell: ({ row }) => (row.original.is_head_coach ? 'Yes' : 'No'),
        },
        { accessorKey: 'attendance', header: 'Attendance' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const roster = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(roster.id);
                                setFormData({
                                    coach_id: roster.coach_id.toString(),
                                    schedule_id: roster.schedule_id.toString(),
                                    is_head_coach: roster.is_head_coach,
                                    attendance: roster.attendance,
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
                                setDeleteId(roster.id);
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
                <DataTable columns={columns} data={rosters} />
            </div>

            <FloatingAddButton
                onClick={() => {
                    setIsEditing(false);
                    setFormData(defaultForm);
                    setIsDialogOpen(true);
                }}
                tooltip="Add Roster"
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Roster' : 'New Roster'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit roster details as needed.'
                                : 'Fill in the form below to add a new roster.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRoster}>
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label>Coach</Label>
                                <Select
                                    value={formData.coach_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, coach_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose coach" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coaches.map((coach) => (
                                            <SelectItem key={coach.id} value={coach.id.toString()}>
                                                {coach.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Schedule</Label>
                                <Select
                                    value={formData.schedule_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, schedule_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose schedule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schedules.map((schedule) => (
                                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                {schedule.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Is Head Coach</Label>
                                <Switch
                                    id="is_head_coach"
                                    checked={formData.is_head_coach}
                                    onCheckedChange={handleToggleHeadCoach}
                                />
                            </div>

                            {/* <div className="space-y-1">
                                <Label>Attendance</Label>
                                <Input
                                    name="attendance"
                                    type="datetime-local"
                                    value={formData.attendance || ''}
                                    onChange={handleChange}
                                />
                            </div> */}
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
                                {isLoading ? 'Loading...' : isEditing ? 'Save Changes' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={handleDeleteRoster}
            />
        </>
    );
}