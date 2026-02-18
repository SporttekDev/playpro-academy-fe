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
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { useRequireAdmin } from '@/lib/auth';

interface Sport {
    id: number;
    name: string;
    description: string;
}

interface SportForm {
    name: string;
    description: string;
}

const defaultForm: SportForm = {
    name: "",
    description: "",
};

export default function SportsPage() {
    const { isAdmin } = useRequireAdmin({
        cookieKey: 'session_key',
        redirectTo: '/dashboard',
        adminRole: 'admin',
        showToastOnFail: true,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [sports, setSports] = useState<Sport[]>([]);
    const [formData, setFormData] = useState<SportForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchSports = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/sport`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch sports from server");
            }

            const { data } = await response.json();
            console.log("Sport data:", data);

            setSports(data);
        } catch (error) {
            console.error("Fetch sports failed:", error);
            toast.error("Failed to fetch sport data");
        }
    }, []);

    useEffect(() => {
        fetchSports();
    }, [fetchSports]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveSport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Sport name is required");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/sport/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/sport`;
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
                const errorMessage = errorResponse?.message || "Failed to save sport";
                throw new Error(errorMessage);
            }

            await fetchSports();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Sport updated successfully!" : "Sport created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save sport error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteSport() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/sport/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete sport");
            }

            toast.success("Sport deleted successfully!");
            fetchSports();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete sport");
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

    const columns: ColumnDef<Sport>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'description', header: 'Description' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const sport = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(sport.id);
                                setFormData({
                                    name: sport.name,
                                    description: sport.description,
                                });
                                setIsDialogOpen(true);
                            }}
                            aria-label={`Edit sport ${sport.name}`}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(sport.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            aria-label={`Delete sport ${sport.name}`}
                        >
                            <IconTrash className="w-4 h-4 text-red-600" />
                        </Button>
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
            {/* DataTable */}
            <div className="px-6">
                <DataTable columns={columns} data={sports} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Sport" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Sport' : 'New Sport'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit sport details as needed.'
                                : 'Fill in the form below to add a new sport.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveSport}>

                        <div className="grid gap-4">
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
                onConfirm={handleDeleteSport}
            />
        </>
    );
}