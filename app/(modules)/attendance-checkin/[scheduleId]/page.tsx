"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { CameraGeoCapture } from "@/components/coach/camera-geo-capture"

type AttendanceStatus = {
    id: number
    schedule_id: number
    check_in_at: string | null
    check_in_photo: string | null
    check_out_at: string | null
    check_out_photo: string | null
}

export default function AttendanceCheckinPage() {
    const { scheduleId } = useParams()
    const router = useRouter()

    const [status, setStatus] = useState<AttendanceStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchStatus = useCallback(async () => {
        try {
            setIsLoading(true)
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
        return <p className="px-6 py-8">Loading...</p>
    }

    if (!status) {
        return <p className="px-6 py-8">Data tidak ditemukan</p>
    }

    const hasCheckedIn = Boolean(status.check_in_at)
    const hasCheckedOut = Boolean(status.check_out_at)

    return (
        <div className="mx-auto max-w-md px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Absensi Kelas</h1>
            </div>

            {hasCheckedOut ? (
                <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
                    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        <p className="font-semibold text-emerald-800">Absensi selesai</p>
                        <p className="text-sm text-emerald-700">
                            Check-in: {new Date(status.check_in_at!).toLocaleTimeString("id-ID")}
                            <br />
                            Check-out: {new Date(status.check_out_at!).toLocaleTimeString("id-ID")}
                        </p>
                    </CardContent>
                </Card>
            ) : hasCheckedIn ? (
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Check-out</CardTitle>
                        <p className="text-sm text-slate-500">
                            Kamu sudah check-in pukul{" "}
                            {new Date(status.check_in_at!).toLocaleTimeString("id-ID")}. Ambil foto untuk
                            check-out.
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
                <Card className="rounded-3xl">
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