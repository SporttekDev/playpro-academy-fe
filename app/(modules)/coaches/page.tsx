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
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/multi-select';
import { Badge } from '@/components/ui/badge';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


interface Branch {
    id: number;
    name: string;
}

interface Coach {
    id: number;
    name: string;
    birth_date: string | null;
    description: string | null;
    photo: string | null;
    has_license: boolean;
    license_number: string | null;
    license_type: string | null;
    license_expiry_date: string | null;
    branch_ids: number[];
    branches: Branch[];
}

interface CoachForm {
    birth_date: string;
    description: string;
    photo: File | null;
    has_license: boolean;
    license_number: string;
    license_type: string;
    license_expiry_date: string;
    branch_ids: string[];
}

const defaultForm: CoachForm = {
    birth_date: '',
    description: '',
    photo: null,
    has_license: false,
    license_number: '',
    license_type: '',
    license_expiry_date: '',
    branch_ids: [],
};

export default function CoachesPage() {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [formData, setFormData] = useState<CoachForm>(defaultForm);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
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
            const sorted = [...data].sort((a: Coach, b: Coach) => a.name.localeCompare(b.name));
            setCoaches(sorted);
        } catch (error) {
            console.error('Fetch coaches failed:', error);
            toast.error('Failed to fetch coach data');
        }
    }, []);

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!response.ok) return;
            const { data } = await response.json();
            setBranches(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchCoaches();
        fetchBranches();
    }, [fetchCoaches, fetchBranches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setPhotoPreview(null);
            setCurrentPhoto(null);
            setRemovePhoto(false);
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
            formDataToSend.append('has_license', formData.has_license ? '1' : '0');
            formDataToSend.append('license_number', formData.license_number);
            formDataToSend.append('license_type', formData.license_type);
            formDataToSend.append('license_expiry_date', formData.license_expiry_date);

            formData.branch_ids.forEach((id) => {
                formDataToSend.append('branch_ids[]', id);
            });

            if (removePhoto) {
                formDataToSend.append('remove_photo', '1');
            } else if (formData.photo) {
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
            setRemovePhoto(false);
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

    const handleLicenseExpiryChange = (date: Date | undefined) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setFormData((prev) => ({
                ...prev,
                license_expiry_date: `${year}-${month}-${day}`,
            }));
        }
    };

    const resetFileInput = () => {
        const input = document.querySelector('input[name="photo"]') as HTMLInputElement;
        if (input) input.value = '';
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setCurrentPhoto(null);
        setFormData((prev) => ({ ...prev, photo: null }));
        setRemovePhoto(true);
        resetFileInput();
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
                            unoptimized={true}
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
        {
            header: 'License',
            cell: ({ row }) =>
                row.original.has_license ? (
                    <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                        {row.original.license_type || 'Licensed'}
                    </Badge>
                ) : (
                    <Badge className="rounded-full bg-slate-100 text-slate-500 hover:bg-slate-100">
                        No License
                    </Badge>
                ),
        },
        {
            header: 'Branches',
            cell: ({ row }) => {
                const names = row.original.branches.map((b) => b.name);
                if (names.length === 0) return <span className="text-xs text-muted-foreground">-</span>;
                return <span className="text-sm">{names.join(', ')}</span>;
            },
        },
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
                                            has_license: coach.has_license,
                                            license_number: coach.license_number || '',
                                            license_type: coach.license_type || '',
                                            license_expiry_date: coach.license_expiry_date || '',
                                            branch_ids: coach.branch_ids.map(String),
                                        });
                                        setCurrentPhoto(
                                            coach.photo
                                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${coach.photo.replace('storage/', '')}`
                                                : null
                                        );
                                        setPhotoPreview(null);
                                        setRemovePhoto(false);
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

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                const datePickerPopover = document.querySelector('[data-state="open"]');
                const handleClick = (e: MouseEvent) => {
                    if (open === false && datePickerPopover?.contains(e.target as Node)) {
                        return;
                    }
                    setIsDialogOpen(open);
                };
                document.addEventListener('click', handleClick, { once: true });
            }}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
                                    modal={true}
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
                                <Label>Branches</Label>
                                <MultiSelect
                                    value={formData.branch_ids}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, branch_ids: value }))
                                    }
                                    options={branches.map((b) => ({
                                        value: b.id.toString(),
                                        label: b.name,
                                    }))}
                                    placeholder="Select branches"
                                    modalPopover={true}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label>Has License</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Does this coach hold a coaching license?
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.has_license}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, has_license: checked }))
                                    }
                                />
                            </div>

                            {formData.has_license && (
                                <>
                                    <div className="space-y-1">
                                        <Label>License Number</Label>
                                        <Input
                                            value={formData.license_number}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, license_number: e.target.value }))
                                            }
                                            placeholder="e.g. BWF-12345"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>License Type</Label>
                                        <Input
                                            value={formData.license_type}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, license_type: e.target.value }))
                                            }
                                            placeholder="e.g. Badminton World Federation Level 1"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>License Expiry Date</Label>
                                        <DatePicker
                                            value={formData.license_expiry_date ? new Date(formData.license_expiry_date) : undefined}
                                            onChange={handleLicenseExpiryChange}
                                            modal={true}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Photo */}
                            <div className="space-y-1">
                                <Label>Photo</Label>
                                <Input
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setRemovePhoto(false);
                                        handleFileChange(e);
                                    }}
                                />
                                <div className="mt-2">
                                    {!removePhoto && (photoPreview || currentPhoto) ? (
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="relative inline-block">
                                                <Image
                                                    src={photoPreview ?? currentPhoto!}
                                                    alt="Photo preview"
                                                    width={80}
                                                    height={80}
                                                    className="object-cover rounded border"
                                                    unoptimized={true}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors"
                                                    aria-label="Hapus foto"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            {!photoPreview && currentPhoto && (
                                                <span className="text-xs text-gray-500">Current photo</span>
                                            )}
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