/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth.tsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export type Session = {
    id?: number | string;
    email?: string;
    role?: string;
    [key: string]: any;
} | null;

/**
 * Baca session yang tersimpan di cookie (default key: "session_key")
 */
export function getSessionFromCookie(cookieKey = 'session_key'): Session {
    const raw = Cookies.get(cookieKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to parse session cookie:', err);
        return null;
    }
}

/**
 * Cek apakah session mengandung role admin.
 * Bisa disesuaikan bila role admin anda menggunakan string berbeda (mis. 'administrator').
 */
export function isAdminSession(session: Session, adminRole = 'admin'): boolean {
    if (!session) return false;
    // if role is nested (mis. session.user.role) -> sesuaikan sesuai struktur session anda
    const role = (session as any).role ?? (session as any).user?.role;
    return !!role && String(role).toLowerCase() === adminRole.toLowerCase();
}

type UseRequireAdminOptions = {
    cookieKey?: string;
    redirectTo?: string;
    adminRole?: string;
    showToastOnFail?: boolean;
};

/**
 * Hook untuk membatasi akses halaman hanya untuk admin di sisi client.
 * - otomatis redirect jika bukan admin
 * - mengembalikan state isChecking (loading) dan isAdmin
 */
export function useRequireAdmin(options: UseRequireAdminOptions = {}) {
    const { cookieKey = 'session_key', redirectTo = '/dashboard', adminRole = 'admin', showToastOnFail = true } = options;
    const router = useRouter();

    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const session = getSessionFromCookie(cookieKey);

        if (isAdminSession(session, adminRole)) {
            setIsAdmin(true);
            setIsChecking(false);
            return;
        }

        // bukan admin -> redirect
        if (showToastOnFail) {
            toast.error('Akses ditolak — hanya untuk admin.');
        }
        // gunakan replace agar tidak menumpuk history
        router.replace(redirectTo);
        setIsChecking(false);
        setIsAdmin(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run sekali di mount

    return { isChecking, isAdmin };
}
