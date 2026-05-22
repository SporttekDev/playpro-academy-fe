"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsLoading(true)
    setErrorMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || "Login gagal")
      }

      const token = json?.access_token as string | undefined
      const userData = json?.user

      if (!token || !userData) {
        throw new Error("Respons login tidak lengkap.")
      }

      Cookies.set("token", token, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      })

      Cookies.set("session_key", JSON.stringify(userData), {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
      })

      toast.success("Login berhasil!")
      router.replace("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat login."

      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              <Image
                src="/images/ppa-logo-square.png"
                alt="PlayPro Academy Logo"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                Login untuk melanjutkan ke dashboard PlayPro Academy.
              </p>
            </div>

            <div className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
              >
                Sign up
              </Link>
            </div>
          </div>

          {errorMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="playpro@example.com"
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
                  autoComplete="current-password"
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
            </div>

            {/* <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-slate-500 underline underline-offset-4 transition hover:text-primary"
              >
                Forgot password?
              </Link>
            </div> */}

            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-sm font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-xs leading-relaxed text-slate-400">
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