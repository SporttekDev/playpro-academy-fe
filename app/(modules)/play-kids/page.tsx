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
import Image from 'next/image';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface Membership {
    id: number;
    play_kid_id: number;
    registered_date: string;
    valid_until: string;
    status: string;
    branch_id: number;
}

interface Session {
    id: number;
    membership_id: number;
    count: number;
    expiry_date: string;
    purchase_date?: string;
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

interface MembershipForm {
    id?: number;
    play_kid_id: number;
    registered_date: string;
    valid_until: number;
    status: string;
    branch_id: string;
}

const defaultMembershipForm: MembershipForm = {
    play_kid_id: 0,
    registered_date: "",
    valid_until: 0,
    status: "active",
    branch_id: "",
};

interface SessionForm {
    id?: number;
    membership_id: string;
    count: number;
    expiry_date: number;
    purchase_date?: string;
}

const defaultSessionForm: SessionForm = {
    membership_id: "",
    count: 0,
    expiry_date: 0,
    purchase_date: "",
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
    const [membershipForm, setMembershipForm] = useState<MembershipForm>(defaultMembershipForm);
    const [sessionForm, setSessionForm] = useState<SessionForm>(defaultSessionForm);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedPlayKidId, setSelectedPlayKidId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("memberships");
    const [isEditingMembership, setIsEditingMembership] = useState(false);
    const [isEditingSession, setIsEditingSession] = useState(false);

    const fetchPlayKids = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch play kids from server");
            }

            const { data } = await response.json();
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
                throw new Error("Failed to fetch parents from server");
            }

            const { data } = await response.json();
            const parentsData = data.filter((item: Parent) => item.role === "parent");
            setParents(parentsData);
        } catch (error) {
            console.error("Fetch parents failed:", error);
            toast.error("Failed to fetch parents data");
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

    const fetchMemberships = useCallback(async (playKidId: number) => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/${playKidId}/memberships`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch memberships");
            const { data } = await response.json();
            setMemberships(data);
            return data;
        } catch (error) {
            console.error("Fetch memberships failed:", error);
            toast.error("Failed to fetch membership data");
            return [];
        }
    }, []);

    const fetchAllSessions = useCallback(
        async (playKidId: number, currentMemberships?: Membership[]) => {
            if (!playKidId) return;

            try {
                const token = Cookies.get("token");
                const membershipList = currentMemberships ?? [];
                const allSessions: Session[] = [];

                for (const membership of membershipList) {
                    try {
                        const sessionResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/admin/membership/${membership.id}/sessions`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    Accept: "application/json",
                                },
                            }
                        );
                        if (sessionResponse.ok) {
                            const { data } = await sessionResponse.json();
                            allSessions.push(...data);
                        }
                    } catch (err) {
                        console.error(`Failed to fetch sessions for membership ${membership.id}:`, err);
                    }
                }
                setSessions(allSessions);
            } catch (error) {
                console.error("Fetch all sessions failed:", error);
            }
        },
        []
    );

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
        if (isMembershipDialogOpen && selectedPlayKidId) {
            (async () => {
                const membershipData = await fetchMemberships(selectedPlayKidId);
                fetchAllSessions(selectedPlayKidId, membershipData);
            })();
            setActiveTab("memberships");
        } else {
            setMemberships([]);
            setSessions([]);
            setMembershipForm(defaultMembershipForm);
            setSessionForm(defaultSessionForm);
            setIsEditingMembership(false);
            setIsEditingSession(false);
        }
    }, [isMembershipDialogOpen, selectedPlayKidId, fetchMemberships, fetchAllSessions]);

    useEffect(() => {
        if (activeTab === "sessions" && selectedPlayKidId && memberships.length > 0) {
            fetchAllSessions(selectedPlayKidId, memberships);
        }
    }, [activeTab, selectedPlayKidId, memberships, fetchAllSessions]);

    const handleMembershipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const token = Cookies.get("token");

            const method = isEditingMembership ? "PUT" : "POST";
            const url = isEditingMembership
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/membership/${membershipForm.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/membership`;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...membershipForm,
                    play_kid_id: selectedPlayKidId,
                }),
            });

            if (!response.ok) throw new Error(`Failed to ${isEditingMembership ? 'update' : 'create'} membership`);

            await fetchMemberships(selectedPlayKidId!);
            if (activeTab === "sessions") {
                await fetchAllSessions(selectedPlayKidId!, memberships);
            }
            setMembershipForm(defaultMembershipForm);
            setIsEditingMembership(false);
            toast.success(isEditingMembership ? "Membership updated successfully!" : "Membership created successfully!");
        } catch (error) {
            console.error(`${isEditingMembership ? 'Update' : 'Create'} membership error:`, error);
            toast.error(`Failed to ${isEditingMembership ? 'update' : 'create'} membership`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSessionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const token = Cookies.get("token");

            const method = isEditingSession ? "PUT" : "POST";
            const url = isEditingSession
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/session/${sessionForm.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/session`;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sessionForm),
            });

            if (!response.ok) throw new Error(`Failed to ${isEditingSession ? 'update' : 'create'} session`);

            await fetchAllSessions(selectedPlayKidId!, memberships);
            setSessionForm(defaultSessionForm);
            setIsEditingSession(false);
            toast.success(isEditingSession ? "Session updated successfully!" : "Session created successfully!");
        } catch (error) {
            console.error(`${isEditingSession ? 'Update' : 'Create'} session error:`, error);
            toast.error(`Failed to ${isEditingSession ? 'update' : 'create'} session`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMembership = async (membershipId: number) => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/membership/${membershipId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to delete membership");

            await fetchMemberships(selectedPlayKidId!);
            if (activeTab === "sessions") {
                await fetchAllSessions(selectedPlayKidId!, memberships);
            }
            toast.success("Membership deleted successfully!");
        } catch (error) {
            console.error("Delete membership error:", error);
            toast.error("Failed to delete membership");
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/session/${sessionId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to delete session");

            await fetchAllSessions(selectedPlayKidId!, memberships);
            toast.success("Session deleted successfully!");
        } catch (error) {
            console.error("Delete session error:", error);
            toast.error("Failed to delete session");
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
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            setFormData((prev) => ({
                ...prev,
                birth_date: `${year}-${month}-${day}`,
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
                                    aria-label={`Manage memberships for ${playKid.name}`}
                                >
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Manage Memberships
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

    const membershipColumns: ColumnDef<Membership>[] = [
        {
            accessorKey: 'registered_date',
            header: 'Registered Date',
            cell: ({ row }) => {
                const date = row.original.registered_date;
                return date ? new Date(date).toLocaleDateString('en-CA') : "N/A";
            }
        },
        {
            accessorKey: 'valid_until',
            header: 'Valid Until',
            cell: ({ row }) => {
                const date = row.original.valid_until;
                return date ? new Date(date).toLocaleDateString('en-CA') : "N/A";
            }
        },
        { accessorKey: 'status', header: 'Status' },
        {
            accessorKey: 'branch_id',
            header: 'Branch',
            cell: ({ row }) => {
                const branchId = row.original.branch_id;
                const branch = branches.find(b => b.id === branchId);
                return branch?.name || "N/A";
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const membership = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setMembershipForm({
                                            id: membership.id,
                                            play_kid_id: membership.play_kid_id,
                                            registered_date: membership.registered_date,
                                            valid_until: Math.round(
                                                (new Date(membership.valid_until).getTime() - new Date(membership.registered_date).getTime()) /
                                                (1000 * 60 * 60 * 24 * 30)
                                            ),
                                            status: membership.status,
                                            branch_id: membership.branch_id.toString(),
                                        });
                                        setIsEditingMembership(true);
                                    }}
                                    aria-label={`Edit membership for ${membership.id}`}
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
                                    onClick={() => handleDeleteMembership(membership.id)}
                                    aria-label={`Delete membership ${membership.id}`}
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

    const sessionColumns: ColumnDef<Session>[] = [
        {
            accessorKey: 'membership_id',
            header: 'Membership',
            cell: ({ row }) => {
                const membershipId = row.original.membership_id;
                const membership = memberships.find(m => m.id === membershipId);
                
                if (membership) {
                    const branch = branches.find(b => b.id === membership.branch_id);
                    return branch ? branch.name : "N/A";
                }
                
                return "N/A";
            }
        },
        { accessorKey: 'count', header: 'Session Count' },
        {
            accessorKey: 'expiry_date',
            header: 'Expiry Date',
            cell: ({ row }) => {
                const expiryDate = row.original.expiry_date;
                if (expiryDate) {
                    return new Date(expiryDate).toLocaleDateString('en-CA');
                }
                return "N/A";
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const session = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSessionForm({
                                            id: session.id,
                                            membership_id: session.membership_id.toString(),
                                            count: session.count,
                                            expiry_date: Math.round(
                                                (new Date(session.expiry_date).getTime() - new Date(session.purchase_date || session.expiry_date).getTime()) /
                                                (1000 * 60 * 60 * 24 * 30)
                                            ),
                                            purchase_date: session.purchase_date,
                                        });
                                        setIsEditingSession(true);
                                    }}
                                    aria-label={`Edit session ${session.id}`}
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
                                    onClick={() => handleDeleteSession(session.id)}
                                    aria-label={`Delete session ${session.id}`}
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

            {/* Dialog for Create/Edit PlayKid */}
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
                                />
                            </div>

                            {/* Birth Date */}
                            <div className="space-y-1">
                                <Label>Birth Date</Label>
                                <DatePicker
                                    value={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                    onChange={handleDateChange}
                                    modal={true}
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
                                />
                            </div>

                            {/* School Origin */}
                            <div className="space-y-1">
                                <Label>School Origin</Label>
                                <Input
                                    name="school_origin"
                                    value={formData.school_origin}
                                    onChange={handleChange}
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
                                {/* Photo Preview */}
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
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Membership & Session Management</DialogTitle>
                        <DialogDescription>
                            Manage memberships and sessions for the selected student
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="memberships">Memberships</TabsTrigger>
                            <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="memberships" className="space-y-4">
                            {/* Memberships Table */}
                            <DataTable
                                columns={membershipColumns}
                                data={memberships}
                            />

                            {/* Add/Edit Membership Form */}
                            <form onSubmit={handleMembershipSubmit} className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">{isEditingMembership ? 'Edit Membership' : 'Add New Membership'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Registered Date</Label>
                                        <DatePicker
                                            value={membershipForm.registered_date ? new Date(membershipForm.registered_date) : undefined}
                                            onChange={(date) => {
                                                if (date) {
                                                    setMembershipForm(prev => ({
                                                        ...prev,
                                                        registered_date: date.toISOString().split('T')[0],
                                                    }));
                                                }
                                            }}
                                            modal={true}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="valid_until">Membership Duration (Months)</Label>
                                        <Input
                                            id="valid_until"
                                            type="number"
                                            min="0"
                                            value={membershipForm.valid_until}
                                            onChange={(e) => {
                                                const months = parseInt(e.target.value, 10) || 0;
                                                setMembershipForm(prev => ({
                                                    ...prev,
                                                    valid_until: isNaN(months) ? 0 : months,
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label>Status</Label>
                                        <Select
                                            value={membershipForm.status}
                                            onValueChange={(value) =>
                                                setMembershipForm(prev => ({ ...prev, status: value }))}
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
                                    <div className="space-y-1">
                                        <Label>Branch</Label>
                                        <Select
                                            value={membershipForm.branch_id}
                                            onValueChange={(value) =>
                                                setMembershipForm(prev => ({ ...prev, branch_id: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map(branch => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Loading..." : isEditingMembership ? "Save Changes" : "Add Membership"}
                                    </Button>
                                    {isEditingMembership && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setMembershipForm(defaultMembershipForm);
                                                setIsEditingMembership(false);
                                            }}
                                        >
                                            Cancel Edit
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="sessions" className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {memberships.length === 0 ?
                                        "No memberships found. Please add a membership first." :
                                        "No sessions found for this student"}
                                </div>
                            ) : (
                                /* Sessions Table */
                                <DataTable
                                    columns={sessionColumns}
                                    data={sessions}
                                />
                            )}

                            {/* Add/Edit Session Form */}
                            {memberships.length > 0 ? (
                                <form onSubmit={handleSessionSubmit} className="space-y-4 border-t pt-4">
                                    <h4 className="font-medium">{isEditingSession ? 'Edit Session' : 'Add New Session'}</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <Label>Membership</Label>
                                            <Select
                                                value={sessionForm.membership_id}
                                                onValueChange={(value) =>
                                                    setSessionForm(prev => ({ ...prev, membership_id: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select membership" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {memberships.map(membership => {
                                                        const branch = branches.find(b => b.id === membership.branch_id);
                                                        const branchName = branch ? branch.name : "Unknown Branch";
                                                        
                                                        return (
                                                            <SelectItem key={membership.id} value={membership.id.toString()}>
                                                                {branchName} - {membership.status}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Purchase Date</Label>
                                            <DatePicker
                                                value={sessionForm.purchase_date ? new Date(sessionForm.purchase_date) : undefined}
                                                onChange={(date) => {
                                                    if (date) {
                                                        setSessionForm(prev => ({
                                                            ...prev,
                                                            purchase_date: date.toISOString().split('T')[0],
                                                        }));
                                                    }
                                                }}
                                                modal={true}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Session Count</Label>
                                            <Input
                                                type="number"
                                                value={sessionForm.count}
                                                onChange={(e) =>
                                                    setSessionForm(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Session Duration (Months)</Label>
                                            <Input
                                                id="expiry_date"
                                                type="number"
                                                min="0"
                                                value={sessionForm.expiry_date}
                                                onChange={(e) => {
                                                    const months = parseInt(e.target.value, 10) || 0;
                                                    setSessionForm(prev => ({
                                                        ...prev,
                                                        expiry_date: isNaN(months) ? 0 : months,
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={isLoading || !sessionForm.membership_id}>
                                            {isLoading ? "Loading..." : isEditingSession ? "Save Changes" : "Add Session"}
                                        </Button>
                                        {isEditingSession && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setSessionForm(defaultSessionForm);
                                                    setIsEditingSession(false);
                                                }}
                                            >
                                                Cancel Edit
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="border-t pt-4 text-center text-gray-500">
                                    Please create a membership first before adding sessions
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsMembershipDialogOpen(false);
                                setMembershipForm(defaultMembershipForm);
                                setSessionForm(defaultSessionForm);
                                setSessions([]);
                                setActiveTab("memberships");
                                setIsEditingMembership(false);
                                setIsEditingSession(false);
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
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