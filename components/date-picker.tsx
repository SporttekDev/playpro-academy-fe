'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface DatePickerProps {
    value: Date | undefined
    onChange: (date: Date | undefined) => void
    modal?: boolean // Optional modal property
}

export function DatePicker({ value, onChange, modal }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen} modal={modal}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal"
                    >
                        {value ? value.toLocaleDateString() : 'Select date'}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[1000]" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        defaultMonth={value || new Date()} // Set to today if value is undefined
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            console.log("Date selected:", date);
                            onChange(date);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}