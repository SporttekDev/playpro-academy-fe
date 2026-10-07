// lib/api.ts
import Cookies from 'js-cookie';

/**
 * Error dari API. `message` sudah berisi pesan yang layak ditampilkan:
 * pesan validasi pertama untuk 422, atau `message` dari server.
 */
export class ApiError extends Error {
    status: number;
    errors: unknown;

    constructor(message: string, status: number, errors: unknown = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Query;
    /** Untuk membatalkan request (mis. AbortController di useEffect). */
    signal?: AbortSignal;
}

export interface ApiResult<T> {
    data: T;
    message: string;
    /** Body JSON utuh, untuk endpoint yang tidak memakai envelope `{ data }` (mis. dashboard). */
    raw: unknown;
}

interface ApiEnvelope {
    data?: unknown;
    message?: string;
    error?: unknown;
    errors?: unknown;
}

function buildUrl(path: string, query?: Query): string {
    const base = `${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`;
    if (!query) return base;

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
}

/** Gabungkan semua pesan dari bentuk validasi Laravel: { field: ["pesan", ...] }. */
function validationMessages(errors: unknown): string | null {
    if (!errors || typeof errors !== 'object') return null;

    const messages: string[] = [];

    for (const value of Object.values(errors as Record<string, unknown>)) {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (typeof item === 'string') messages.push(item);
            });
        } else if (typeof value === 'string') {
            messages.push(value);
        }
    }

    return messages.length ? messages.join(', ') : null;
}

/**
 * Panggil API backend. Mengembalikan `{ data, message }` dari envelope sukses,
 * dan melempar ApiError untuk status non-2xx.
 *
 * Contoh:
 *   const { data } = await apiRequest<Summary[]>('/finance/payroll', { query: { month: 9, year: 2026 } });
 *   await apiRequest(`/finance/payroll/${id}/finalize`, { method: 'POST' });
 */
export async function apiRequest<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<ApiResult<T>> {
    const { method = 'GET', body, query, signal } = options;
    const token = Cookies.get('token');

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    // FormData: biarkan browser mengisi Content-Type (beserta boundary).
    if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

    const response = await fetch(buildUrl(path, query), {
        method,
        headers,
        signal,
        body:
            body === undefined
                ? undefined
                : isFormData
                  ? (body as FormData)
                  : JSON.stringify(body),
    });

    let json: ApiEnvelope | null = null;
    try {
        json = (await response.json()) as ApiEnvelope;
    } catch {
        json = null;
    }

    if (!response.ok) {
        const details = json?.error ?? json?.errors ?? null;
        const validationMessage = response.status === 422 ? validationMessages(details) : null;

        throw new ApiError(
            validationMessage ?? json?.message ?? `Request failed (${response.status})`,
            response.status,
            details
        );
    }

    return {
        data: (json?.data ?? null) as T,
        message: json?.message ?? '',
        raw: json,
    };
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
    return error instanceof Error && error.message ? error.message : fallback;
}