// components/coach/camera-geo-capture.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, RotateCcw, Loader2 } from "lucide-react"

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
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
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
                console.log("Detected location:", position.coords.latitude, position.coords.longitude, "accuracy:", position.coords.accuracy, "meters")
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                setIsLocating(false)
            },
            (err) => {
                console.error("Geolocation error:", err)
                setLocationError("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.")
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
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                {isLocating ? (
                    <span className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Mendapatkan lokasi...
                    </span>
                ) : locationError ? (
                    <span className="text-red-600">{locationError}</span>
                ) : location ? (
                    <span className="text-slate-700">
                        Lokasi terdeteksi ({location.lat.toFixed(5)}, {location.lng.toFixed(5)})
                    </span>
                ) : null}
            </div>

            {photoDataUrl ? (
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleRetake} disabled={isSubmitting}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Ambil Ulang
                    </Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={!canSubmit}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {actionLabel}
                    </Button>
                </div>
            ) : (
                <Button className="w-full" onClick={handleCapturePhoto} disabled={!!cameraError}>
                    <Camera className="mr-2 h-4 w-4" />
                    Ambil Foto
                </Button>
            )}
        </div>
    )
}