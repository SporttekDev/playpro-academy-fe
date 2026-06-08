"use client"

import Link from "next/link"
import Image from "next/image"
import {
    Mail,
    Phone,
    MapPin,
} from "lucide-react"
import { Button } from "../ui/button"
import { WhatsAppButton } from "./whatsapp-button"
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok } from "@tabler/icons-react"

const footerLinks = {
    academy: [
        {
            label: "Class Programs",
            href: "/class-programs",
        },
        {
            label: "Schedules Booking",
            href: "/schedules-booking",
        },
        {
            label: "Membership Package",
            href: "/membership-package",
        },
        // {
        //     label: "Coach List",
        //     href: "/coach-list",
        // },
    ],

    company: [
        {
            label: "About Us",
            href: "/about-us",
        },
        {
            label: "Gallery & Activities",
            href: "/gallery-activities",
        },
        // {
        //     label: "Contact",
        //     href: "/contact",
        // },
        {
            label: "FAQ",
            href: "/faq",
        },
    ],

    legal: [
        {
            label: "Privacy Policy",
            href: "/privacy-policy",
        },
        {
            label: "Terms & Conditions",
            href: "/terms",
        },
    ],
}

export default function Footer() {
    return (
        <footer className="border-t">
            {/* CTA */}
            <section className="border-b bg-gray-50 bg-gradient-to-br from-primary via-primary/95 to-secondary">
                <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-12 text-center lg:flex-row lg:text-left">
                    <div className="max-w-2xl">
                        <span className="text-sm font-semibold uppercase tracking-widest text-secondary">
                            Be Pro Player With PlayPro Academy
                        </span>

                        <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl text-white">
                            Develop Your Skills Through Professional
                            Multisport Training
                        </h2>

                        <p className="mt-4 text-sm leading-relaxed text-slate-50 md:text-base">
                            Learn with national certified coaches through
                            structured and fun training programs for kids and
                            young athletes.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <WhatsAppButton
                            variant="secondary"
                            phone="+6282131111549"
                            message="Halo admin PlayPro Academy, saya ingin mendapatkan free trial untuk anak saya. Mohon info program, jadwal, dan cara pendaftarannya."
                            label="Get Free Trial"
                        />
                        {/* <Button size={"lg"} variant={"secondary"} asChild>
                            <Link
                                href="#"
                            // className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                Get Free Trial
                            </Link>
                        </Button> */}

                        <Button size={"lg"} variant={"outline"} className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary" asChild>
                            <Link
                                href="/class-programs"
                            // className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:bg-gray-100"
                            >
                                Explore Programs
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Main Footer */}
            <section className="container mx-auto grid grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5">
                {/* Brand */}
                <div className="md:col-span-3 lg:col-span-2">
                    <Link
                        href="/"
                        className="flex items-center gap-4"
                    >
                        <div className="relative h-16 w-16">
                            <Image
                                src="/images/ppa-logo-smile.png"
                                alt="PlayPro Academy Logo"
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold">
                                PlayPro Academy
                            </h3>

                            <p className="text-sm text-gray-500">
                                One Stop Solution for Sports & Leisure
                            </p>
                        </div>
                    </Link>

                    <p className="mt-5 w-full text-sm leading-relaxed text-gray-600">
                        PlayPro Academy provides multisport training
                        programs designed to help children and young
                        athletes grow through professional coaching,
                        discipline, teamwork, and active learning.
                    </p>

                    {/* Contact Info */}
                    <div className="mt-8 space-y-4 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                            <span>
                                PT. Sport Teknologi Indonesia,
                                <br />
                                Bekasi Utara, Jawa Barat, Indonesia
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 shrink-0" />

                            <span>+62 821-3111-1549</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 shrink-0" />

                            <span>academyplaypro@gmail.com</span>
                        </div>
                    </div>
                </div>

                {/* Academy */}
                <div>
                    <h4 className="mb-5 text-lg font-semibold">
                        Academy
                    </h4>

                    <ul className="space-y-3">
                        {footerLinks.academy.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-gray-600 transition hover:text-black"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="mb-5 text-lg font-semibold">
                        Company
                    </h4>

                    <ul className="space-y-3">
                        {footerLinks.company.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-gray-600 transition hover:text-black"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="mb-5 text-lg font-semibold">
                        Legal
                    </h4>

                    <ul className="space-y-3">
                        {footerLinks.legal.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="text-sm text-gray-600 transition hover:text-black"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Bottom Footer */}
            <section className="border-t bg-gray-50">
                <div className="container mx-auto flex flex-col items-center justify-between gap-5 px-4 py-6 md:flex-row">
                    <p className="text-center text-sm text-gray-500 md:text-left">
                        © {new Date().getFullYear()} PlayPro Academy —
                        Part of Sports Group Indonesia.
                        All rights reserved.
                    </p>

                    {/* Social Media */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="https://instagram.com/playproacademy_id"
                            target="_blank"
                            className="rounded-full border p-2 text-gray-600 transition hover:bg-primary hover:text-white"
                        >
                            <IconBrandInstagram className="h-4 w-4" />
                        </Link>

                        <Link
                            href="https://www.facebook.com/profile.php?id=61561680205833"
                            target="_blank"
                            className="rounded-full border p-2 text-gray-600 transition hover:bg-primary hover:text-white"
                        >
                            <IconBrandFacebook className="h-4 w-4" />
                        </Link>

                        <Link
                            href="https://tiktok.com/@playpro.academy"
                            target="_blank"
                            className="rounded-full border p-2 text-gray-600 transition hover:bg-primary hover:text-white"
                        >
                            <IconBrandTiktok className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </footer>
    )
}