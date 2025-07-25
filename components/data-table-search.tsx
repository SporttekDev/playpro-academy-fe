'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function DataTableSearch({ value, onChange }: Props) {
    return (
        <Input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        />
    );
}
