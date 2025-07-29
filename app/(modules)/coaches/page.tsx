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
import { DatePicker } from '@/components/date-picker';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';

interface Coach {
    id: number;
    user_id: number;
    birth_date: string;
    description: string;
}

interface CoachForm {
    user_id: number;
    birth_date: string;
    description: string;
}

const defaultForm: CoachForm = {
    user_id: 0,
    birth_date: '',
    description: '',
};

export default function CoachesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [formData, setFormData] = useState<CoachForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchCoaches = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coach`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch coaches from server");
            }

            const { data } = await response.json();
            console.log("Coach data:", data);

            setCoaches(data);
        } catch (error) {
            console.error("Fetch coaches failed:", error);
            toast.error("Failed to fetch coach data");
        }
    }, []);

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveCoach = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.user_id || !formData.birth_date.trim() || !formData.description.trim()) {
            toast.error("All fields are required");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/coach/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/coach`;
            const token = Cookies.get("token");

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorResponse = await res.json().catch(() => null);
                const errorMessage = errorResponse?.message || "Failed to save coach";
                throw new Error(errorMessage);
            }

            await fetchCoaches();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Coach updated successfully!" : "Coach created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save coach error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteCoach() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/coach/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete coach");
            }

            toast.success("Coach deleted successfully!");
            fetchCoaches();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete coach");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                birth_date: date.toISOString().split('T')[0],
            }));
        }
    };

    const columns: ColumnDef<Coach>[] = [
        { accessorKey: 'user_id', header: 'User ID' },
        { accessorKey: 'birth_date', header: 'Birth Date' },
        { accessorKey: 'description', header: 'Description' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const coach = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(coach.id);
                                setFormData({
                                    user_id: coach.user_id,
                                    birth_date: coach.birth_date,
                                    description: coach.description,
                                });
                                setIsDialogOpen(true);
                            }}
                            aria-label={`Edit coach ${coach.user_id}`}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(coach.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            aria-label={`Delete coach ${coach.user_id}`}
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
            {/* DataTable */}
            <div className="px-6">
                <DataTable columns={columns} data={coaches} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Coach" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Coach' : 'New Coach'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit coach details as needed.'
                                : 'Fill in the form below to add a new coach.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCoach}>

                        <div className="grid gap-4">
                            {/* User ID */}
                            <div className="space-y-1">
                                <Label>User ID</Label>
                                <Input
                                    name="user_id"
                                    type="number"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Birth Date */}
                            <div className="space-y-1">
                                <Label>Birth Date</Label>
                                {/* Birth Date */}
                                <div className="space-y-1">
                                    <Label>Birth Date</Label>
                                    <DatePicker
                                        value={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                        onChange={handleDateChange}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type='button' variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Loading..." : isEditing ? "Save Changes" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={handleDeleteCoach}
            />
        </>
    );
}