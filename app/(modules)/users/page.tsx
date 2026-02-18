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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequireAdmin } from '@/lib/auth';

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address?: string;
}

interface UserForm {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address?: string;
}

const defaultForm: UserForm = {
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: '',
};

export default function UsersPage() {
    const { isAdmin } = useRequireAdmin({
        cookieKey: 'session_key',
        redirectTo: '/dashboard',
        adminRole: 'admin',
        showToastOnFail: true,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState<UserForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const token = Cookies.get("token");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users from server");
            }

            const { data } = await response.json();
            console.log(data)
            setUsers(data);
        } catch (error) {
            console.error("Fetch users failed:", error);
            toast.error("Failed to fetch user data");
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;
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
                const errorMessage = errorResponse?.message || "Failed to save user";
                throw new Error(errorMessage);
            }

            await fetchUsers();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? "User updated successfully!" : "User created successfully!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            console.error("Save user error:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteUser() {
        try {
            const token = Cookies.get("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete user");
            }

            toast.success("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete user");
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const columns: ColumnDef<User>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'role', header: 'Role' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'address', header: 'Address' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(user.id);
                                setFormData({
                                    ...user
                                });
                                setIsDialogOpen(true);
                            }}
                        >
                            <IconPencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDeleteId(user.id);
                                setIsDeleteDialogOpen(true);
                            }}
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
            <div className="px-6">
                <DataTable columns={columns} data={users} />
            </div>

            <FloatingAddButton onClick={() => {
                setIsEditing(false);
                setFormData(defaultForm);
                setIsDialogOpen(true);
            }} tooltip="Add User" />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit user details below'
                                : 'Fill in the new user details below'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser}>
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    required={!isEditing}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="coach">Coach</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Phone Number</Label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    placeholder="0812 3456 7890"
                                    value={formData.phone || ""}
                                    onChange={(e) => {
                                        const cleaned = e.target.value.replace(/[^0-9+\-\s]/g, "");
                                        setFormData((prev) => ({ ...prev, phone: cleaned }));
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type='button' variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Processing..." : isEditing ? "Save Changes" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={handleDeleteUser}
            />
        </>
    );
}