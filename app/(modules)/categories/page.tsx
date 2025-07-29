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

interface Category {
    id: number;
    name: string;
    description: string;
}

interface CategoryForm {
    name: string;
    description: string;
}

const defaultForm: CategoryForm = {
    name: "",
    description: "",
};

export default function CategoriesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<CategoryForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch categories from server");
            }

            const { data } = await response.json();
            console.log("Category data:", data);

            setCategories(data);
        } catch (error) {
            console.error("Fetch categories failed:", error);
            toast.error("Failed to fetch category data");
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/category/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/category`;
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
                const errorMessage = errorResponse?.message || "Failed to save category";
                throw new Error(errorMessage);
            }

            await fetchCategories();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save category error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteCategory() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/category/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete category");
            }

            toast.success("Category deleted successfully!");
            fetchCategories();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete category");
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

    const columns: ColumnDef<Category>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'description', header: 'Description' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const category = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(category.id);
                                setFormData({
                                    name: category.name,
                                    description: category.description,
                                });
                                setIsDialogOpen(true);
                            }}
                            aria-label={`Edit category ${category.name}`}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(category.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            aria-label={`Delete category ${category.name}`}
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
                <DataTable columns={columns} data={categories} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Category" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Category' : 'New Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit category details as needed.'
                                : 'Fill in the form below to add a new category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory}>

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
                onConfirm={handleDeleteCategory}
            />
        </>
    );
}