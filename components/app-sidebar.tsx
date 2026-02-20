
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
  IconInnerShadowTop,
  IconMapPin,
  IconReport,
  IconSearch,
  IconSettings,
  IconSoccerField,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
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
import Cookies from 'js-cookie'
import { useEffect, useState } from "react"

const data = {
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
      title: "Monthly Report",
      url: "/monthly-reports",
      icon: IconClipboardText,
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
    // {
    //   name: "Products",
    //   url: "/products",
    //   icon: IconPackage,
    // },
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
    // {
    //   name: "Rosters",
    //   url: "/rosters",
    //   icon: IconCalendarCog,
    // },
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionString = Cookies.get("session_key");
    if (!sessionString) {
      setUser(null);
      return;
    }
    try {
      const session = JSON.parse(sessionString);
      setUser({
        name: session?.name ?? "Guest User",
        email: session?.email ?? "guest@gmail.com",
        avatar: session?.avatar ?? "/avatars/default.jpg",
      });
    } catch (err) {
      console.error("JSON parse error:", err);
      setUser(null);
    }
  }, []);

  const sessionRaw = Cookies.get("session_key");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const role = session?.role ?? null;

  const filteredNavMain =
    role === "admin"
      ? data.navMain
      : data.navMain.filter(
        (item) =>
          item.url === "/dashboard" ||
          item.url === "/attendance-reports"
      );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Playpro Academy</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {role === "admin" && (
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
