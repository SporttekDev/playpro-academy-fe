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
import { getNameById } from '@/helpers/getNameById';

interface Venue {
    id: number;
    name: string;
    address: string;
    branch_id: string;
    capacity: number;
}

interface VenueForm {
    name: string;
    address: string;
    branch_id: string;
    capacity: number;
}

interface Branch {
    id: string;
    name: string;
}

const defaultForm: VenueForm = {
    name: '',
    address: '',
    branch_id: '',
    capacity: 0,
};

export default function VenuesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [venues, setVenues] = useState<Venue[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [formData, setFormData] = useState<VenueForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchVenues = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/venue`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch venues');
            }

            const { data } = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Fetch venues error:', error);
            toast.error('Failed to fetch venue data');
        }
    }, []);

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("error : ", error);
                throw new Error('Failed to fetch branches');
            }

            const { data } = await response.json();
            setBranches(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchVenues();
        fetchBranches()
    }, [fetchVenues, fetchBranches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveVenue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.address.trim() || !formData.branch_id || !formData.capacity) {
            toast.error('All fields are required');
            return;
        }

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/venue/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/venue`;
            const token = Cookies.get('token');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => null);
                const errorMessage = errorResponse?.message || 'Failed to save venue';
                throw new Error(errorMessage);
            }

            await fetchVenues();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? 'Venue updated successfully!' : 'Venue created successfully!');
        } catch (error) {
            console.error('Save venue error:', error);
            toast.error('Failed to save venue');
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteVenue() {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/venue/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete venue');
            }

            await fetchVenues();
            toast.success('Venue deleted successfully!');
        } catch (error) {
            console.error('Delete venue error:', error);
            toast.error('Failed to delete venue');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) : value,
        }));
    };

    const columns: ColumnDef<Venue>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'address', header: 'Address' },
        {
            accessorKey: 'branch_id',
            header: 'Branch',
            cell: ({ row }) => getNameById(row.original.branch_id, branches)
        },
        { accessorKey: 'capacity', header: 'Capacity' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const venue = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setIsEditing(true);
                                setEditId(venue.id);
                                setFormData({
                                    name: venue.name,
                                    address: venue.address,
                                    branch_id: venue.branch_id.toString(),
                                    capacity: venue.capacity,
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
                                setDeleteId(venue.id);
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

    return (
        <>
            <div className="px-6">
                <DataTable columns={columns} data={venues} />
            </div>

            <FloatingAddButton
                onClick={() => {
                    setIsEditing(false);
                    setFormData(defaultForm);
                    setIsDialogOpen(true);
                }}
                tooltip="Add Venue"
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Venue' : 'New Venue'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit venue details as needed.'
                                : 'Fill in the form below to add a new venue.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveVenue}>
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Branch</Label>
                                <Select
                                    value={formData.branch_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose branch" />
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

                            <div className="space-y-1">
                                <Label>Capacity</Label>
                                <Input
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? 'Loading...'
                                    : isEditing
                                        ? 'Save Changes'
                                        : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogDelete
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                onConfirm={handleDeleteVenue}
            />
        </>
    );
}