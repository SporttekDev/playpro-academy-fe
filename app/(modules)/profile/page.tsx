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
  IconLock,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconFileText,
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
        const data: CoachProfile = json.data

        setProfile(data)
        setForm({
          name:                  data.name               ?? "",
          phone:                 data.phone              ?? "",
          address:               data.address            ?? "",
          birth_date:            data.coach?.birth_date  ?? "",
          description:           data.coach?.description ?? "",
          password:              "",
          password_confirmation: "",
        })
        if (data.coach?.photo) setPhotoPreview(data.coach.photo)
      } catch (e) {
        console.error(e)
        setErrors({ general: "Failed to load profile. Please refresh the page." })
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
      setErrors((p) => ({ ...p, general: "Photo must be smaller than 2 MB." }))
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
      errs.name = "Full name is required."
    if (form.password && form.password.length < 6)
      errs.password = "Password must be at least 6 characters."
    if (form.password && form.password !== form.password_confirmation)
      errs.password_confirmation = "Passwords do not match."
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
        throw new Error(err.message ?? "Failed to update user data.")
      }

      const fd = new FormData()
      fd.append("birth_date",  form.birth_date)
      fd.append("description", form.description)
      if (photoFile)   fd.append("photo",        photoFile)
      if (removePhoto) fd.append("remove_photo", "1")

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
        throw new Error(err.message ?? "Failed to update coach profile.")
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
        general: err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] p-8">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-64 rounded-2xl bg-[#e5e3da]" />
          <div className="h-56 rounded-3xl bg-[#e5e3da]" />
          <div className="h-72 rounded-3xl bg-[#e5e3da]" />
          <div className="h-40 rounded-3xl bg-[#e5e3da]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <form id="profile-form" onSubmit={handleSubmit} className="p-8">
        {/* Alerts */}
        {errors.general && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
            {errors.general}
          </div>
        )}
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <IconCheck size={18} />
            Profile updated successfully!
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-1">

            {/* Photo */}
            <div className="overflow-hidden rounded-2xl border border-[#e5e3da] bg-white shadow-sm">
              <div className="border-b border-[#f0ede6] px-6 py-4" style={{ borderLeft: "3px solid #111" }}>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#888]">Profile Photo</h2>
              </div>
              <div className="flex flex-col items-center px-6 py-8">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#e5e3da] bg-[#f0ede6] shadow-inner transition hover:border-[#111]"
                >
                  {photoPreview ? (
                    <Image src={photoPreview} alt="Profile photo" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <IconUser size={40} className="text-[#ccc]" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <IconCamera size={22} className="text-white" />
                    <span className="text-[10px] font-semibold text-white">Change</span>
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePhoto}
                />
                <p className="mt-4 text-center text-[12px] leading-relaxed text-[#aaa]">
                  Click the photo to upload a new one.
                  <br />
                  JPG · PNG · WEBP &nbsp;·&nbsp; Max 2 MB
                </p>
                {photoFile && (
                  <span className="mt-2 max-w-[180px] truncate text-center text-[11px] font-semibold text-emerald-600">
                    ✓ {photoFile.name}
                  </span>
                )}
                {photoPreview && !photoFile && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-3 text-[12px] text-rose-400 underline transition hover:text-rose-600"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="overflow-hidden rounded-2xl border border-[#e5e3da] bg-white shadow-sm">
              <div className="border-b border-[#f0ede6] px-6 py-4" style={{ borderLeft: "3px solid #111" }}>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#888]">Identity</h2>
              </div>
              <div className="space-y-5 px-6 py-5">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#666]">Email Address</p>
                  <div className="relative">
                    <input
                      value={profile?.email ?? ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-[#e5e3da] bg-[#f7f6f2] px-4 py-3 text-sm text-[#999]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#e5e3da] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#aaa]">
                      locked
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#bbb]">
                    Email address cannot be changed for account security.
                  </p>
                </div>
                <Field label="Full Name" error={errors.name} required>
                  <TextInput
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. John Smith"
                    hasError={!!errors.name}
                  />
                </Field>
              </div>
            </div>

          </div>

          {/*Personal Info*/}
          <div className="space-y-6 lg:col-span-2">

            <Section title="Personal Information" icon={<IconFileText size={14} />}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone Number" icon={<IconPhone size={13} />}>
                  <TextInput
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    hasError={false}
                  />
                </Field>

                <Field label="Date of Birth" icon={<IconCalendar size={13} />}>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e5e3da] bg-white px-4 py-3 text-sm text-[#111] outline-none transition focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Address" icon={<IconMapPin size={13} />}>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Your full address…"
                      className="w-full resize-none rounded-xl border border-[#e5e3da] bg-white px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-[#ccc] focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Bio / Coach Description">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your background, specializations, and coaching style…"
                      className="w-full resize-none rounded-xl border border-[#e5e3da] bg-white px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-[#ccc] focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Security" icon={<IconLock size={14} />}>
              <p className="mb-5 text-[12px] text-[#aaa]">
                Leave both fields empty if you don't want to change your password.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="New Password" error={errors.password}>
                  <PasswordInput
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    show={showPass}
                    onToggle={() => setShowPass((v) => !v)}
                    hasError={!!errors.password}
                  />
                </Field>

                <Field label="Confirm Password" error={errors.password_confirmation}>
                  <PasswordInput
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                    hasError={!!errors.password_confirmation}
                  />
                </Field>
              </div>
            </Section>

          </div>
        </div>

        {/* Save Button*/}
        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <IconCheck size={15} /> Saved successfully!
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#333] active:scale-95 disabled:opacity-60 sm:w-auto"
          >
            {saving ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <IconCheck size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5e3da] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#f0ede6] px-6 py-4" style={{ borderLeft: "3px solid #111" }}>
        {icon && <span className="text-[#888]">{icon}</span>}
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#888]">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

function Field({
  label,
  children,
  error,
  required,
  icon,
}: {
  label: string
  children: React.ReactNode
  error?: string
  required?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#666]">
        {icon && <span className="text-[#aaa]">{icon}</span>}
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
          : "border-[#e5e3da] bg-white focus:border-[#111]",
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
            : "border-[#e5e3da] bg-white focus:border-[#111]",
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