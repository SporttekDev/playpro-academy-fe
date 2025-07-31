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
import Image from 'next/image';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlayKid {
    id: number;
    parent_id: string;
    name: string;
    nick_name: string;
    birth_date: string;
    gender: string;
    photo: string;
    medical_history: string;
    school_origin: string;
}

interface PlayKidForm {
    parent_id: string;
    name: string;
    nick_name: string;
    birth_date: string;
    gender: string;
    photo: string;
    medical_history: string;
    school_origin: string;
}

interface Parent {
    id: string;
    name: string;
    role: string;
}

const defaultForm: PlayKidForm = {
    parent_id: '',
    name: "",
    nick_name: "",
    birth_date: "",
    gender: "",
    photo: "",
    medical_history: "",
    school_origin: "",
};

export default function PlayKidsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [playKids, setPlayKids] = useState<PlayKid[]>([]);
    const [formData, setFormData] = useState<PlayKidForm>(defaultForm);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [parents, setParents] = useState<Parent[]>([]);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchPlayKids = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch play kids from server");
            }

            const { data } = await response.json();
            console.log("PlayKid data:", data);

            setPlayKids(data);
        } catch (error) {
            console.error("Fetch play kids failed:", error);
            toast.error("Failed to fetch play kid data");
        }
    }, []);

    const fetchParents = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch parents from server");
            }

            const { data } = await response.json();
            console.log("Parent data:", data);

            const parentsData = data.filter((item: Parent) => item.role === "parent");

            setParents(parentsData);
        } catch (error) {
            console.error("Fetch parents failed:", error);
            toast.error("Failed to fetch play kid data");
        }
    }, []);

    useEffect(() => {
        fetchPlayKids();
        fetchParents();
    }, [fetchPlayKids, fetchParents]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setPhotoPreview(null); 
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSavePlayKid = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!formData.parent_id || !formData.name.trim() || !formData.birth_date.trim() || !formData.gender.trim()) {
            toast.error("Please fill in all required fields");
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
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid`;

            const formDataToSend = new FormData();
            
            formDataToSend.append('_method', method === 'PUT' ? 'PUT' : 'POST');
            formDataToSend.append('parent_id', formData.parent_id);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('nick_name', formData.nick_name || '');
            formDataToSend.append('birth_date', formData.birth_date);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('medical_history', formData.medical_history || '');
            formDataToSend.append('school_origin', formData.school_origin || '');

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
                const errorMessage = errorResponse?.message || 
                                errorResponse?.error || 
                                `Failed to ${isEditing ? 'update' : 'create'} play kid`;
                throw new Error(errorMessage);
            }

            await fetchPlayKids();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            setPhotoPreview(null);
            toast.success(isEditing ? "Play Kid updated successfully!" : "Play Kid created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            console.error("Save play kid error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeletePlayKid() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete play kid");
            }

            toast.success("Play Kid deleted successfully!");
            fetchPlayKids();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete play kid");
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

    const columns: ColumnDef<PlayKid>[] = [
        {
            accessorKey: 'photo',
            header: 'Photo',
            cell: ({ row }) => {
                const playKid = row.original;
                return playKid.photo ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${playKid.photo.replace('storage/', '')}`}
                            alt={playKid.name}
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
        { accessorKey: 'nick_name', header: 'Nick Name' },
        { accessorKey: 'birth_date', header: 'Birth Date' },
        {
            accessorKey: 'gender',
            header: 'Gender',
            cell: ({ row }) => {
                const gender = row.original.gender;
                return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender;
            }
        },
        { accessorKey: 'school_origin', header: 'School Origin' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const playKid = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(playKid.id);
                                setFormData({
                                parent_id: playKid.parent_id.toString(),
                                name: playKid.name,
                                nick_name: playKid.nick_name,
                                birth_date: playKid.birth_date,
                                gender: playKid.gender,
                                photo: playKid.photo,
                                medical_history: playKid.medical_history,
                                school_origin: playKid.school_origin,
                                });
                                setPhotoPreview(playKid.photo ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${playKid.photo.replace('storage/', '')}` : null);
                                setIsDialogOpen(true);
                            }}
                            aria-label={`Edit play kid ${playKid.name}`}
                            >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(playKid.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            aria-label={`Delete play kid ${playKid.name}`}
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
                <DataTable columns={columns} data={playKids} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Play Kid" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit PlayKid' : 'New PlayKid'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit play kid details as needed.'
                                : 'Fill in the form below to add a new playkid.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSavePlayKid}>

                        <div className="grid gap-4">
                            {/* Parent ID */}
                            <div className="space-y-1">
                                <Label>Parent ID</Label>
                                <Select
                                    value={formData.parent_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Render option dari state parents */}
                                        {parents.map((parent) => (
                                            <SelectItem key={parent.id} value={parent.id.toString()}>
                                                {parent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Name */}
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Nick Name */}
                            <div className="space-y-1">
                                <Label>Nick Name</Label>
                                <Input
                                    name="nick_name"
                                    value={formData.nick_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Birth Date */}
                            <div className="space-y-1">
                                <Label>Birth Date</Label>
                                <DatePicker
                                    value={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                    onChange={handleDateChange}
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-1">
                                <Label>Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Male</SelectItem>
                                        <SelectItem value="F">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Medical History */}
                            <div className="space-y-1">
                                <Label>Medical History</Label>
                                <Input
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* School Origin */}
                            <div className="space-y-1">
                                <Label>School Origin</Label>
                                <Input
                                    name="school_origin"
                                    value={formData.school_origin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Photo */}
                            <div className="space-y-1">
                            <Label>Photo</Label>
                            <Input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {/* Tampilkan preview */}
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
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${formData.photo.replace('storage/', '')}`}
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
                onConfirm={handleDeletePlayKid}
            />
        </>
    );
}