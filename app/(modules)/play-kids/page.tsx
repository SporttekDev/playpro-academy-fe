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
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSavePlayKid = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.parent_id || !formData.name.trim() || !formData.nick_name.trim() || !formData.birth_date.trim() || !formData.gender.trim() || !formData.photo.trim() || !formData.school_origin.trim()) {
            toast.error("All fields are required");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid`;
            const token = Cookies.get("token");

            const parentIdAsNumber = parseInt(formData.parent_id);

            const payload = {
                ...formData,
                parent_id: parentIdAsNumber,
            };
            console.log("payload : ", payload);

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorResponse = await res.json().catch(() => null);
                const errorMessage = errorResponse?.message || "Failed to save play kid";
                throw new Error(errorMessage);
            }

            await fetchPlayKids();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Play Kid updated successfully!" : "Play Kid created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
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

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                birth_date: date.toISOString().split('T')[0],
            }));
        }
    };

    const columns: ColumnDef<PlayKid>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'nick_name', header: 'Nick Name' },
        { accessorKey: 'birth_date', header: 'Birth Date' },
        { accessorKey: 'gender', header: 'Gender' },
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
                                    parent_id: playKid.parent_id,
                                    name: playKid.name,
                                    nick_name: playKid.nick_name,
                                    birth_date: playKid.birth_date,
                                    gender: playKid.gender,
                                    photo: playKid.photo,
                                    medical_history: playKid.medical_history,
                                    school_origin: playKid.school_origin,
                                });
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
                                    name="photo"
                                    value={formData.photo}
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
                onConfirm={handleDeletePlayKid}
            />
        </>
    );
}