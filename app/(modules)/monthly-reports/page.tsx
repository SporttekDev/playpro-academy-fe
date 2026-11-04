'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Cookies from 'js-cookie';
import { IconFileExport, IconFileZip } from '@tabler/icons-react';
import { ReportPDF } from '@/components/ui/report-pdf';
import jsPDF from "jspdf";
import html2canvas from 'html2canvas-pro';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { flushSync } from 'react-dom';
import JSZip from 'jszip'; // IconFileZip ditambahkan


export interface ReportResponse {
    play_kid: PlayKid;
    branch: Branch;
    classes: ClassWithCategory[];
    attendance_reports: AttendanceReport[];
    attendance_count: number;
    month_year: string;
    month_display: string;
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

interface BranchOption {
    id: string;
    name: string;
}

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();

const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

// Memuat ulang semua <img> di dalam element (cache-bust + CORS) dan menunggu sampai selesai.
// Kalau foto gagal dimuat dan <img> punya data-fallback, ganti ke gambar bawaan lalu tunggu sampai termuat.
async function waitForImages(root: HTMLElement) {
    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
        images.map(
            (img) =>
                new Promise<void>((resolve) => {
                    const done = () => resolve();
                    const fallback = img.dataset.fallback;
                    let retried = false;

                    img.loading = 'eager'; // next/image default-nya lazy
                    img.crossOrigin = 'anonymous';
                    img.onload = done;
                    img.onerror = () => {
                        if (fallback && !retried) {
                            retried = true;
                            img.dataset.fallbackUsed = '1';
                            img.removeAttribute('srcset');
                            if (!img.src.endsWith(fallback)) img.src = fallback;
                            return; // tunggu onload fallback; kalau fallback juga gagal, error kedua memanggil done()
                        }
                        done(); // jangan sampai satu foto gagal menggantung seluruh proses
                    };
                    const url = new URL(img.src);
                    url.searchParams.set('cache_bust', Date.now().toString());
                    img.src = url.toString();
                    setTimeout(done, 15000); // timeout pengaman
                })
        )
    );
}

/* ------------------------------------------------------------------ */
/* Ekspor PDF: halaman A4, kartu sesi tidak pernah terpotong           */
/* ------------------------------------------------------------------ */

const A4_RATIO = 297 / 210; // tinggi / lebar
const MINI_HEADER_H = 56; // tinggi strip header di halaman 2 dst (css px)
const DEFAULT_CARD_GAP = 12; // dipakai kalau hanya ada 1 kartu (css px)
const BRAND_NAVY = '#1f3d56';
const SKY_100 = '#e0f2fe';

// Watermark logo besar di dasar halaman: lebar ±90% halaman, 1/3 bagian bawahnya "tenggelam" di balik footer.
// Digambar hanya di area kosong, jadi bagian atasnya terselip di balik kartu terakhir dan tidak pernah menimpa teks.
// Logo watermark memakai FILE TERSENDIRI, terpisah dari logo di header. Taruh file-nya di folder public/.
// Sementara masih memakai logo yang sama dengan header; ganti ke mis. '/images/ppa-watermark.png' kalau sudah siap.
const WATERMARK_SRC = '/images/ppa-logo-smile.png';
const WATERMARK_WIDTH_RATIO = 0.9; // lebar logo = 90% lebar halaman
const WATERMARK_CROP = 1 / 6; // bagian bawah logo yang terpotong oleh footer
const WATERMARK_MIN_FREE = 24; // sisa ruang minimum (css px) agar logo digambar
const WATERMARK_ALPHA = 0.08; // kepekatan logo. Untuk logo putih: naikkan (mis. 0.25) dan naikkan TINT_STRENGTH (mis. 0.6)
const TINT_STRENGTH = 0.15; // seberapa biru gradasi di dekat footer (0 = tanpa gradasi)
const TINT_TARGET = [125, 211, 252] as const; // warna tujuan gradasi (sky-300)

interface Block {
    top: number;
    height: number;
}

interface FreeSpaceOpts {
    W: number; // lebar canvas halaman (px canvas)
    px: (v: number) => number; // css px -> px canvas
    top: number; // bawah konten terakhir (css px)
    bottom: number; // atas footer (css px)
    pageBg: string; // warna latar halaman, "rgb(r, g, b)"
    tintEnd: string; // warna gradasi di dasar area kosong
    logo: HTMLImageElement | null;
}

// Mengisi area kosong di bawah konten: gradasi lembut (mulai dari warna latar persis, jadi tanpa garis sambungan)
// + watermark logo besar yang terpotong di dasar halaman. Digambar langsung di canvas halaman, bukan lewat CSS.
function drawFreeSpace(ctx: CanvasRenderingContext2D, o: FreeSpaceOpts) {
    const freeH = o.bottom - o.top;
    if (freeH < 8) return;

    const y0 = o.px(o.top);
    const y1 = o.px(o.bottom);

    if (TINT_STRENGTH > 0) {
        const grad = ctx.createLinearGradient(0, y0, 0, y1);
        grad.addColorStop(0, o.pageBg);
        grad.addColorStop(1, o.tintEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(0, y0, o.W, y1 - y0);
    }

    if (!o.logo || freeH < WATERMARK_MIN_FREE) return;
    const aspect = o.logo.naturalHeight / o.logo.naturalWidth;
    if (!isFinite(aspect) || aspect <= 0) return;

    const wmW = o.W * WATERMARK_WIDTH_RATIO;
    const wmH = wmW * aspect;
    const wmTop = y1 - wmH * (1 - WATERMARK_CROP); // bagian bawah logo jatuh di bawah footer

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, o.W, y1 - y0); // logo hanya terlihat di area kosong
    ctx.clip();
    ctx.globalAlpha = WATERMARK_ALPHA;
    ctx.drawImage(o.logo, (o.W - wmW) / 2, wmTop, wmW, wmH);
    ctx.restore();
}

// Muat gambar watermark sekali saja (di-cache untuk batch). Gagal dimuat -> null, watermark dilewati, ekspor tetap jalan.
let watermarkPromise: Promise<HTMLImageElement | null> | null = null;
function loadWatermark(): Promise<HTMLImageElement | null> {
    if (!watermarkPromise) {
        watermarkPromise = new Promise<HTMLImageElement | null>((resolve) => {
            try {
                // hanya satu origin (atau server dengan CORS) supaya canvas tidak "tainted"
                if (new URL(WATERMARK_SRC, window.location.href).origin !== window.location.origin) {
                    console.warn('WATERMARK_SRC beda origin, watermark dilewati');
                    resolve(null);
                    return;
                }
            } catch {
                resolve(null);
                return;
            }
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
            img.onerror = () => resolve(null);
            img.src = WATERMARK_SRC;
            setTimeout(() => resolve(null), 10000); // timeout pengaman
        }).then((img) => {
            if (!img) watermarkPromise = null; // gagal: boleh dicoba lagi pada ekspor berikutnya
            return img;
        });
    }
    return watermarkPromise;
}

interface PdfMeta {
    name: string;
    period: string;
}

// Greedy: isi halaman sampai kartu berikutnya tidak muat, lalu pindah ke halaman baru.
// Mengembalikan daftar indeks kartu per halaman. Kartu yang lebih tinggi dari halaman kosong
// tetap ditempatkan sendirian (tidak ada loop tak berujung).
function planPages(cards: Block[], firstStart: number, nextStart: number, limit: number, gap: number): number[][] {
    const pages: number[][] = [];
    let current: number[] = [];
    let used = firstStart;

    cards.forEach((card, i) => {
        const add = (current.length ? gap : 0) + card.height;
        if (current.length > 0 && used + add > limit) {
            pages.push(current);
            current = [];
            used = nextStart;
        }
        used += (current.length ? gap : 0) + card.height;
        current.push(i);
    });

    if (current.length) pages.push(current);
    return pages;
}

// Render element menjadi PDF A4 (Blob). Dipakai oleh download satuan dan download all.
async function elementToPdfBlob(element: HTMLElement, meta: PdfMeta): Promise<Blob> {
    // Ukur posisi tiap bagian SEBELUM dipotret (layout asli sama dengan layout clone html2canvas).
    const rootRect = element.getBoundingClientRect();
    const measure = (el: Element): Block => {
        const r = el.getBoundingClientRect();
        return { top: r.top - rootRect.top, height: r.height };
    };

    const accentEl = element.querySelector('[data-pdf="accent"]');
    const footerEl = element.querySelector('[data-pdf="footer"]');
    const cardEls = Array.from(element.querySelectorAll('[data-pdf="card"]'));
    const summaryEl = element.querySelector('[data-pdf="summary"]'); // opsional: blok penutup
    if (!accentEl || !footerEl || cardEls.length === 0) {
        throw new Error('Penanda data-pdf tidak ditemukan di ReportPDF');
    }

    const accent = measure(accentEl);
    const footer = measure(footerEl);
    const cards = cardEls.map(measure);
    const summary = summaryEl ? measure(summaryEl) : null;
    const fontFamily = getComputedStyle(element).fontFamily;
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
                #${element.id}, #${element.id} * {
                    box-shadow: none !important;
                    background-image: none !important;
                    filter: none !important;
                    outline: none !important;
                }
                #${element.id} { background-color: #ffffff !important; }
            `;
            clonedDoc.head.appendChild(style);
            clonedDoc
                .querySelectorAll(`#${element.id} img`)
                .forEach((img) => ((img as HTMLImageElement).crossOrigin = 'anonymous'));
        },
    });

    try {
        const src = canvas.getContext('2d');
        if (!src) throw new Error('Canvas 2D tidak tersedia');

        const s = canvas.width / rootRect.width; // css px -> px canvas
        const px = (v: number) => Math.round(v * s);
        const W = canvas.width;
        const H = Math.round(W * A4_RATIO);
        const pageH = rootRect.width * A4_RATIO; // tinggi halaman dalam css px

        const accentBottom = accent.top + accent.height;
        const lastCard = cards[cards.length - 1];
        const padTop = Math.max(0, cards[0].top - accentBottom);
        const lastBottom = summary ? summary.top + summary.height : lastCard.top + lastCard.height;
        const padBottom = Math.max(0, footer.top - lastBottom);
        const gap =
            cards.length > 1 ? Math.max(0, cards[1].top - (cards[0].top + cards[0].height)) : DEFAULT_CARD_GAP;

        const pages = planPages(
            cards,
            accentBottom + padTop, // halaman 1: header besar
            MINI_HEADER_H + accent.height + padTop, // halaman 2 dst: strip header
            pageH - footer.height - padBottom,
            gap
        );

        // Blok penutup: ikut hanya kalau muat di sisa halaman terakhir (tidak pernah membuat halaman baru)
        const lastPage = pages[pages.length - 1];
        let lastUsed = (pages.length === 1 ? accentBottom : MINI_HEADER_H + accent.height) + padTop;
        lastPage.forEach((ci, n) => {
            lastUsed += (n > 0 ? gap : 0) + cards[ci].height;
        });
        const showSummary = !!summary && lastUsed + gap + summary.height <= pageH - footer.height - padBottom;

        // Warna latar area kartu, diambil dari hasil capture supaya persis sama
        const [r, g, b] = src.getImageData(2, Math.min(canvas.height - 1, px(accentBottom) + 2), 1, 1).data;
        const pageBg = `rgb(${r}, ${g}, ${b})`;
        const mix = (c: number, target: number) => Math.round(c + (target - c) * TINT_STRENGTH);
        const tintEnd = `rgb(${mix(r, TINT_TARGET[0])}, ${mix(g, TINT_TARGET[1])}, ${mix(b, TINT_TARGET[2])})`;

        // Logo watermark: file tersendiri (WATERMARK_SRC), bukan logo di header
        const logo = await loadWatermark();

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

        pages.forEach((cardIndexes, pageIdx) => {
            const page = document.createElement('canvas');
            page.width = W;
            page.height = H;
            const ctx = page.getContext('2d');
            if (!ctx) throw new Error('Canvas 2D tidak tersedia');

            ctx.fillStyle = pageBg;
            ctx.fillRect(0, 0, W, H);

            // salin potongan [srcTop, srcTop+srcH) dari hasil capture ke posisi destTop di halaman (css px)
            const slice = (srcTop: number, srcH: number, destTop: number) =>
                ctx.drawImage(canvas, 0, px(srcTop), W, px(srcH), 0, px(destTop), W, px(srcH));

            let y: number;
            if (pageIdx === 0) {
                slice(0, accentBottom, 0); // header besar + garis aksen
                y = accentBottom + padTop;
            } else {
                ctx.fillStyle = BRAND_NAVY;
                ctx.fillRect(0, 0, W, px(MINI_HEADER_H));
                ctx.textBaseline = 'middle';

                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.font = `700 ${px(20)}px ${fontFamily}`;
                ctx.fillText(meta.name, px(40), px(MINI_HEADER_H / 2));

                ctx.fillStyle = SKY_100;
                ctx.textAlign = 'right';
                ctx.font = `400 ${px(13)}px ${fontFamily}`;
                ctx.fillText(`Rapor Bulanan · ${meta.period}`, W - px(40), px(MINI_HEADER_H / 2));

                slice(accent.top, accent.height, MINI_HEADER_H); // garis aksen
                y = MINI_HEADER_H + accent.height + padTop;
            }

            cardIndexes.forEach((ci) => {
                const card = cards[ci];
                slice(card.top, card.height, y);
                y += card.height + gap;
            });
            let contentBottom = y - gap; // bawah konten terakhir di halaman ini (css px)

            if (summary && showSummary && pageIdx === pages.length - 1) {
                slice(summary.top, summary.height, y); // y sudah = bawah kartu terakhir + gap
                contentBottom = y + summary.height;
            }

            // isi area kosong: gradasi + watermark, lalu footer di dasar halaman + nomor halaman
            const footerY = pageH - footer.height;
            drawFreeSpace(ctx, { W, px, top: contentBottom, bottom: footerY, pageBg, tintEnd, logo });
            slice(footer.top, footer.height, footerY);
            ctx.fillStyle = SKY_100;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.font = `400 ${px(12)}px ${fontFamily}`;
            ctx.fillText(`Halaman ${pageIdx + 1}/${pages.length}`, W - px(40), px(footerY + footer.height / 2));

            if (pageIdx > 0) pdf.addPage();
            pdf.addImage(page.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);

            // bebaskan memori canvas halaman
            page.width = 0;
            page.height = 0;
        });

        return pdf.output('blob');
    } finally {
        // bebaskan memori canvas, penting untuk batch besar
        canvas.width = 0;
        canvas.height = 0;
    }
}

function saveBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function RaportPage() {

    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [reportPdf, setReportPdf] = useState<ReportResponse | null>(null);
    const [exporting, setExporting] = useState(false);
    const [branches, setBranches] = useState<BranchOption[]>([]);

    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedBranch, setSelectedBranch] = useState<string>('all');

    const [batchReport, setBatchReport] = useState<ReportResponse | null>(null);
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
    const batchRef = useRef<HTMLDivElement | null>(null);
    const cancelRef = useRef(false);

    const reportRef = useRef<HTMLDivElement | null>(null);

    // Anak tanpa kehadiran tetap tampil di tabel, tapi tidak ikut "Download Semua"
    const exportable = useMemo(() => reports.filter((r) => (r.attendance_count ?? 0) > 0), [reports]);

    const fetchBranches = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/branch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) return;
            const result = await response.json();
            setBranches(result.data ?? result);
        } catch (error) {
            console.error('Fetch branches error:', error);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);
            if (selectedBranch && selectedBranch !== 'all') params.append('branch_id', selectedBranch);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/playkid-reports?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error(error);
                throw new Error('Failed to fetch reports');
            }

            const { data } = await response.json();
            console.log('Fetched reports:', data);
            setReports(data);
        } catch (error) {
            console.error('Fetch reports error:', error);
            toast.error('Failed to fetch report data');
        }
    }, [selectedMonth, selectedYear, selectedBranch]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownloadPdf = useCallback(async () => {
        const element = reportRef.current;
        if (!element || !reportPdf) {
            toast.error('Tidak ada laporan untuk di-download');
            return;
        }

        try {
            setExporting(true);
            toast('Mempersiapkan PDF...', { duration: 2000 });

            await waitForImages(element);
            const blob = await elementToPdfBlob(element, {
                name: reportPdf.play_kid.name,
                period: reportPdf.months_display || reportPdf.month_display,
            });
            saveBlob(blob, `${sanitizeFileName(reportPdf.play_kid.name)} - ${reportPdf.month_display}.pdf`);

            toast.success('PDF berhasil di-download');
        } catch (err) {
            console.error('Export PDF error:', err);
            toast.error('Gagal mengekspor PDF. Lihat console untuk detail.');
        } finally {
            setExporting(false);
        }
    }, [reportPdf]);

    const handleDownloadAll = useCallback(async () => {
        if (exportable.length === 0) {
            toast.error('Tidak ada laporan dengan kehadiran untuk di-download');
            return;
        }

        cancelRef.current = false;
        const skipped = reports.length - exportable.length;
        const total = exportable.length;
        setBatchProgress({ current: 0, total });

        const zip = new JSZip();
        const usedNames = new Map<string, number>();
        let failed = 0;

        try {
            for (let i = 0; i < total; i++) {
                if (cancelRef.current) break;

                const report = exportable[i];

                // render laporan ini ke container tersembunyi, lalu tunggu DOM siap
                flushSync(() => setBatchReport(report));
                const element = batchRef.current;

                try {
                    if (!element) throw new Error('Container tidak ditemukan');
                    await waitForImages(element);
                    await nextFrame();
                    const blob = await elementToPdfBlob(element, {
                        name: report.play_kid.name,
                        period: report.months_display || report.month_display,
                    });

                    // nama file: "Nama - Bulan Tahun.pdf", beri suffix bila kembar
                    const base = sanitizeFileName(`${report.play_kid.name} - ${report.month_display}`);
                    const count = (usedNames.get(base) ?? 0) + 1;
                    usedNames.set(base, count);
                    zip.file(count > 1 ? `${base} (${count}).pdf` : `${base}.pdf`, blob);
                } catch (err) {
                    failed++;
                    console.error(`Gagal membuat PDF untuk ${report.play_kid.name}:`, err);
                }

                setBatchProgress({ current: i + 1, total });
            }

            if (cancelRef.current) {
                toast.info('Download dibatalkan');
                return;
            }

            if (failed === total) {
                toast.error('Semua laporan gagal dibuat');
                return;
            }

            // PDF sudah terkompres, jadi STORE (tanpa kompresi ulang) lebih cepat
            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

            const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;
            const branchLabel =
                selectedBranch === 'all'
                    ? 'Semua Branch'
                    : branches.find((b) => String(b.id) === selectedBranch)?.name ?? selectedBranch;

            saveBlob(zipBlob, sanitizeFileName(`Laporan ${monthLabel} ${selectedYear} - ${branchLabel}`) + '.zip');

            const skippedNote = skipped > 0 ? ` (${skipped} tanpa kehadiran dilewati)` : '';
            if (failed > 0) {
                toast.warning(`${total - failed} laporan berhasil, ${failed} gagal${skippedNote}`);
            } else {
                toast.success(`${total} laporan berhasil di-download${skippedNote}`);
            }
        } catch (err) {
            console.error('Download all error:', err);
            toast.error('Gagal membuat ZIP');
        } finally {
            setBatchReport(null);
            setBatchProgress(null);
        }
    }, [exportable, reports.length, branches, selectedMonth, selectedYear, selectedBranch]);

    const columns: ColumnDef<ReportResponse>[] = [
        {
            id: 'play_kid',
            header: 'Play Kid',
            accessorFn: (row) => row.play_kid?.name ?? row.play_kid?.nick_name ?? `#${row.play_kid?.id}`,
            cell: ({ row }) => {
                const pk = row.original.play_kid;
                return pk ? (pk.name || pk.nick_name || `#${pk.id}`) : '-';
            },
        },
        {
            id: 'branch',
            header: 'Branch',
            accessorFn: (row) => row.branch?.name ?? 'N/A',
            cell: ({ row }) => row.original.branch?.name ?? '-',
        },
        {
            id: 'month',
            header: 'Bulan',
            accessorFn: (row) => row.month_display,
            cell: ({ row }) => (
                <span className="font-medium">{row.original.month_display}</span>
            ),
        },
        {
            id: 'classes',
            header: 'Classes',
            accessorFn: (row) => row.classes?.map(cls => cls.name).join(', ') ?? 'N/A',
            cell: ({ row }) => {
                const classes = row.original.classes;
                if (!classes || classes.length === 0) return '-';
                return (
                    <div className="max-w-xs">
                        {classes.map((cls) => (
                            <div key={cls.id} className="text-sm">{cls.name}</div>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'attendance_count',
            header: 'Total Attendance',
            accessorFn: (row) => row.attendance_count ?? 0,
            cell: ({ row }) => (
                <span className="font-medium">{row.original.attendance_count ?? 0}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const report = row.original;
                return (
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setReportPdf(report)}
                                >
                                    <IconFileExport />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export Report</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="px-6 space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Filter Bar */}
                <div className="flex flex-wrap gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((y) => (
                                <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Pilih Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Branch</SelectItem>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    {batchProgress && (
                        <Button variant="outline" onClick={() => (cancelRef.current = true)}>
                            Batal
                        </Button>
                    )}
                    <Button onClick={handleDownloadAll} disabled={!!batchProgress || exportable.length === 0}>
                        <IconFileZip size={16} />
                        <span className="ml-2">
                            {batchProgress
                                ? `Mengekspor ${batchProgress.current}/${batchProgress.total}...`
                                : `Download Semua (${exportable.length})`}
                        </span>
                    </Button>
                </div>
            </div>

            <DataTable columns={columns} data={reports} />

            {reportPdf && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-60 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-7xl max-h-[75vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Preview Laporan - {reportPdf.play_kid.name} - {reportPdf.branch.name} - {reportPdf.month_display}
                            </h2>
                            <button
                                onClick={() => setReportPdf(null)}
                                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                            <div className="w-full h-full flex justify-center">
                                <div className="w-full max-w-5xl" ref={reportRef} id="report-to-export">
                                    <ReportPDF report={reportPdf} />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-white dark:bg-gray-900 rounded-b-2xl space-x-2">
                            <Button onClick={() => setReportPdf(null)} variant="destructive">
                                Tutup
                            </Button>
                            <Button onClick={handleDownloadPdf} disabled={exporting} variant="default">
                                {exporting ? 'Mengekspor...' : 'Download PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {batchReport && (
                <div
                    aria-hidden
                    style={{ position: 'fixed', top: 0, left: 0, width: 1024, zIndex: -1, pointerEvents: 'none' }}
                >
                    <div ref={batchRef} id="batch-report-to-export" style={{ width: 1024, background: '#fff' }}>
                        <ReportPDF report={batchReport} />
                    </div>
                </div>
            )}
        </div>
    );
}