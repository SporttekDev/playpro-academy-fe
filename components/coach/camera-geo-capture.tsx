// components/coach/camera-geo-capture.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CheckCircle2, MapPin, RotateCcw, Loader2 } from "lucide-react"

type CaptureResult = {
    photoBlob: Blob
    latitude: number
    longitude: number
}

/**
 * Mirroring kamera depan. Perilaku bawaan tiap browser/perangkat berbeda, jadi arahnya
 * dikendalikan eksplisit di sini (sama di semua perangkat).
 *
 * FLIP_PREVIEW: true  -> preview dibalik kiri-kanan (kompensasi bila stream dari perangkat ter-mirror)
 * FLIP_PHOTO  : true  -> hasil foto dibalik kiri-kanan (kompensasi bila foto hasil ter-mirror)
 *
 * Default false/false = tampilan & foto apa adanya dari kamera. Kalau teks yang dipegang
 * di depan kamera terlihat terbalik, set true pada bagian yang terbalik.
 */
const FLIP_PREVIEW = false
const FLIP_PHOTO = false

export function CameraGeoCapture({
    onCapture,
    isSubmitting,
    actionLabel,
}: {
    onCapture: (result: CaptureResult) => void
    isSubmitting: boolean
    actionLabel: string
}) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const startIdRef = useRef(0)

    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [cameraReady, setCameraReady] = useState(false)
    const [isLocating, setIsLocating] = useState(true)

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (videoRef.current) videoRef.current.srcObject = null
        setCameraReady(false)
    }, [])

    const startCamera = useCallback(async () => {
        // Setiap pemanggilan punya id; hasil pemanggilan lama (mis. React StrictMode
        // atau klik ganda) dibuang supaya tidak menimpa stream yang baru.
        const myId = ++startIdRef.current

        try {
            setCameraError(null)
            setCameraReady(false)

            // Matikan stream lama dulu — iOS sering gagal/hitam kalau ada 2 stream kamera aktif.
            streamRef.current?.getTracks().forEach((track) => track.stop())
            streamRef.current = null

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            })

            if (myId !== startIdRef.current) {
                stream.getTracks().forEach((track) => track.stop())
                return
            }

            streamRef.current = stream

            // Kalau iOS mematikan kamera (app di-background, layar kunci), pulihkan otomatis.
            stream.getVideoTracks().forEach((track) => {
                track.onended = () => {
                    if (myId === startIdRef.current) setCameraReady(false)
                }
            })

            const video = videoRef.current
            if (!video) return

            video.muted = true
            video.setAttribute("playsinline", "true")
            video.srcObject = stream

            try {
                await video.play()
            } catch (playErr) {
                // AbortError normal bila srcObject diganti saat play() berjalan.
                if ((playErr as DOMException)?.name !== "AbortError") throw playErr
            }

            if (myId === startIdRef.current) setCameraReady(true)
        } catch (err) {
            if (myId !== startIdRef.current) return
            console.error("Camera error:", err)
            setCameraError("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.")
        }
    }, [])

    const requestLocation = useCallback(() => {
        setIsLocating(true)
        setLocationError(null)

        if (!navigator.geolocation) {
            setLocationError("Perangkat tidak mendukung GPS.")
            setIsLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                })
                setIsLocating(false)
            },
            (err: GeolocationPositionError) => {
                console.error("Geolocation error:", err.code, err.message)

                let message = "Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan."
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        message = "Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser."
                        break
                    case err.POSITION_UNAVAILABLE:
                        message = "Lokasi tidak dapat dideteksi. Pastikan GPS/layanan lokasi perangkat aktif."
                        break
                    case err.TIMEOUT:
                        message = "Waktu mendapatkan lokasi habis. Coba lagi."
                        break
                }

                setLocationError(message)
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 15000 }
        )
    }, [])

    useEffect(() => {
        startCamera()
        requestLocation()

        return () => {
            startIdRef.current++ // batalkan start yang masih menggantung
            stopCamera()
        }
    }, [startCamera, requestLocation, stopCamera])

    // Kembali dari background / tab lain: kalau stream sudah mati, nyalakan lagi.
    useEffect(() => {
        function handleVisibility() {
            if (document.visibilityState !== "visible") return
            const live = streamRef.current?.getVideoTracks().some((t) => t.readyState === "live")
            if (!live) startCamera()
            else videoRef.current?.play().catch(() => {})
        }
        document.addEventListener("visibilitychange", handleVisibility)
        return () => document.removeEventListener("visibilitychange", handleVisibility)
    }, [startCamera])

    // Bersihkan object URL foto saat diganti / unmount.
    useEffect(() => {
        return () => {
            if (photoUrl) URL.revokeObjectURL(photoUrl)
        }
    }, [photoUrl])

    function handleCapturePhoto() {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        // Frame belum siap (layar hitam) -> jangan ambil foto kosong.
        if (video.readyState < 2 || video.videoWidth === 0) {
            setCameraReady(false)
            startCamera()
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        if (FLIP_PHOTO) {
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
            (blob) => {
                if (!blob) return
                setPhotoBlob(blob)
                setPhotoUrl(URL.createObjectURL(blob))
            },
            "image/jpeg",
            0.85
        )
    }

    function handleRetake() {
        setPhotoUrl(null)
        setPhotoBlob(null)

        // Elemen <video> tidak pernah di-unmount, jadi cukup pastikan stream masih hidup.
        const live = streamRef.current?.getVideoTracks().some((t) => t.readyState === "live")
        if (!live) {
            startCamera()
        } else {
            videoRef.current?.play().catch(() => {})
        }
    }

    function handleSubmit() {
        if (!photoBlob || !location) return
        onCapture({ photoBlob, latitude: location.lat, longitude: location.lng })
    }

    const canSubmit = Boolean(photoBlob && location) && !isSubmitting
    const showPhoto = Boolean(photoUrl)

    return (
        <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900">
                {/* Video SELALU ter-mount (hanya ditutup foto) supaya tidak blank setelah "Ambil Ulang". */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                    style={{ transform: FLIP_PREVIEW ? "scaleX(-1)" : "none" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {showPhoto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={photoUrl!}
                        alt="Captured"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                {!cameraReady && !cameraError && !showPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyalakan kamera...
                    </div>
                )}

                {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/90 p-6 text-center text-sm text-white">
                        <p>{cameraError}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-slate-900"
                            onClick={startCamera}
                        >
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {showPhoto && location && !locationError && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Lokasi tersimpan
                    </div>
                )}
            </div>

            {/* Status lokasi */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        locationError
                            ? "bg-rose-100"
                            : location
                              ? "bg-emerald-100"
                              : "bg-primary/10"
                    }`}
                >
                    <MapPin
                        className={`h-4 w-4 ${
                            locationError ? "text-rose-600" : location ? "text-emerald-600" : "text-primary"
                        }`}
                    />
                </div>

                <div className="min-w-0">
                    {isLocating ? (
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Mendapatkan lokasi kamu...
                        </span>
                    ) : locationError ? (
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-rose-600">Lokasi tidak tersedia</p>
                                <p className="text-xs text-rose-500">{locationError}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={requestLocation}
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    ) : location ? (
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Lokasi terdeteksi</p>
                            <p className="text-xs text-slate-500">Akurasi ±{Math.round(location.accuracy)}m</p>
                        </div>
                    ) : null}
                </div>
            </div>

            {showPhoto ? (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-2xl"
                        onClick={handleRetake}
                        disabled={isSubmitting}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Ambil Ulang
                    </Button>
                    <Button className="flex-1 rounded-2xl" onClick={handleSubmit} disabled={!canSubmit}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {actionLabel}
                    </Button>
                </div>
            ) : (
                <Button
                    className="w-full rounded-2xl"
                    onClick={handleCapturePhoto}
                    disabled={!!cameraError || !cameraReady}
                >
                    <Camera className="mr-2 h-4 w-4" />
                    Ambil Foto
                </Button>
            )}
        </div>
    )
}