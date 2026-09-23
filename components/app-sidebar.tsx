"use client"

import * as React from "react"
import {
  IconBallBasketball,
  IconBook,
  IconCalendarEvent,
  IconCamera,
  IconCategory,
  IconClipboardText,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconCheckupList,
  IconMapPin,
  IconReport,
  IconSearch,
  IconSettings,
  IconSoccerField,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
  IconMoneybag,
  IconSettingsDollar,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Cookies from "js-cookie"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from 'next/image';

const data = {
  // Menu operasional biasa — dipakai admin, superadmin, coach, parent (difilter per role di bawah)
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "PlayKids",
      url: "/play-kids",
      icon: IconUsersGroup,
    },
    {
      title: "Schedules",
      url: "/schedules",
      icon: IconCalendarEvent,
    },
    {
      title: "Attendance Report",
      url: "/attendance-reports",
      icon: IconReport,
    },
    {
      title: "Coach Attendance",
      url: "/coach-attendance",
      icon: IconCheckupList,
    },
    {
      title: "Monthly Report",
      url: "/monthly-reports",
      icon: IconClipboardText,
    },
  ],

  // Menu payroll/finance — terpisah karena admin biasa TIDAK boleh akses ini
  navFinance: [
    {
      title: "Payroll",
      url: "/payroll",
      icon: IconMoneybag,
    },
  ],

  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],

  documents: [
    {
      name: "Categories",
      url: "/categories",
      icon: IconCategory,
    },
    {
      name: "Sports",
      url: "/sports",
      icon: IconBallBasketball,
    },
    {
      name: "Branches",
      url: "/branches",
      icon: IconMapPin,
    },
    {
      name: "Classes",
      url: "/classes",
      icon: IconBook,
    },
    {
      name: "Venues",
      url: "/venues",
      icon: IconSoccerField,
    },
    {
      name: "Coaches",
      url: "/coaches",
      icon: IconUserCheck,
    },
    {
      name: "Users",
      url: "/users",
      icon: IconUsers,
    },
  ],
}

type UserType = {
  name: string
  email: string
  avatar: string
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = useState(false)

  const [user, setUser] = useState<UserType | null>(null)

  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    const sessionString = Cookies.get("session_key")

    if (!sessionString) {
      setUser(null)
      setRole(null)
      return
    }

    try {
      const session = JSON.parse(sessionString)

      setUser({
        name: session?.name ?? "Guest User",
        email: session?.email ?? "guest@gmail.com",
        avatar: session?.avatar ?? "/avatars/default.jpg",
      })

      setRole(session?.role ? String(session.role).toLowerCase() : null)
    } catch (err) {
      console.error("JSON parse error:", err)

      setUser(null)
      setRole(null)
    }
  }, [])

  const filteredNavMain = useMemo(() => {
    if (!role) return []

    // SUPERADMIN: semua menu operasional + payroll
    if (role === "superadmin") {
      return [...data.navMain, ...data.navFinance]
    }

    // ADMIN: semua menu operasional, TANPA payroll
    if (role === "admin") {
      return data.navMain
    }

    // COACH: subset menu operasional + payroll (lihat gaji sendiri)
    if (role === "coach") {
      return [
        ...data.navMain.filter(
          (item) =>
            item.url === "/dashboard" ||
            item.url === "/attendance-reports" ||
            item.url === "/coach-attendance"
        ),
        // ...data.navFinance.filter((item) => item.url === "/payroll"),
      ]
    }

    // FINANCE: dashboard + payroll only (scope saat ini)
    if (role === "finance") {
      return [
        ...data.navMain.filter((item) => item.url === "/dashboard"),
        ...data.navFinance,
      ]
    }

    // PARENT
    if (role === "parent") {
      return data.navMain.filter(
        (item) => item.url === "/dashboard"
      )
    }

    return []
  }, [role])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-16"
            >
              <Link href="/" className="flex items-center gap-2 justify-center">
                <Image
                  src="/images/ppa-logo-inline-fill.png"
                  alt="Playpro Academy Logo"
                  width={180}
                  height={180}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />

        {(role === "admin" || role === "superadmin") && (
          <NavDocuments items={data.documents} />
        )}

        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} mounted={mounted} />
      </SidebarFooter>
    </Sidebar>
  )
}