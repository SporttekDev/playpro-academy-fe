"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const passwordMatched = useMemo(() => {
        if (!password || !passwordConfirmation) return false
        return password === passwordConfirmation
    }, [password, passwordConfirmation])

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setIsLoading(true)
        setErrorMessage("")

        if (password !== passwordConfirmation) {
            const message = "Password confirmation does not match."
            setErrorMessage(message)
            toast.error(message)
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    role: "parent",
                    phone: phone || null,
                    address: address || null,
                }),
            })

            const json = await res.json().catch(() => null)

            if (!res.ok) {
                if (json?.errors) {
                    const validationErrors = Object.values(json.errors).flat().join("\n")
                    throw new Error(validationErrors)
                }

                throw new Error(json?.message || "Registrasi gagal")
            }

            toast.success("Registrasi berhasil!")
            router.replace("/login")
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi."

            setErrorMessage(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-5", className)} {...props}>
            <form onSubmit={handleRegister} className="space-y-5">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                            <Image
                                src="/images/ppa-logo-square.png"
                                alt="PlayPro Academy Logo"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Create Your Account
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                                Daftar untuk mulai mengakses dashboard PlayPro Academy.
                            </p>
                        </div>

                        <div className="text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {errorMessage ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm whitespace-pre-line text-rose-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{errorMessage}</p>
                        </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your full name"
                                autoComplete="name"
                                autoFocus
                                required
                                disabled={isLoading}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                autoComplete="email"
                                inputMode="email"
                                required
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 rounded-xl pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 transition hover:text-slate-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">
                                Use at least 8 characters for better security.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                    disabled={isLoading}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className={cn(
                                        "h-11 rounded-xl pr-12",
                                        passwordConfirmation &&
                                        !passwordMatched &&
                                        "border-rose-300 focus-visible:ring-rose-200"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordConfirmation((prev) => !prev)
                                    }
                                    aria-label={
                                        showPasswordConfirmation ? "Hide password" : "Show password"
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 transition hover:text-slate-600"
                                    disabled={isLoading}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {passwordConfirmation ? (
                                passwordMatched ? (
                                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Password matched
                                    </div>
                                ) : (
                                    <p className="text-xs text-rose-500">
                                        Password confirmation does not match
                                    </p>
                                )
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+62 812 3456 7890"
                                autoComplete="tel"
                                inputMode="tel"
                                required
                                disabled={isLoading}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Your address"
                                autoComplete="street-address"
                                required
                                disabled={isLoading}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        disabled={isLoading || (!!passwordConfirmation && !passwordMatched)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </div>
            </form>

            <div className="text-center text-[11px] leading-relaxed text-slate-400 sm:text-xs">
                By clicking continue, you agree to our{" "}
                <Link
                    href="#"
                    className="underline underline-offset-4 hover:text-slate-600"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="#"
                    className="underline underline-offset-4 hover:text-slate-600"
                >
                    Privacy Policy
                </Link>
                .
            </div>
        </div>
    )
}