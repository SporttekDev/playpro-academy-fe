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

    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(true)

    const startCamera = useCallback(async () => {
        try {
            setCameraError(null)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }, // "user" = kamera depan (selfie)
                audio: false,
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
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
            streamRef.current?.getTracks().forEach((track) => track.stop())
        }
    }, [startCamera, requestLocation])

    function handleCapturePhoto() {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    setPhotoBlob(blob)
                    setPhotoDataUrl(canvas.toDataURL("image/jpeg"))
                }
            },
            "image/jpeg",
            0.85
        )
    }

    function handleRetake() {
        setPhotoDataUrl(null)
        setPhotoBlob(null)
    }

    function handleSubmit() {
        if (!photoBlob || !location) return
        onCapture({ photoBlob, latitude: location.lat, longitude: location.lng })
    }

    const canSubmit = Boolean(photoBlob && location) && !isSubmitting

    return (
        <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900">
                {photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoDataUrl} alt="Captured" className="h-full w-full object-cover" />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />

                {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 p-6 text-center text-sm text-white">
                        {cameraError}
                    </div>
                )}

                {photoDataUrl && location && !locationError && (
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

            {photoDataUrl ? (
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
                <Button className="w-full rounded-2xl" onClick={handleCapturePhoto} disabled={!!cameraError}>
                    <Camera className="mr-2 h-4 w-4" />
                    Ambil Foto
                </Button>
            )}
        </div>
    )
}