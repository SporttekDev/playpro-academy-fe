"use client"

import {
  // IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserEdit,
  // IconNotification,
  // IconUserCircle,
} from "@tabler/icons-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  mounted,
}: {
  user: { name: string; email: string; avatar: string } | null
  mounted: boolean
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    const token = Cookies.get("token")
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    } catch (err) {
      console.error(err)
    } finally {
      Cookies.remove("token")
      Cookies.remove("session_key")
      router.push("/login")
    }
  }

  // Jika belum mounted (server or initial client), render skeleton / blank so server and client match
  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="ml-2 flex-1 space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Setelah mounted, tampilkan user (atau fallback Guest User bila user null)
  const display = user ?? {
    name: "Guest User",
    email: "guest@gmail.com",
    avatar: "/avatars/default.jpg",
  }

  let role: string | null = null
  try {
    const raw = Cookies.get("session_key")
    if (raw) role = JSON.parse(raw)?.role ?? null
  } catch (_) {}

  const initials = display.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={display.avatar} alt={display.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{display.name}</span>
                <span className="truncate text-xs">
                  {display.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={display.avatar} alt={display.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{display.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {display.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {role === "coach" && (
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <IconUserEdit className="mr-2 size-4" />
                Edit Profil
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <IconLogout className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}