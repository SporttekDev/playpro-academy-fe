'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: string[] | FilterOption[];
    placeholder?: string;
    className?: string;
    includeAllOption?: boolean;
    allOptionLabel?: string;
    allOptionValue?: string;
}

export function DataTableFilter({ 
    value,
    onChange,
    options = [], // Default empty array
    placeholder = "Filter",
    className = "w-[150px]",
    includeAllOption = true,
    allOptionLabel = "Semua",
    allOptionValue = "all"
}: Props) {
    // Normalize options dengan validation
    const normalizedOptions: FilterOption[] = React.useMemo(() => {
        if (!Array.isArray(options)) {
            console.warn('DataTableFilter: options is not an array', options);
            return [];
        }

        return options
            .filter(option => option != null) // Filter null/undefined
            .map(option => {
                if (typeof option === 'string') {
                    return { value: option, label: option };
                } else if (option && typeof option === 'object' && 'value' in option && 'label' in option) {
                    return option as FilterOption;
                } else {
                    console.warn('DataTableFilter: Invalid option format', option);
                    return null;
                }
            })
            .filter((option): option is FilterOption => option !== null);
    }, [options]);

    const finalOptions = React.useMemo(() => {
        // Remove duplicates dari normalizedOptions dulu
        const uniqueNormalizedOptions = normalizedOptions.filter((option, index, self) => 
            self.findIndex(o => o.value === option.value) === index
        );

        // Lalu tambahkan "all" option jika diperlukan
        const baseOptions = includeAllOption 
            ? [{ value: allOptionValue, label: allOptionLabel }, ...uniqueNormalizedOptions]
            : uniqueNormalizedOptions;

        // Filter lagi untuk memastikan tidak ada duplikasi dengan allOptionValue
        const finalUniqueOptions = baseOptions.filter((option, index, self) => {
            // Jika ini adalah "all" option pertama, keep it
            if (option.value === allOptionValue && index === 0 && includeAllOption) {
                return true;
            }
            // Jika ini bukan "all" option, check uniqueness
            if (option.value !== allOptionValue) {
                return self.findIndex(o => o.value === option.value) === index;
            }
            // Skip duplikasi "all" options
            return false;
        });

        return finalUniqueOptions;
    }, [normalizedOptions, includeAllOption, allOptionValue, allOptionLabel]);

    // Handle invalid value
    const validValue = React.useMemo(() => {
        if (!value || finalOptions.some(option => option.value === value)) {
            return value;
        }
        // If current value is invalid, reset to "all" or first available option
        return includeAllOption ? allOptionValue : (finalOptions[0]?.value || '');
    }, [value, finalOptions, includeAllOption, allOptionValue]);

    // Debug logging
    // React.useEffect(() => {
    //     console.log('DataTableFilter Debug:', {
    //         originalOptions: options,
    //         normalizedOptions,
    //         finalOptions,
    //         currentValue: value,
    //         validValue
    //     });
    // }, [options, normalizedOptions, finalOptions, value, validValue]);

    return (
        <Select 
            value={validValue} 
            onValueChange={onChange}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {finalOptions.length === 0 ? (
                    <SelectItem value="" disabled>
                        No options available
                    </SelectItem>
                ) : (
                    finalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}