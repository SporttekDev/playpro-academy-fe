"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Input jam 24-jam (HH:mm) yang bisa DIKETIK di semua perangkat.
 *
 * Kenapa bukan <input type="time">: di sebagian perangkat (iOS Safari, beberapa Android)
 * input bawaan itu membuka picker roda dan tidak bisa diketik. Komponen ini memakai
 * input teks dengan keypad angka, titik dua otomatis, dan validasi jam/menit.
 *
 * value    : "HH:mm" atau "" (sama seperti nilai <input type="time">, jadi format ke API tidak berubah)
 * onChange : dipanggil dengan "HH:mm" saat sudah lengkap & valid, atau "" selama belum lengkap.
 */

type Parts = { h: string; m: string }

function sanitize(raw: string): Parts {
    const digits = raw.replace(/\D/g, "").slice(0, 4)
    let h = ""
    let m = ""

    for (const ch of digits) {
        if (h.length < 2) {
            if (h.length === 0 && ch > "2") {
                h = "0" + ch // "9" -> "09"
                continue
            }
            if (h === "2" && ch > "3") continue // jam maksimal 23
            h += ch
        } else if (m.length < 2) {
            if (m.length === 0 && ch > "5") continue // menit maksimal 59
            m += ch
        }
    }

    return { h, m }
}

function display({ h, m }: Parts, shrinking: boolean): string {
    if (h.length < 2) return h
    if (m.length > 0) return `${h}:${m}`
    // Saat menghapus dari "HH:", hapus satu angka (bukan menempelkan ":" lagi).
    return shrinking ? h.slice(0, 1) : `${h}:`
}

function toValue({ h, m }: Parts): string {
    return h.length === 2 && m.length === 2 ? `${h}:${m}` : ""
}

function parseValue(value: string): Parts {
    const match = /^(\d{2}):(\d{2})/.exec(value ?? "")
    return match ? { h: match[1], m: match[2] } : { h: "", m: "" }
}

export interface TimeInputProps
    extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
    value: string
    onChange: (value: string) => void
}

export function TimeInput({ value, onChange, onBlur, className, ...props }: TimeInputProps) {
    const [text, setText] = React.useState(() => {
        const p = parseValue(value)
        return p.h ? `${p.h}:${p.m}` : ""
    })

    // Sinkronkan bila nilai dari luar berubah (buka dialog edit, reset form).
    React.useEffect(() => {
        const current = toValue(sanitize(text))
        if (value !== current) {
            const p = parseValue(value)
            setText(p.h ? `${p.h}:${p.m}` : "")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value
        const parts = sanitize(raw)
        setText(display(parts, raw.length < text.length))
        onChange(toValue(parts))
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        // Lengkapi ketikan yang belum penuh: "9" -> 09:00, "930" -> 09:30, "12:3" -> 12:30.
        let { h, m } = sanitize(text)
        if (h.length === 1) h = "0" + h
        if (h.length === 2) {
            if (m.length === 0) m = "00"
            if (m.length === 1) m = m + "0"
            setText(`${h}:${m}`)
            onChange(`${h}:${m}`)
        }
        onBlur?.(e)
    }

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={props.placeholder ?? "HH:mm"}
            maxLength={5}
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn("tabular-nums", className)}
        />
    )
}