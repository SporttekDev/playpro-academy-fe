'use client'

import Image from 'next/image';
import type { SyntheticEvent } from 'react';

export interface ReportResponse {
    play_kid: PlayKid;
    branch: Branch;
    classes: ClassWithCategory[];
    attendance_reports: AttendanceReport[];
    attendance_count: number;
    months: string[];
    months_display: string;
}

export interface PlayKid {
    id: number;
    name: string;
    nick_name: string | null;
    birth_date: string;
    gender: "M" | "F" | string;
    school_origin: string | null;
    photo?: string | null;
    medical_history?: string | null;
}

export interface Branch {
    id: number;
    name: string;
    description: string | null;
}

export interface ClassWithCategory {
    id: number;
    name: string;
    sport_id: number;
    category_id: number;
    category: Category | null;
    sport: Sport | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Sport {
    id: number;
    name: string;
}

export interface AttendanceReport {
    id: number;
    class_id: number;
    class_name: string;
    date: string;
    start_time: string;
    end_time: string;
    attendance: number;
    motorik: string | null;
    locomotor: string | null;
    body_control: string | null;
    overall: number | null;
    coach: CoachSummary;
    month_year: string;
}

export interface CoachSummary {
    id: number;
    user_id: number;
    name: string;
    photo?: string | null;
}

interface ReportPDFProps {
    report: ReportResponse;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// "2026-11-01" -> "Minggu, 1 November 2026"
const formatDateLong = (date?: string | null) => {
    if (!date) return '-';
    const [y, m, d] = date.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return date;
    const dt = new Date(y, m - 1, d);
    return `${DAY_NAMES[dt.getDay()]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
};

// "09:00:00" -> "09:00"
const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : '');

// Beberapa catatan coach ditulis huruf kecil di awal kalimat
const capitalizeFirst = (text: string) => {
    const t = text.trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
};

const storageUrl = (path: string | null | undefined, fallback: string) =>
    path
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE}/${path.replace('storage/', '')}`
        : fallback;

const KID_FALLBACK = '/images/playkids-avatar.png';
const COACH_FALLBACK = '/images/coach-avatar.png';

// Kalau foto dari storage gagal dimuat, ganti ke avatar bawaan (sekali saja).
// waitForImages() di page.tsx membaca data-fallback yang sama saat ekspor.
const swapToFallback = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const fallback = img.dataset.fallback;
    if (!fallback || img.dataset.fallbackUsed === '1') return;
    img.dataset.fallbackUsed = '1';
    img.removeAttribute('srcset');
    img.src = fallback;
};

// Kepadatan adaptif: rapor 1 sesi memakai tampilan lega (mengisi A4), 2 sesi ke atas memakai tampilan padat
// supaya muat 2 sesi per halaman.
const UI = {
    comfortable: {
        main: 'px-10 py-6',
        list: 'space-y-4',
        cardHead: 'px-6 py-4',
        coachImg: 'w-24 h-24',
        aspects: 'space-y-3 px-6 pt-6 pb-6',
        block: 'px-4 py-2.5',
        title: 'text-sm',
        text: 'mt-1 text-[15px] leading-normal',
    },
    compact: {
        main: 'px-10 py-4',
        list: 'space-y-3',
        cardHead: 'px-5 py-3',
        coachImg: 'w-[72px] h-[72px]',
        aspects: 'space-y-2.5 p-4',
        block: 'px-4 py-2',
        title: 'text-xs',
        text: 'mt-0.5 text-[14px] leading-normal',
    },
} as const;

const ASPECTS = [
    { key: 'motorik', label: 'Motorik', bar: 'bg-amber-400', tint: 'bg-amber-50', title: 'text-amber-800' },
    { key: 'locomotor', label: 'Locomotor', bar: 'bg-emerald-500', tint: 'bg-emerald-50', title: 'text-emerald-800' },
    { key: 'body_control', label: 'Body Control', bar: 'bg-sky-500', tint: 'bg-sky-50', title: 'text-sky-800' },
] as const;

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function InfoItem({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">{label}</p>
            <p className={`${large ? 'mt-1 text-lg' : 'mt-0.5 text-base'} font-semibold text-white`}>{value}</p>
        </div>
    );
}

function RatingDots({ value }: { value: number | null }) {
    if (value === null || value === undefined) return null;
    const filled = Math.round(value);
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                    <span
                        key={i}
                        className={`block w-3.5 h-3.5 rounded-full ${i < filled ? 'bg-secondary' : 'bg-slate-300'}`}
                    />
                ))}
            </div>
            <span className="text-sm font-bold text-[#1f3d56]">{value}/5</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function ReportPDF({ report }: ReportPDFProps) {
    const { branch, classes, attendance_reports: attendance, play_kid: kid, months_display } = report;

    // Umur
    const birthDate = new Date(kid.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    const ageString = `${years} tahun ${months} bulan`;

    // Hanya sesi yang dihadiri, urut tanggal
    const sortedAttendance = [...attendance]
        .filter((item) => item.attendance)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const school = kid.school_origin && kid.school_origin.trim() !== '-' ? kid.school_origin : null;

    const classLabelOf = (item: AttendanceReport) => {
        const info = classes.find((cls) => cls.id === item.class_id);
        return info?.sport
            ? `${info.sport.name}${info.category ? ` — ${info.category.name}` : ''}`
            : item.class_name;
    };

    // Ringkasan bulan ini (hanya dari sesi yang dihadiri)
    const classLabels = Array.from(new Set(sortedAttendance.map(classLabelOf)));
    const ratings = sortedAttendance
        .map((item) => item.overall)
        .filter((v): v is number => typeof v === 'number');
    const average = ratings.length ? ratings.reduce((sum, v) => sum + v, 0) / ratings.length : null;
    const averageText = average !== null ? average.toFixed(1).replace('.', ',') : '-';
    const firstName = kid.nick_name?.trim() || kid.name.split(' ')[0];

    const comfortable = sortedAttendance.length <= 1;
    const ui = comfortable ? UI.comfortable : UI.compact;

    const logo = (
        <div className="relative w-36 h-36 shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
                <Image
                    src="/images/ppa-logo.png"
                    alt="Logo PPA"
                    width={200}
                    height={200}
                />
            </div>
        </div>
    );

    const kidPhoto = (sizeClass: string) => (
        <div className={`${sizeClass} shrink-0`}>
            <Image
                src={storageUrl(kid.photo, KID_FALLBACK)}
                alt={kid.name}
                width={400}
                height={400}
                className="w-full h-full object-cover rounded-full border-4 border-secondary"
                unoptimized={true}
                data-fallback={KID_FALLBACK}
                onError={swapToFallback}
            />
        </div>
    );

    return (
        <div className="w-full bg-white text-slate-800">
            {/* ============ HEADER (hanya di halaman 1 saat jadi PDF) ============ */}
            {comfortable ? (
                <header data-pdf="header" className="bg-[#1f3d56] text-white px-10 pt-6 pb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.25em] text-secondary">
                                Laporan Perkembangan
                            </p>
                            <h1 className="mt-2 text-5xl font-bold">Rapor Bulanan</h1>
                            <p className="mt-2 text-lg text-sky-100">Periode : {months_display}</p>
                        </div>
                        {logo}
                    </div>

                    <div className="mt-8 flex items-center gap-8">
                        {kidPhoto('w-32 h-32')}
                        <div className="flex-1">
                            <h2 className="text-4xl font-bold leading-tight">{kid.name}</h2>
                            {kid.nick_name && (
                                <p className="mt-1 text-lg text-sky-100">Panggilan : {kid.nick_name}</p>
                            )}
                            <div className="mt-5 flex flex-wrap gap-x-12 gap-y-3">
                                <InfoItem large label="Umur" value={ageString} />
                                <InfoItem large label="Cabang" value={branch.name} />
                                {school && <InfoItem large label="Asal Sekolah" value={school} />}
                            </div>
                        </div>
                    </div>
                </header>
            ) : (
                <header data-pdf="header" className="bg-[#1f3d56] text-white px-10 py-6">
                    <div className="flex items-center gap-6">
                        {kidPhoto('w-24 h-24')}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
                                Rapor Bulanan · {months_display}
                            </p>
                            <h2 className="mt-1 text-3xl font-bold leading-tight">{kid.name}</h2>
                            {kid.nick_name && (
                                <p className="text-base text-sky-100">Panggilan : {kid.nick_name}</p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-x-10 gap-y-2">
                                <InfoItem label="Umur" value={ageString} />
                                <InfoItem label="Cabang" value={branch.name} />
                                {school && <InfoItem label="Asal Sekolah" value={school} />}
                            </div>
                        </div>
                        {logo}
                    </div>
                </header>
            )}

            {/* aksen brand */}
            <div data-pdf="accent" className="h-2 bg-secondary" />

            {/* ============ BODY ============ */}
            <main className={`bg-slate-100 ${ui.main}`}>
                {/* Daftar sesi. Tiap kartu (data-pdf="card") tidak akan terpotong antar halaman PDF */}
                <div className={ui.list}>
                    {sortedAttendance.length > 0 ? (
                        sortedAttendance.map((item) => {
                            const classLabel = classLabelOf(item);
                            const timeLabel =
                                item.start_time && item.end_time
                                    ? `${formatTime(item.start_time)} – ${formatTime(item.end_time)}`
                                    : null;

                            return (
                                <div
                                    key={item.id}
                                    data-pdf="card"
                                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                                >
                                    {/* Header sesi + coach */}
                                    <div className={`flex items-center justify-between gap-6 bg-slate-50 border-b border-slate-200 ${ui.cardHead}`}>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={storageUrl(item.coach?.photo, COACH_FALLBACK)}
                                                alt={item.coach?.name ?? 'Coach'}
                                                width={192}
                                                height={192}
                                                className={`${ui.coachImg} shrink-0 object-cover object-top rounded-full border-2 border-slate-200`}
                                                unoptimized={true}
                                                data-fallback={COACH_FALLBACK}
                                                onError={swapToFallback}
                                            />
                                            <div>
                                                <p className="text-lg font-bold text-[#1f3d56]">
                                                    {formatDateLong(item.date)}
                                                </p>
                                                <p className="mt-0.5 text-sm text-slate-500">
                                                    {[timeLabel, classLabel].filter(Boolean).join('  ·  ')}
                                                </p>
                                                <p className="mt-1.5 flex items-baseline gap-1 text-sm text-slate-500">
                                                    Coach <span className="font-bold text-slate-800">{item.coach?.name ?? '-'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {item.overall !== null && item.overall !== undefined && (
                                            <div className="text-right shrink-0">
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                    Penilaian Keseluruhan
                                                </p>
                                                <div className="flex justify-end">
                                                    <RatingDots value={item.overall} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Penilaian per aspek */}
                                    <div className={ui.aspects}>
                                        {ASPECTS.map((aspect) => {
                                            const text = item[aspect.key];
                                            return (
                                                <section
                                                    key={aspect.key}
                                                    className={`flex rounded-lg overflow-hidden ${aspect.tint}`}
                                                >
                                                    <div className={`w-1.5 shrink-0 ${aspect.bar}`} />
                                                    <div className={`flex-1 ${ui.block}`}>
                                                        <h4 className={`${ui.title} font-bold uppercase tracking-wide ${aspect.title}`}>
                                                            {aspect.label}
                                                        </h4>
                                                        <p className={`${ui.text} text-slate-700`}>
                                                            {text ? capitalizeFirst(text) : '-'}
                                                        </p>
                                                    </div>
                                                </section>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div
                            data-pdf="card"
                            className="bg-white rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center"
                        >
                            <p className="text-slate-500 italic">Belum ada data kehadiran pada periode ini.</p>
                        </div>
                    )}

                    {/* Blok penutup. Di PDF hanya ikut kalau muat di sisa halaman terakhir (data-pdf="summary") */}
                    {/* {sortedAttendance.length > 0 && (
                        <div
                            data-pdf="summary"
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 bg-slate-50 border-b border-slate-200 px-5 py-3">
                                <div className="w-1.5 h-5 rounded-full bg-secondary" />
                                <h3 className="text-base font-bold text-[#1f3d56]">Ringkasan Bulan Ini</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4">
                                <div className="rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Total Kehadiran
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-[#1f3d56]">
                                        {sortedAttendance.length}
                                        <span className="ml-1.5 text-sm font-medium text-slate-500">sesi</span>
                                    </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Rata-rata Penilaian
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-[#1f3d56]">
                                        {averageText}
                                        {average !== null && (
                                            <span className="ml-1.5 text-sm font-medium text-slate-500">/ 5</span>
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Kelas Diikuti
                                    </p>
                                    <div className="mt-1.5 space-y-0.5">
                                        {classLabels.map((label) => (
                                            <p key={label} className="text-sm font-semibold text-[#1f3d56]">
                                                {label}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="px-5 pb-4 text-sm text-slate-500">
                                Terima kasih telah mempercayakan perkembangan {firstName} kepada Playpro Academy.
                            </p>
                        </div>
                    )} */}
                </div>
            </main>

            {/* ============ FOOTER (nomor halaman digambar saat ekspor PDF) ============ */}
            <footer data-pdf="footer" className="flex items-center justify-between bg-[#1f3d56] px-10 py-4 text-xs text-sky-100">
                <span>Rapor Bulanan · {kid.name} · {months_display}</span>
            </footer>
        </div>
    );
}