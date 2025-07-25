'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconPlus } from '@tabler/icons-react';

interface FloatingAddButtonProps {
    onClick: () => void;
    tooltip?: string;
}

export function FloatingAddButton({
    onClick,
    tooltip = 'Add New',
}: FloatingAddButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onClick}
                    size="icon"
                    className={`
            fixed
            z-50
            bg-primary text-primary-foreground hover:bg-primary/90
            shadow-lg rounded-full
            bottom-4 right-4
            w-12 h-12
            sm:bottom-6 sm:right-6
            sm:w-14 sm:h-14
            flex items-center justify-center
            transition-transform duration-150
            active:scale-95
          `}
                >
                    <IconPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );
}
