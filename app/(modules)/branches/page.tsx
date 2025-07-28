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

interface Branch {
    id: number;
    name: string;
    description: string;
    address: string;
}

interface BranchForm {
    name: string;
    description: string;
    address: string;
}

const defaultForm: BranchForm = {
    name: "",
    description: "",
    address: "",
};

export default function BranchesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [formData, setFormData] = useState<BranchForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch branches from server");
            }

            const { data } = await response.json();
            console.log("Branch data:", data);

            setBranches(data);
        } catch (error) {
            console.error("Fetch branches failed:", error);
            toast.error("Failed to fetch branch data");
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveBranch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Branch name is required");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/branch/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/branch`;
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
                const errorMessage = errorResponse?.message || "Failed to save branch";
                throw new Error(errorMessage);
            }

            await fetchBranches();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Branch updated successfully!" : "Branch created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save branch error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteBranch() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/branch/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete branch");
            }

            toast.success("Branch deleted successfully!");
            fetchBranches();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete branch");
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

    const columns: ColumnDef<Branch>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'description', header: 'Description' },
        { accessorKey: 'address', header: 'Address' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const branch = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(branch.id);
                                setFormData({
                                    name: branch.name,
                                    description: branch.description,
                                    address: branch.address,
                                });
                                setIsDialogOpen(true);
                            }}
                            aria-label={`Edit branch ${branch.name}`}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(branch.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            aria-label={`Delete branch ${branch.name}`}
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
                <DataTable columns={columns} data={branches} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Branch" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Branch' : 'New Branch'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit branch details as needed.'
                                : 'Fill in the form below to add a new branch.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveBranch}>

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

                            {/* Address */}
                            <div className="space-y-1">
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address}
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
                onConfirm={handleDeleteBranch}
            />
        </>
    );
}