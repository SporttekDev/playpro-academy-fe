"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconAlertCircle,
  IconCamera,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react"
import Cookies from "js-cookie"
import Image from "next/image"

interface CoachProfile {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  role: string
  coach: {
    id: number
    birth_date: string | null
    description: string | null
    photo: string | null 
  } | null
}

interface FormState {
  name: string
  phone: string
  address: string
  birth_date: string
  description: string
  password: string
  password_confirmation: string
}

type FormErrors = Partial<Record<keyof FormState | "general", string>>

const API = process.env.NEXT_PUBLIC_API_URL

function getToken() {
  return Cookies.get("token") ?? ""
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/json",
  }
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    address: "",
    birth_date: "",
    description: "",
    password: "",
    password_confirmation: "",
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile]       = useState<File | null>(null)
  const [removePhoto, setRemovePhoto]   = useState(false)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [errors, setErrors]             = useState<FormErrors>({})
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { headers: authHeaders() })
        if (!res.ok) throw new Error("Unauthorized")
        const json = await res.json()
        // shape: { status, message, data }
        const data: CoachProfile = json.data

        setProfile(data)
        setForm({
          name:                  data.name            ?? "",
          phone:                 data.phone           ?? "",
          address:               data.address         ?? "",
          birth_date:            data.coach?.birth_date  ?? "",
          description:           data.coach?.description ?? "",
          password:              "",
          password_confirmation: "",
        })
        if (data.coach?.photo) setPhotoPreview(data.coach.photo)
      } catch (e) {
        console.error(e)
        setErrors({ general: "Gagal memuat profil. Silakan refresh halaman." })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: undefined }))
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, general: "Foto harus lebih kecil dari 2 MB." }))
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setRemovePhoto(false)
    setErrors((p) => ({ ...p, general: undefined }))
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setRemovePhoto(true)
    if (fileRef.current) fileRef.current.value = ""
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.name.trim())
      errs.name = "Nama lengkap wajib diisi."
    if (form.password && form.password.length < 6)
      errs.password = "Password minimal 6 karakter."
    if (form.password && form.password !== form.password_confirmation)
      errs.password_confirmation = "Konfirmasi password tidak cocok."
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const parseLaravelErrors = (errObj: Record<string, string[]>): FormErrors => {
    const out: FormErrors = {}
    for (const [key, msgs] of Object.entries(errObj)) {
      out[key as keyof FormState] = msgs[0]
    }
    return out
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !profile) return
    setSaving(true)
    setErrors({})

    try {
      const userBody: Record<string, string> = { name: form.name }
      if (form.phone !== undefined)   userBody.phone   = form.phone
      if (form.address !== undefined) userBody.address = form.address
      if (form.password) {
        userBody.password              = form.password
        userBody.password_confirmation = form.password_confirmation
      }

      const userRes = await fetch(`${API}/coach/profile/user`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(userBody),
      })

      if (!userRes.ok) {
        const err = await userRes.json()
        if (err.error && typeof err.error === "object") {
          setErrors(parseLaravelErrors(err.error))
          return
        }
        throw new Error(err.message ?? "Gagal update data user.")
      }

      const fd = new FormData()
      fd.append("birth_date",   form.birth_date)
      fd.append("description",  form.description)
      if (photoFile)    fd.append("photo",        photoFile)
      if (removePhoto)  fd.append("remove_photo", "1")

      const coachRes = await fetch(`${API}/coach/profile/coach`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      })

      if (!coachRes.ok) {
        const err = await coachRes.json()
        if (err.error && typeof err.error === "object") {
          setErrors(parseLaravelErrors(err.error))
          return
        }
        throw new Error(err.message ?? "Gagal update profil coach.")
      }

      const coachJson = await coachRes.json()
      if (coachJson.data?.photo) setPhotoPreview(coachJson.data.photo)

      const sessionRaw = Cookies.get("session_key")
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw)
          Cookies.set(
            "session_key",
            JSON.stringify({
              ...session,
              name:   form.name,
              avatar: coachJson.data?.photo ?? session.avatar,
            }),
            { expires: 7 }
          )
        } catch (_) {}
      }

      setForm((p) => ({ ...p, password: "", password_confirmation: "" }))
      setPhotoFile(null)
      setRemovePhoto(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3500)
    } catch (err: unknown) {
      setErrors({
        general: err instanceof Error ? err.message : "Terjadi kesalahan.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f0] p-6 md:p-10">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-52 rounded-xl bg-[#e2e0d8]" />
          <div className="h-40 rounded-2xl bg-[#e2e0d8]" />
          <div className="h-64 rounded-2xl bg-[#e2e0d8]" />
          <div className="h-36 rounded-2xl bg-[#e2e0d8]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 py-8 md:px-0">

        {errors.general && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
            {errors.general}
          </div>
        )}

        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <IconCheck size={18} />
            Profil berhasil diperbarui!
          </div>
        )}

        <Card title="Identitas">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">

            <div className="flex shrink-0 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-dashed border-[#ccc] bg-[#f0ede6] transition hover:border-[#111]"
              >
                {photoPreview ? (
                  <Image src={photoPreview} alt="Foto profil" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <IconUser size={34} className="text-[#ccc]" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <IconCamera size={22} className="text-white" />
                </div>
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handlePhoto}
              />

              <span className="text-center text-[11px] leading-tight text-[#aaa]">
                Klik untuk upload foto
                <br />
                JPG / PNG / WEBP · maks 2 MB
              </span>

              {photoFile && (
                <span className="max-w-[112px] truncate text-center text-[11px] font-semibold text-emerald-600">
                  ✓ {photoFile.name}
                </span>
              )}

              {photoPreview && !photoFile && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-rose-400 underline hover:text-rose-600"
                >
                  Hapus foto
                </button>
              )}
            </div>

            {/* Nama + Email */}
            <div className="w-full flex-1 space-y-4">
              <Field label="Nama Lengkap" error={errors.name} required>
                <TextInput
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="cth. Budi Santoso"
                  hasError={!!errors.name}
                />
              </Field>

              <Field label="Alamat Email">
                <div className="relative">
                  <input
                    value={profile?.email ?? ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-[#e2e0d8] bg-[#f0ede6] px-4 py-3 text-sm text-[#999]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#e2dfd6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#aaa]">
                    terkunci
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-[#bbb]">
                  Email tidak dapat diubah demi keamanan akun.
                </p>
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Informasi Pribadi">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="No. Telepon">
              <TextInput
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+62 812 xxxx xxxx"
                hasError={false}
              />
            </Field>

            <Field label="Tanggal Lahir">
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#e2e0d8] bg-white px-4 py-3 text-sm text-[#111] outline-none transition focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Alamat">
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Alamat lengkap..."
                  className="w-full resize-none rounded-xl border border-[#e2e0d8] bg-white px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-[#ccc] focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Bio / Deskripsi Coach">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ceritakan latar belakang, spesialisasi, dan gaya melatih Anda..."
                  className="w-full resize-none rounded-xl border border-[#e2e0d8] bg-white px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-[#ccc] focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Keamanan">
          <p className="mb-4 text-[12px] text-[#aaa]">
            Kosongkan kedua field ini jika tidak ingin mengganti password.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password Baru" error={errors.password}>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 karakter"
                show={showPass}
                onToggle={() => setShowPass((v) => !v)}
                hasError={!!errors.password}
              />
            </Field>

            <Field label="Konfirmasi Password" error={errors.password_confirmation}>
              <PasswordInput
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi password baru"
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                hasError={!!errors.password_confirmation}
              />
            </Field>
          </div>
        </Card>

        {/* ── Submit ── */}
        <div className="mt-2 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <IconCheck size={15} /> Tersimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#111] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#333] active:scale-95 disabled:opacity-60"
          >
            {saving ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <IconCheck size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-[#e2dfd6] bg-white shadow-sm">
      <div
        className="border-b border-[#f0ede6] px-6 py-4"
        style={{ borderLeft: "3px solid #111" }}
      >
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
          {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#666]">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
          <IconAlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

function TextInput({
  name,
  value,
  onChange,
  placeholder,
  hasError,
}: {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  hasError: boolean
}) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[
        "w-full rounded-xl border px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-[#ccc]",
        "focus:ring-2 focus:ring-[#111]/10",
        hasError
          ? "border-rose-400 bg-rose-50 focus:border-rose-400"
          : "border-[#e2e0d8] bg-white focus:border-[#111]",
      ].join(" ")}
    />
  )
}

function PasswordInput({
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  hasError,
}: {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  show: boolean
  onToggle: () => void
  hasError: boolean
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border px-4 py-3 pr-12 text-sm text-[#111] outline-none transition placeholder:text-[#ccc]",
          "focus:ring-2 focus:ring-[#111]/10",
          hasError
            ? "border-rose-400 bg-rose-50 focus:border-rose-400"
            : "border-[#e2e0d8] bg-white focus:border-[#111]",
        ].join(" ")}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] transition hover:text-[#111]"
      >
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  )
}