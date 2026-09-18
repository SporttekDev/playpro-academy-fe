"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import Cookies from "js-cookie"

import { useEffect, useState } from "react"

import { Menu, LayoutDashboard } from "lucide-react"
import { motion } from "framer-motion"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"

import { Button } from "@/components/ui/button"
import { WhatsAppButton } from './whatsapp-button';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const menus = [
    { name: "Home", href: "/" },
    { name: "Class Programs", href: "/class-programs" },
    { name: "Schedules Booking", href: "/schedules-booking" },
    { name: "Membership Package", href: "/membership-package" },
    // { name: "Coach List", href: "/coach-list" },
    { name: "About Us", href: "/about-us" },
    { name: "Gallery & Activities", href: "/gallery-activities", matchPrefixes: ["/gallery-activities", "/activities"] },
]

function isMenuActive(pathname: string, menu: (typeof menus)[number]): boolean {
    if (menu.href === "/") {
        return pathname === "/"
    }

    const prefixes = menu.matchPrefixes ?? [menu.href]
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const token = Cookies.get("token")

        setIsLoggedIn(!!token)
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">

                {/* Logo */}
                <Link
                    href="/"
                    className="relative h-16 w-16 shrink-0"
                >
                    <Image
                        src="/images/ppa-logo-smile.png"
                        alt="Logo PPA"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden xl:flex items-center gap-4">

                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-1">
                            {menus.map((menu) => {
                                const active = isMenuActive(pathname, menu)

                                return (
                                    <NavigationMenuItem key={menu.name}>
                                        <Link
                                            href={menu.href}
                                            className={`
                                                relative inline-flex h-10 items-center justify-center
                                                rounded-xl px-4 py-2 text-sm font-medium
                                                whitespace-nowrap transition-colors duration-300
                                                ${active
                                                    ? "text-primary"
                                                    : "text-slate-700 hover:text-primary"
                                                }
                                            `}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="navbar-active-pill"
                                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    className="absolute inset-0 -z-10 rounded-xl bg-primary/10"
                                                />
                                            )}
                                            {!active && (
                                                <span className="absolute inset-0 -z-10 rounded-xl transition-colors duration-300 hover:bg-primary/5" />
                                            )}
                                            {menu.name}
                                        </Link>
                                    </NavigationMenuItem>
                                )
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 shrink-0">

                        {isLoggedIn ? (
                            <Button
                                size="sm"
                                asChild
                            >
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                asChild
                            >
                                <Link href="/login">
                                    Login
                                </Link>
                            </Button>
                        )}

                        <WhatsAppButton
                            variant="secondary"
                            phone="+6282131111549"
                            message={`Halo admin PlayPro Academy, saya ingin mendapatkan free trial untuk anak saya. Mohon info program, jadwal, dan cara pendaftarannya. Terima kasih!`}
                            size="sm"
                            label="Get Free Trial"

                        />
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className="xl:hidden">
                    <Sheet>

                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="w-[320px]"
                        >
                            <SheetHeader>
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                            </SheetHeader>

                            <div className="mt-8 flex flex-col gap-2 px-4">

                                {/* Menu */}
                                {menus.map((menu) => {
                                    const active = isMenuActive(pathname, menu)

                                    return (
                                        <Link
                                            key={menu.name}
                                            href={menu.href}
                                            className={`
                                                rounded-xl px-4 py-3 text-sm font-medium
                                                transition-all duration-300
                                                ${active
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-slate-700 hover:bg-primary/5 hover:text-primary"
                                                }
                                            `}
                                        >
                                            {menu.name}
                                        </Link>
                                    )
                                })}

                                {/* Buttons */}
                                <div className="mt-6 flex flex-col gap-3">

                                    {isLoggedIn ? (
                                        <Button
                                            className="rounded-xl"
                                            asChild
                                        >
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            className="rounded-xl"
                                            asChild
                                        >
                                            <Link href="/login">
                                                Login
                                            </Link>
                                        </Button>
                                    )}

                                    <Button
                                        variant="secondary"
                                        className="rounded-xl"
                                        asChild
                                    >
                                        <Link href="/free-trial">
                                            Get Free Trial
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}