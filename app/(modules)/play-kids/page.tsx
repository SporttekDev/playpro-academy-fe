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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconPencil, IconTrash, IconReload, IconDownload, IconUpload } from '@tabler/icons-react';
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
import formatDateLocal from '@/helpers/formatDateLocal';
import { useRequireAdmin } from '@/lib/auth';

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

interface ImportResult {
    imported_count: number;
    updated_count: number;
    skipped_count: number;
    errors: string[];
    warnings: string[];
}

export default function PlayKidsPage() {
    const { isAdmin } = useRequireAdmin({
        cookieKey: 'session_key',
        redirectTo: '/dashboard',
        adminRole: 'admin',
        showToastOnFail: true,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importLoading, setImportLoading] = useState(false);

    const fetchPlayKids = useCallback(async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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

    const downloadTemplate = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/download-template`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download template');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'playkid_import_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Template berhasil didownload');
        } catch (error) {
            console.error(error);
            toast.error('Gagal download template');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = ['.xlsx', '.xls', '.csv'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!validTypes.includes(fileExtension || '')) {
                toast.error('File harus dalam format Excel (.xlsx, .xls) atau CSV');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error('File terlalu besar. Maksimal 10MB');
                return;
            }

            setSelectedFile(file);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }

        setImportLoading(true);
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/import`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setImportResult(result.data);
                toast.success(`Import berhasil: ${result.data.imported_count} data baru, ${result.data.updated_count} data diperbarui`);

                fetchPlayKids();

                setTimeout(() => {
                    setSelectedFile(null);
                    setImportResult(null);
                    setIsImportDialogOpen(false);
                }, 3000);
            } else {
                toast.error(result.message || 'Import gagal');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saat import file');
        }
        setImportLoading(false);
    };

    const resetImport = () => {
        setSelectedFile(null);
        setImportResult(null);
    };

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

            const registeredDate = editId ? membershipForm.registered_date : membershipForm.registered_date || formatDateLocal(new Date());

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
                    registered_date: registeredDate,
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

            if (!token) {
                throw new Error("No authentication token found");
            }

            const purchaseDate = editId ? sessionForm.purchase_date : sessionForm.purchase_date || formatDateLocal(new Date());

            if (!sessionForm.membership_id || sessionForm.count <= 0 || !purchaseDate || sessionForm.expiry_date <= 0) {
                throw new Error("Please fill in all required fields correctly");
            }

            const method = isEditingSession ? "PUT" : "POST";
            const url = isEditingSession
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/session/${sessionForm.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/session`;

            const sessionData = {
                membership_id: parseInt(sessionForm.membership_id),
                count: sessionForm.count,
                expiry_date: sessionForm.expiry_date,
                purchase_date: purchaseDate,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sessionData),
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => null);
                const errorMessage = errorResponse?.message || `Failed to ${isEditingSession ? 'update' : 'create'} session`;
                throw new Error(errorMessage);
            }

            await fetchAllSessions(selectedPlayKidId!, memberships);
            setSessionForm(defaultSessionForm);
            setIsEditingSession(false);
            toast.success(isEditingSession ? "Session updated successfully!" : "Session created successfully!");
        } catch (error) {
            console.error(`${isEditingSession ? 'Update' : 'Create'} session error:`, error);
            toast.error(error instanceof Error ? error.message : `Failed to ${isEditingSession ? 'update' : 'create'} session`);
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
            const fetchMethod = "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/play-kid`;

            const formDataToSend = new FormData();

            formDataToSend.append('_method', method);
            formDataToSend.append('parent_id', formData.parent_id);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('nick_name', formData.nick_name || '');
            formDataToSend.append('birth_date', formData.birth_date);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('medical_history', formData.medical_history || '');
            formDataToSend.append('school_origin', formData.school_origin || '');

            for (const [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }

            const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
            if (photoInput?.files?.[0]) {
                formDataToSend.append('photo', photoInput.files[0]);
            } else if (isEditing && formData.photo && !photoInput?.files?.length) {
                formDataToSend.append('existing_photo', formData.photo);
            }

            const res = await fetch(url, {
                method: fetchMethod,
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

    const handleDateChange = <T extends object>(
        date: Date | undefined,
        field: keyof T,
        setState: React.Dispatch<React.SetStateAction<T>>
    ) => {
        if (!date) return;

        const formatedDate = formatDateLocal(date);
        setState((prev) => ({
            ...prev,
            [field]: formatedDate,
        }));
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
                                        const purchaseDate = session.purchase_date ? new Date(session.purchase_date) : new Date();
                                        const expiryDate = new Date(session.expiry_date);
                                        const monthsDiff = Math.round(
                                            (expiryDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                                        );

                                        setSessionForm({
                                            id: session.id,
                                            membership_id: session.membership_id.toString(),
                                            count: session.count,
                                            expiry_date: monthsDiff,
                                            purchase_date: session.purchase_date
                                                ? new Date(session.purchase_date).toISOString().split('T')[0]
                                                : new Date().toISOString().split('T')[0],
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

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            {/* Header dengan Actions */}
            <div className='px-6 space-y-4'>
                <div className="flex justify-end items-center">
                    <div className="flex gap-2">
                        {/* Refresh Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={fetchPlayKids}
                                    disabled={isLoading}
                                >
                                    <IconReload size={16} className={isLoading ? 'animate-spin' : ''} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh Data</TooltipContent>
                        </Tooltip>

                        {/* Download Template Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={downloadTemplate}>
                                    <IconDownload size={16} />
                                    <span className="ml-2">Template</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download Template Excel</TooltipContent>
                        </Tooltip>

                        {/* Import Button */}
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <IconUpload size={16} />
                                            <span className="ml-2">Import Data</span>
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Import Data</TooltipContent>
                            </Tooltip>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Import Data Play Kids</DialogTitle>
                                    <DialogDescription>
                                        Upload file Excel untuk import data play kids
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div>
                                        <Input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileSelect}
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Format: .xlsx, .xls, .csv (maks. 10MB)
                                        </p>
                                    </div>

                                    {selectedFile && (
                                        <div className="p-3 border rounded-md bg-muted/50">
                                            <p className="text-sm font-medium">File terpilih:</p>
                                            <p className="text-sm">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                        </div>
                                    )}

                                    {importLoading && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-center">Sedang mengimport data...</p>
                                        </div>
                                    )}

                                    {importResult && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div className="text-center p-2 bg-green-50 rounded">
                                                    <p className="font-bold text-green-600">{importResult.imported_count}</p>
                                                    <p>Data Baru</p>
                                                </div>
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <p className="font-bold text-blue-600">{importResult.updated_count}</p>
                                                    <p>Data Diupdate</p>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 rounded">
                                                    <p className="font-bold text-red-600">{importResult.skipped_count}</p>
                                                    <p>Data Dilewati</p>
                                                </div>
                                            </div>

                                            {importResult.errors.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-red-600 mb-2">Error saat import:</p>
                                                    <div className="max-h-32 overflow-y-auto text-sm">
                                                        {importResult.errors.map((error, index) => (
                                                            <p key={index} className="text-red-600 py-1">• {error}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {importResult.warnings.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-600 mb-2">Peringatan:</p>
                                                    <div className="max-h-32 overflow-y-auto text-sm">
                                                        {importResult.warnings.map((warning, index) => (
                                                            <p key={index} className="text-yellow-600 py-1">• {warning}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={resetImport}>
                                            Reset
                                        </Button>
                                        <Button
                                            onClick={handleImport}
                                            disabled={!selectedFile || importLoading}
                                        >
                                            {importLoading ? 'Importing...' : 'Import Data'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* DataTable */}
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
                                    onChange={(date) => handleDateChange(date, "birth_date", setFormData)}
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
                                            value={membershipForm.registered_date ? new Date(membershipForm.registered_date) : new Date()}
                                            onChange={(date) => { handleDateChange(date, "registered_date", setMembershipForm) }}
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
                                    {memberships.length === 0
                                        ? "No memberships found. Please add a membership first."
                                        : "No sessions found for this student"}
                                </div>
                            ) : (
                                <DataTable columns={sessionColumns} data={sessions} />
                            )}

                            {memberships.length > 0 ? (
                                <form onSubmit={handleSessionSubmit} className="space-y-4 border-t pt-4">
                                    <h4 className="font-medium">{isEditingSession ? 'Edit Session' : 'Add New Session'}</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <Label>Membership</Label>
                                            <Select
                                                value={sessionForm.membership_id}
                                                onValueChange={(value) =>
                                                    setSessionForm((prev) => ({ ...prev, membership_id: value }))
                                                }
                                                disabled={isEditingSession} // Disable membership selection when editing
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select membership" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {memberships.map((membership) => {
                                                        const branch = branches.find((b) => b.id === membership.branch_id);
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
                                                value={sessionForm.purchase_date ? new Date(sessionForm.purchase_date) : new Date()}
                                                onChange={(date) => { handleDateChange(date, "purchase_date", setSessionForm) }}
                                                modal={true}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Session Count</Label>
                                            <Input
                                                type="number"
                                                value={sessionForm.count}
                                                onChange={(e) =>
                                                    setSessionForm((prev) => ({ ...prev, count: parseInt(e.target.value) || 0 }))
                                                }
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Session Duration (Months)</Label>
                                            <Input
                                                id="expiry_date"
                                                type="number"
                                                min="1"
                                                value={sessionForm.expiry_date}
                                                onChange={(e) => {
                                                    const months = parseInt(e.target.value, 10) || 0;
                                                    setSessionForm((prev) => ({
                                                        ...prev,
                                                        expiry_date: isNaN(months) ? 0 : months,
                                                    }));
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={isLoading || !sessionForm.membership_id || sessionForm.count <= 0 || sessionForm.expiry_date <= 0}>
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