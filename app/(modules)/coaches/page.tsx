'use client';

import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Coach {
    id: number;
    name: string;
    birth_date: string | null;
    description: string | null;
    photo: string | null;
}

interface CoachForm {
    birth_date: string;
    description: string;
    photo: File | null;
}

const defaultForm: CoachForm = {
    birth_date: '',
    description: '',
    photo: null,
};

export default function CoachesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [formData, setFormData] = useState<CoachForm>(defaultForm);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

    const fetchCoaches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to fetch coaches: ${error}`);
            }

            const { data } = await response.json();
            setCoaches(data);
        } catch (error) {
            console.error('Fetch coaches failed:', error);
            toast.error('Failed to fetch coach data');
        }
    }, []);

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setPhotoPreview(null);
            setCurrentPhoto(null);
            setEditId(null);
        }
    }, [isDialogOpen]);

    const handleSaveCoach = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.birth_date.trim() || !formData.description.trim()) {
            toast.error('Birth date and description are required');
            return;
        }

        try {
            setIsLoading(true);
            const token = Cookies.get('token');
            if (!token) throw new Error('No authentication token found');

            const formDataToSend = new FormData();
            formDataToSend.append('_method', 'PUT');
            formDataToSend.append('birth_date', formData.birth_date);
            formDataToSend.append('description', formData.description);
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach/${editId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (!res.ok) {
                const errorResponse = await res.json().catch(() => null);
                const errorMessage = errorResponse?.message || 'Failed to update coach';
                throw new Error(errorMessage);
            }

            await fetchCoaches();
            setIsDialogOpen(false);
            setFormData(defaultForm);
            setPhotoPreview(null);
            setCurrentPhoto(null);
            toast.success('Coach updated successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            console.error('Update coach error:', error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCoach = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('No authentication token found');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to delete coach');
            }

            toast.success('Coach deleted successfully!');
            await fetchCoaches();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete coach');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            setFormData((prev) => ({
                ...prev,
                birth_date: `${year}-${month}-${day}`,
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
                            alt={coach.name || 'Coach'}
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
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'birth_date', header: 'Birth Date' },
        { accessorKey: 'description', header: 'Description' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const coach = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setEditId(coach.id);
                                        setFormData({
                                            birth_date: coach.birth_date || '',
                                            description: coach.description || '',
                                            photo: null,
                                        });
                                        setCurrentPhoto(coach.photo 
                                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${coach.photo.replace('storage/', '')}`
                                            : null);
                                        setPhotoPreview(null);
                                        setIsDialogOpen(true);
                                    }}
                                    aria-label={`Edit coach ${coach.name}`}
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
                                        setDeleteId(coach.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    aria-label={`Delete coach ${coach.name}`}
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

    return (
        <div className="px-6">
            <DataTable columns={columns} data={coaches} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Coach</DialogTitle>
                        <DialogDescription>Update the coach details below.</DialogDescription>
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
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
                                    ) : currentPhoto ? (
                                        <div className="flex flex-col items-start gap-2">
                                            <Image
                                                src={currentPhoto}
                                                alt="Current"
                                                width={80}
                                                height={80}
                                                className="object-cover rounded border"
                                            />
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
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
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
        </div>
    );
}