"use client"

import * as React from "react"
import Cookies from "js-cookie"
import { Badge } from "@/components/ui/badge"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { LayoutDashboard, Sparkles } from "lucide-react"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import CoachDashboard from "@/components/dashboard/coach-dashboard"
import ParentDashboard from "@/components/dashboard/parent-dashboard"

type Role = "admin" | "coach" | "parent"

type ParsedSession = {
  role: Role
  name: string
}

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== "string") return null

  const lower = value.toLowerCase()

  if (lower.includes("admin")) return "admin"
  if (lower.includes("coach")) return "coach"
  if (lower.includes("parent")) return "parent"

  return null
}

function getParsedSession(): ParsedSession {
  const fallback: ParsedSession = {
    role: "parent",
    name: "Parent",
  }

  const raw = Cookies.get("session_key")
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw)

    const role =
      normalizeRole(parsed?.role) ??
      normalizeRole(parsed?.user?.role) ??
      normalizeRole(parsed?.account_type) ??
      normalizeRole(parsed?.type) ??
      fallback.role

    const nameCandidates = [
      parsed?.name,
      parsed?.full_name,
      parsed?.username,
      parsed?.user?.name,
      parsed?.user?.full_name,
      parsed?.user?.username,
    ]

    const name =
      nameCandidates.find(
        (item) => typeof item === "string" && item.trim().length > 0
      ) ??
      (role === "admin" ? "Admin" : role === "coach" ? "Coach" : "Parent")

    return { role, name }
  } catch {
    const role = normalizeRole(raw) ?? fallback.role

    return {
      role,
      name: role === "admin" ? "Admin" : role === "coach" ? "Coach" : "Parent",
    }
  }
}

function roleLabel(role: Role) {
  if (role === "admin") return "Admin Dashboard"
  if (role === "coach") return "Coach Dashboard"
  return "Parent Dashboard"
}

function roleChipClass(role: Role) {
  if (role === "admin") return "bg-slate-950 text-white"
  if (role === "coach") return "bg-primary text-white"
  return "bg-secondary text-white"
}

function roleChipText(role: Role) {
  if (role === "admin") return "Operational overview"
  if (role === "coach") return "Today’s class focus"
  return "Child progress & schedule"
}

export default function Page() {
  const [ready, setReady] = React.useState(false)
  const [role, setRole] = React.useState<Role>("parent")
  const [displayName, setDisplayName] = React.useState("Parent")

  React.useEffect(() => {
    const parsed = getParsedSession()
    setRole(parsed.role)
    setDisplayName(parsed.name)
    setReady(true)
  }, [])

  if (!ready) {
    return <DashboardSkeleton />
  }

  return (
    <main className="min-h-screen w-full">
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-white">
              <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
              PlayPro Academy Dashboard
            </Badge>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {roleLabel(role)}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              {roleChipText(role)} for {displayName}
            </p>
          </div>

          <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${roleChipClass(role)}`}>
            <Sparkles className="h-4 w-4" />
            {role.toUpperCase()}
          </div>
        </div>

        {role === "admin" ? (
          <AdminDashboard name={displayName} />
        ) : role === "coach" ? (
          <CoachDashboard name={displayName} />
        ) : (
          <ParentDashboard />
        )}
      </div>
    </main>
  )
}