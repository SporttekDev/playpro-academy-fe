'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconPlus } from '@tabler/icons-react';

interface FloatingAddButtonProps {
    onClick: () => void;
    tooltip?: string;
}

/**
 * Tombol tambah data (mengambang) + shortcut keyboard Alt+N.
 * Karena semua halaman CRUD memakai komponen ini, shortcut otomatis berlaku di semuanya.
 *
 * Shortcut diabaikan bila:
 *  - sebuah dialog / alert dialog sedang terbuka (supaya tidak membuka form kedua),
 *  - tombol ditahan (key repeat) atau sedang mengetik dengan IME.
 * Alt+N tetap bekerja saat fokus di kolom input, karena kombinasi ini tidak dipakai untuk mengetik.
 */
export function FloatingAddButton({
    onClick,
    tooltip = 'Add New',
}: FloatingAddButtonProps) {
    // Simpan onClick terbaru di ref agar listener tidak perlu dipasang ulang tiap render.
    const onClickRef = React.useRef(onClick);
    React.useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);

    const [shortcutLabel, setShortcutLabel] = React.useState('Alt+N');
    React.useEffect(() => {
        if (/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) {
            setShortcutLabel('⌥N');
        }
    }, []);

    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // e.code dipakai (bukan e.key) karena di Mac Option+N menghasilkan karakter lain ("˜").
            if (e.code !== 'KeyN' || !e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            if (e.repeat || e.isComposing) return;

            const dialogOpen = document.querySelector(
                '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
            );
            if (dialogOpen) return;

            e.preventDefault();
            onClickRef.current();
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onClick}
                    size="icon"
                    aria-label={tooltip}
                    aria-keyshortcuts="Alt+N"
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
                {tooltip} <span className="ml-1 opacity-70">({shortcutLabel})</span>
            </TooltipContent>
        </Tooltip>
    );
}