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
import Image from 'next/image';

interface Coach {
    id: number;
    user_id: number;
    birth_date: string;
    description: string;
    photo: string;
    user: {
        name: string;
    };
}

interface CoachForm {
    user_id: number;
    birth_date: string;
    description: string;
    photo: string;
}

const defaultForm: CoachForm = {
    user_id: 0,
    birth_date: '',
    description: '',
    photo: '',
};

export default function CoachesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [formData, setFormData] = useState<CoachForm>(defaultForm);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchCoaches = useCallback(async () => {
        try {
            const token = Cookies.get("token");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach`, {
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
            setPhotoPreview(null);
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
            const token = Cookies.get("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/coach/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/coach`;

            const formDataToSend = new FormData();
            
            formDataToSend.append('_method', method === 'PUT' ? 'PUT' : 'POST');
            formDataToSend.append('user_id', formData.user_id.toString());
            formDataToSend.append('birth_date', formData.birth_date);
            formDataToSend.append('description', formData.description || '');

            const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
            if (photoInput?.files?.[0]) {
                formDataToSend.append('photo', photoInput.files[0]);
            } else if (isEditing && formData.photo && !photoInput?.files?.length) {
                formDataToSend.append('existing_photo', formData.photo);
            }

            const res = await fetch(url, {
                method: method === 'PUT' ? 'POST' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
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
            setPhotoPreview(null);
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
                `${process.env.NEXT_PUBLIC_API_URL}/admin/coach/${deleteId}`,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
        {
            accessorKey: 'photo',
            header: 'Photo',
            cell: ({ row }) => {
                const coach = row.original;
                return coach.photo ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${coach.photo.replace('storage/', '')}`}
                            alt={coach.user?.name || 'Coach'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-xs text-gray-400">No photo</span>
                    </div>
                );
            }
        },
        { 
            accessorKey: 'user.name',
            header: 'Name',
            cell: ({ row }) => row.original.user?.name || 'N/A'
        },
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
                                    photo: coach.photo || '',
                                });
                                setPhotoPreview(coach.photo ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${coach.photo.replace('storage/', '')}` : null);
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
            <div className="px-6">
                <DataTable columns={columns} data={coaches} />
            </div>

            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Coach" />

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
                            
                            <div className="space-y-1">
                                <Label>Birth Date</Label>
                                <DatePicker
                                    value={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                    onChange={handleDateChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Input
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Photo</Label>
                                <Input
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="mt-2">
                                    {photoPreview ? (
                                        <div className="flex flex-col items-start gap-2">
                                            <Image
                                                src={photoPreview}
                                                alt="Preview"
                                                width={80}
                                                height={80}
                                                className="object-cover rounded border"
                                            />
                                        </div>
                                    ) : formData.photo ? (
                                        <div className="flex flex-col items-start gap-2">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${formData.photo.replace('storage/', '')}`}
                                                alt="Current"
                                                width={80}
                                                height={80}
                                                className="object-cover rounded border"
                                            />
                                            <span className="text-xs text-gray-500">Current photo</span>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border text-sm text-gray-400">
                                            No photo
                                        </div>
                                    )}
                                </div>
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