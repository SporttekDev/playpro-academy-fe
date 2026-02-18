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
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AlertDialogDelete } from '@/components/alert-dialog-delete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNameById } from '@/helpers/getNameById';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRequireAdmin } from '@/lib/auth';

interface ClassData {
    id: number;
    name: string;
    sport_id: string;
    category_id: string;
    branch_id: string;
}

interface ClassForm {
    name: string;
    sport_id: string;
    category_id: string;
    branch_id: string;
}

interface Sport {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

interface Branch {
    id: string;
    name: string;
}

const defaultForm: ClassForm = {
    name: '',
    sport_id: '',
    category_id: '',
    branch_id: '',
};

export default function ClassesPage() {
    const { isAdmin } = useRequireAdmin({
        cookieKey: 'session_key',
        redirectTo: '/dashboard',
        adminRole: 'admin',
        showToastOnFail: true,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [classes, setClasses] = useState<ClassData[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [formData, setFormData] = useState<ClassForm>(defaultForm);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const fetchClasses = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/class`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("error : ", error);
                throw new Error('Failed to fetch classes');
            }

            const { data } = await response.json();
            setClasses(data);
        } catch (error) {
            console.error('Fetch classes error:', error);
            toast.error('Failed to fetch class data');
        }
    }, []);

    const fetchSports = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/sport`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("error : ", error);
                throw new Error('Failed to fetch sports');
            }

            const { data } = await response.json();
            setSports(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/category`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("error : ", error);
                throw new Error('Failed to fetch categories');
            }

            const { data } = await response.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
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
        const loadData = async () => {
            await Promise.all([
                fetchClasses(),
                fetchSports(),
                fetchCategories(),
                fetchBranches()
            ]);
        };
        loadData();
    }, [fetchClasses, fetchSports, fetchCategories, fetchBranches]);

    useEffect(() => {
        if (!isDialogOpen) {
            setFormData(defaultForm);
            setIsEditing(false);
        }
    }, [isDialogOpen]);

    const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const sportName = sports.find(sport => parseInt(sport.id) === parseInt(formData.sport_id))?.name;
        const categoryName = categories.find(category => parseInt(category.id) === parseInt(formData.category_id))?.name;
        const branchName = branches.find(branch => parseInt(branch.id) === parseInt(formData.branch_id))?.name;

        const formName = `${sportName} - ${categoryName} - ${branchName}`;

        if (!formName || !formData.sport_id || !formData.category_id || !formData.branch_id) {
            toast.error('All fields are required');
            return;
        }

        const payload: ClassForm = {
            ...formData,
            name: formName,
        };

        try {
            setIsLoading(true);
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/class/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/class`;
            const token = Cookies.get('token');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => null);
                const errorMessage = errorResponse?.message || 'Failed to save class';
                throw new Error(errorMessage);
            }

            await fetchClasses();
            setIsDialogOpen(false);
            setIsEditing(false);
            setFormData(defaultForm);
            toast.success(isEditing ? 'Class updated successfully!' : 'Class created successfully!');
        } catch (error) {
            console.error('Save class error:', error);
            toast.error('Failed to save class');
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDeleteClass() {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/class/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete class');
            }

            await fetchClasses();
            toast.success('Class deleted successfully!');
        } catch (error) {
            console.error('Delete class error:', error);
            toast.error('Failed to delete class');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    const columns: ColumnDef<ClassData>[] = [
        { accessorKey: 'name', header: 'Name' },
        {
            accessorKey: 'sport_id',
            header: 'Sport',
            cell: ({ row }) => getNameById(row.original.sport_id, sports)
        },
        {
            accessorKey: 'category_id',
            header: 'Category',
            cell: ({ row }) => getNameById(row.original.category_id, categories)
        },
        {
            accessorKey: 'branch_id',
            header: 'Branch',
            cell: ({ row }) => getNameById(row.original.branch_id, branches)
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const cls = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(cls.id);
                                        setFormData({
                                            name: cls.name,
                                            sport_id: cls.sport_id.toString(),
                                            category_id: cls.category_id.toString(),
                                            branch_id: cls.branch_id.toString(),
                                        });
                                        setIsDialogOpen(true);
                                    }}
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
                                        setDeleteId(cls.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
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
            <div className="px-6">
                <DataTable columns={columns} data={classes} />
            </div>

            <FloatingAddButton
                onClick={() => {
                    setIsEditing(false);
                    setFormData(defaultForm);
                    setIsDialogOpen(true);
                }}
                tooltip="Add Class"
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Class' : 'New Class'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Edit class details as needed.'
                                : 'Fill in the form below to add a new class.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveClass}>
                        <div className="grid gap-4">
                            {/* <div className="space-y-1">
                                <Label>Name</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}

                            <div className="space-y-1">
                                <Label>Sport</Label>
                                <Select
                                    value={formData.sport_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose sport" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Render option dari state parents */}
                                        {sports.map((sport) => (
                                            <SelectItem key={sport.id} value={sport.id.toString()}>
                                                {sport.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Category</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Render option dari state parents */}
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        {/* Render option dari state parents */}
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                onConfirm={handleDeleteClass}
            />
        </>
    );
}