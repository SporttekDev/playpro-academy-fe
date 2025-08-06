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
import { Switch } from '@/components/ui/switch';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
    id: number;
    name: string;
    session_count: number;
    is_membership: boolean;
}

interface ProductForm {
    name: string;
    session_count: number;
    is_membership: boolean;
}

const defaultForm: ProductForm = {
    name: "",
    session_count: 0,
    is_membership: false,
};

export default function ProductsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<ProductForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const token = Cookies.get("token");
            console.log("token:", token);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Server returned error response:", error);
                throw new Error("Failed to fetch products from server");
            }

            const { data } = await response.json();
            console.log("Product data:", data);

            setProducts(data);
        } catch (error) {
            console.error("Fetch products failed:", error);
            toast.error("Failed to fetch product data");
        }
    }, []);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return;
        }
        if (formData.session_count < 0) {
            toast.error("Session count cannot be negative");
            return;
        }

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/product/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/product`;
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
                const errorMessage = errorResponse?.message || "Failed to save product";
                throw new Error(errorMessage);
            }

            await fetchProducts();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save product error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteProduct() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/product/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete product");
            }

            toast.success("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete product");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? parseInt(value || "0", 10) : value,
        }));
    };

    const handleToggleMembership = (value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            is_membership: value,
        }));
    };

    const columns: ColumnDef<Product>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'session_count', header: 'Session Count' },
        {
            accessorKey: 'is_membership',
            header: 'Membership',
            cell: ({ row }) => row.original.is_membership ? "Yes" : "No"
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const prod = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(prod.id);
                                        setFormData({
                                            name: prod.name,
                                            session_count: prod.session_count,
                                            is_membership: prod.is_membership,
                                        });
                                        setIsDialogOpen(true);
                                    }}
                                    aria-label={`Edit product ${prod.name}`}
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
                                        setDeleteId(prod.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    aria-label={`Delete product ${prod.name}`}
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
                <DataTable columns={columns} data={products} />
            </div>

            {/* Floating Add Button */}
            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add Product" />

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Product' : 'New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit product details as needed.'
                                : 'Fill in the form below to add a new product.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProduct}>

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

                            {/* Session Count */}
                            <div className="grid gap-3">
                                <Label htmlFor="session_count">Session Count</Label>
                                <Input
                                    id="session_count"
                                    name="session_count"
                                    type="number"
                                    min={0}
                                    value={formData.session_count}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Is Membership */}
                            <div className="grid gap-3 items-center">
                                <Label htmlFor="is_membership">Membership</Label>
                                <Switch
                                    id="is_membership"
                                    checked={formData.is_membership}
                                    onCheckedChange={handleToggleMembership}
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
                onConfirm={handleDeleteProduct}
            />
        </>
    );
}