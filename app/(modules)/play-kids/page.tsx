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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPlus } from 'lucide-react';

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

interface Branch {
    id: number;
    name: string;
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

interface MembershipWithSessionForm {
    play_kid_id: number;
    registered_date: string;
    valid_until: string;
    status: string;
    branch_id: number;
    session_count: number;
    session_expiry_date: string;
}

const defaultMembershipWithSessionForm: MembershipWithSessionForm = {
    play_kid_id: 0,
    registered_date: "",
    valid_until: "",
    status: "active",
    branch_id: 0,
    session_count: 0,
    session_expiry_date: "",
};


export default function PlayKidsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);

    const [playKids, setPlayKids] = useState<PlayKid[]>([]);
    const [formData, setFormData] = useState<PlayKidForm>(defaultForm);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [parents, setParents] = useState<Parent[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [membershipForm, setMembershipForm] = useState<MembershipWithSessionForm>(defaultMembershipWithSessionForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedPlayKidId, setSelectedPlayKidId] = useState<number | null>(null);
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

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch branches");
            const { data } = await response.json();
            setBranches(data);
        } catch (error) {
            console.error("Fetch branches failed:", error);
            toast.error("Failed to fetch branches data");
        }
    }, []);

    useEffect(() => {
        fetchPlayKids();
        fetchParents();
        fetchBranches();
    }, [fetchPlayKids, fetchParents, fetchBranches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setPhotoPreview(null);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    useEffect(() => {
        if (!isMembershipDialogOpen) {
            setMembershipForm(defaultMembershipWithSessionForm);
        }
    }, [isMembershipDialogOpen]);

    const handleMembershipWithSessionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const token = Cookies.get("token");
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/membership`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...membershipForm,
                    play_kid_id: selectedPlayKidId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create membership with session");
            }

            toast.success("Membership and Session created successfully!");
            setIsMembershipDialogOpen(false);
            setMembershipForm(defaultMembershipWithSessionForm);
        } catch (error) {
            console.error("Create membership with session error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create membership with session");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedPlayKidId(playKid.id);
                                        setIsMembershipDialogOpen(true);
                                    }}
                                    aria-label={`Add membership play kid ${playKid.name}`}
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Add Membership
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
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
                                        setDeleteId(playKid.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    aria-label={`Delete play kid ${playKid.name}`}
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
                                <Label>Parent</Label>
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

            <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                    <DialogTitle>Add Membership with Session</DialogTitle>
                    <DialogDescription>
                        Fill all fields to create membership and initial session.
                    </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleMembershipWithSessionSubmit}>
                    <div className="grid gap-4">
                        {/* Membership Fields */}
                        <div className="space-y-2">
                        <Label htmlFor="registered_date">Registered Date</Label>
                        <DatePicker
                            value={membershipForm.registered_date ? new Date(membershipForm.registered_date) : undefined}
                            onChange={(date) =>
                            date &&
                            setMembershipForm((prev) => ({
                                ...prev,
                                registered_date: date.toISOString().split("T")[0],
                            }))
                            }
                        />
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="valid_until">Valid Until</Label>
                        <DatePicker
                            value={membershipForm.valid_until ? new Date(membershipForm.valid_until) : undefined}
                            onChange={(date) =>
                            date &&
                            setMembershipForm((prev) => ({
                                ...prev,
                                valid_until: date.toISOString().split("T")[0],
                            }))
                            }
                        />
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="branch_id">Branch</Label>
                        <Select
                            value={membershipForm.branch_id?.toString() || ""}
                            onValueChange={(value) =>
                            setMembershipForm((prev) => ({
                                ...prev,
                                branch_id: parseInt(value),
                            }))
                            }
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={membershipForm.status || ""}
                            onValueChange={(value) =>
                            setMembershipForm((prev) => ({
                                ...prev,
                                status: value,
                            }))
                            }
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>

                        {/* Session Fields */}
                        <div className="border-t pt-4 mt-4">
                        <h3 className="font-medium mb-2">Initial Session</h3>

                        <div className="space-y-2">
                            <Label htmlFor="session_count">Session Count</Label>
                            <Input
                            type="number"
                            value={membershipForm.session_count || ""}
                            onChange={(e) =>
                                setMembershipForm((prev) => ({
                                ...prev,
                                session_count: parseInt(e.target.value) || 0,
                                }))
                            }
                            min="1"
                            />
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="session_expiry_date">Expiry Date</Label>
                            <DatePicker
                            value={
                                membershipForm.session_expiry_date
                                ? new Date(membershipForm.session_expiry_date)
                                : undefined
                            }
                            onChange={(date) =>
                                date &&
                                setMembershipForm((prev) => ({
                                ...prev,
                                session_expiry_date: date.toISOString().split("T")[0],
                                }))
                            }
                            />
                        </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMembershipDialogOpen(false)}
                        >
                        Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Create Membership & Session"}
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