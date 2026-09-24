"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, Clock, Loader2, MapPin } from "lucide-react"
import { CameraGeoCapture } from "@/components/coach/camera-geo-capture"
import { AttendanceStepper } from "@/components/coach/attendance-stepper"

type ScheduleInfo = {
    class_name: string
    venue_name: string
    date: string
    start_time: string
    end_time: string
}

type AttendanceStatus = {
    id: number
    schedule_id: number
    check_in_at: string | null
    check_in_photo: string | null
    check_out_at: string | null
    check_out_photo: string | null
    // Opsional — isi kalau endpoint attendance-status sudah di-extend untuk include info jadwal.
    schedule?: ScheduleInfo | null
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(startIso: string, endIso: string) {
    const minutes = Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) return `${mins} menit`
    if (mins === 0) return `${hours} jam`
    return `${hours} jam ${mins} menit`
}

export default function AttendanceCheckinPage() {
    const { scheduleId } = useParams()
    const router = useRouter()

    const [status, setStatus] = useState<AttendanceStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadError, setLoadError] = useState(false)

    const fetchStatus = useCallback(async () => {
        try {
            setIsLoading(true)
            setLoadError(false)
            const token = Cookies.get("token")
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/coach/schedule/${scheduleId}/attendance-status`,
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            )
            if (!res.ok) throw new Error("Failed to load status")
            const { data } = await res.json()
            setStatus(data)
        } catch (err) {
            console.error(err)
            setLoadError(true)
            toast.error("Gagal memuat status absensi")
        } finally {
            setIsLoading(false)
        }
    }, [scheduleId])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    async function handleCapture(
        mode: "check-in" | "check-out",
        result: { photoBlob: Blob; latitude: number; longitude: number }
    ) {
        try {
            setIsSubmitting(true)
            const token = Cookies.get("token")
            const formData = new FormData()
            formData.append("photo", result.photoBlob, "attendance.jpg")
            formData.append("latitude", String(result.latitude))
            formData.append("longitude", String(result.longitude))

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/coach/schedule/${scheduleId}/${mode}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    body: formData,
                }
            )

            const json = await res.json()

            if (!res.ok) {
                if (json?.data?.distance_meters) {
                    toast.error(
                        `Kamu terlalu jauh dari venue (${json.data.distance_meters}m, maksimal ${json.data.max_radius_meters}m).`
                    )
                } else {
                    toast.error(json?.message ?? "Gagal mengirim absensi")
                }
                return
            }

            toast.success(mode === "check-in" ? "Check-in berhasil!" : "Check-out berhasil!")
            await fetchStatus()
        } catch (err) {
            console.error(err)
            toast.error("Terjadi kesalahan saat mengirim absensi")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memuat status absensi...
                </div>
            </div>
        )
    }

    if (loadError || !status) {
        return (
            <div className="mx-auto max-w-md px-4 py-8">
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                    Data absensi tidak ditemukan. Coba kembali ke dashboard dan buka ulang halaman ini.
                </div>
                <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
            </div>
        )
    }

    const hasCheckedIn = Boolean(status.check_in_at)
    const hasCheckedOut = Boolean(status.check_out_at)
    const schedule = status.schedule

    return (
        <div className="mx-auto max-w-md space-y-5 px-4 py-6">
            {/* Top bar */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-slate-900">Absensi Kelas</h1>
            </div>

            {/* Info sesi */}
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-primary via-primary/95 to-cyan-500 text-white shadow-[0_20px_60px_rgba(59,130,246,0.18)]">
                <CardContent className="space-y-3 p-5">
                    <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white">
                        Jadwal Hari Ini
                    </Badge>

                    <h2 className="text-xl font-extrabold tracking-tight">
                        {schedule?.class_name ?? `Schedule #${status.schedule_id}`}
                    </h2>

                    {schedule && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {schedule.venue_name}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Step indicator */}
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                    <AttendanceStepper hasCheckedIn={hasCheckedIn} hasCheckedOut={hasCheckedOut} />
                </CardContent>
            </Card>

            {/* Konten utama sesuai state */}
            {hasCheckedOut ? (
                <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>

                        <div>
                            <p className="text-lg font-bold text-emerald-800">Absensi selesai</p>
                            <p className="mt-1 text-sm text-emerald-700">
                                Durasi mengajar: {formatDuration(status.check_in_at!, status.check_out_at!)}
                            </p>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-white p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                    Check-in
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {formatTime(status.check_in_at!)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                    Check-out
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {formatTime(status.check_out_at!)}
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full rounded-2xl" asChild>
                            <Link href="/dashboard">Kembali ke Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : hasCheckedIn ? (
                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Check-out</CardTitle>
                        <p className="text-sm text-slate-500">
                            Kamu check-in pukul{" "}
                            <span className="font-semibold text-slate-700">
                                {formatTime(status.check_in_at!)}
                            </span>
                            . Ambil foto untuk menyelesaikan sesi.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CameraGeoCapture
                            actionLabel="Check-out Sekarang"
                            isSubmitting={isSubmitting}
                            onCapture={(result) => handleCapture("check-out", result)}
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Check-in</CardTitle>
                        <p className="text-sm text-slate-500">
                            Ambil foto & pastikan lokasi kamu berada di venue.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CameraGeoCapture
                            actionLabel="Check-in Sekarang"
                            isSubmitting={isSubmitting}
                            onCapture={(result) => handleCapture("check-in", result)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}