"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    Award,
    BookOpen,
    Goal,
    HeartHandshake,
    LucideIcon,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    Trophy,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WhatsAppButton } from "./whatsapp-button"

interface TrustItem {
    title: string
    description: string
    icon: LucideIcon
}


// ─── Data ────────────────────────────────────────────────────────────────────

const values = [
    {
        title: "Kids First",
        description:
            "Kami menciptakan lingkungan latihan yang aman, nyaman, dan menyenangkan untuk setiap anak.",
        icon: HeartHandshake,
    },
    {
        title: "Character Building",
        description:
            "Olahraga bukan hanya tentang skill, tetapi juga membangun disiplin, teamwork, dan percaya diri.",
        icon: ShieldCheck,
    },
    {
        title: "Growth Through Sports",
        description:
            "Kami membantu anak berkembang secara fisik, sosial, dan mental melalui aktivitas olahraga.",
        icon: Target,
    },
]

const trustItems: TrustItem[] = [
    {
        title: "Certified Coaches",
        description: "Coach profesional dan berpengalaman menangani anak-anak.",
        icon: Award,
    },
    {
        title: "National Curriculum",
        description: "Kurikulum latihan terstruktur sesuai standar pembelajaran.",
        icon: BookOpen,
    },
    {
        title: "Kids Friendly",
        description: "Pendekatan fun learning agar anak nyaman dan aktif berlatih.",
        icon: Sparkles,
    },
    {
        title: "Monthly Evaluation",
        description: "Monitoring perkembangan anak dilakukan secara berkala.",
        icon: Goal,
    },
    {
        title: "Parent Communication",
        description: "Kami menjaga komunikasi aktif bersama orang tua siswa.",
        icon: Users,
    },
    {
        title: "Positive Environment",
        description: "Lingkungan olahraga yang suportif dan penuh semangat.",
        icon: Star,
    },
]


const coaches = [
    {
        name: "Coach Adrian",
        role: "Basketball Coach",
        image:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop",
    },
    {
        name: "Coach Michelle",
        role: "Toddler Development Coach",
        image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    },
    {
        name: "Coach Kevin",
        role: "Soccer Coach",
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    },
]

// Kiri: index 0,1,2 — Kanan: index 3,4,5
const RADIAL_POSITIONS: {
    style: React.CSSProperties
    align: "left" | "right"
}[] = [
        { style: { left: "10%", top: "5%" }, align: "right" },
        { style: { left: "0%", top: "50%", transform: "translateY(-50%)" }, align: "right" },
        { style: { left: "10%", bottom: "5%" }, align: "right" },
        { style: { right: "10%", top: "5%" }, align: "left" },
        { style: { right: "0%", top: "50%", transform: "translateY(-50%)" }, align: "left" },
        { style: { right: "10%", bottom: "5%" }, align: "left" },
    ]

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
                inline-flex items-center gap-2 rounded-full
                border border-primary/10 bg-primary/5
                px-4 py-2 text-sm font-medium text-primary
            "
        >
            <Sparkles className="h-4 w-4" />
            {children}
        </motion.div>
    )
}

function TrustFeatureCard({
    item,
    align = "left",
}: {
    item: TrustItem
    align?: "left" | "right"
}) {
    const Icon = item.icon

    return (
        <div className={cn("max-w-xs", align === "right" && "ml-auto text-right")}>
            <div className={cn("mb-4 flex", align === "right" ? "justify-end" : "justify-start")}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="h-7 w-7 text-primary" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
        </div>
    )
}

function TrustGridCard({ item }: { item: TrustItem }) {
    const Icon = item.icon

    return (
        <div className="
        group rounded-[1.5rem] border border-slate-200/70
        bg-white p-5 shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        sm:p-6
      ">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary sm:h-14 sm:w-14">
                <Icon
                    aria-hidden="true"
                    className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-white sm:h-7 sm:w-7"
                />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{item.description}</p>
        </div>
    )
}

function ValueCard({
    value,
    index,
}: {
    value: (typeof values)[number]
    index: number
}) {
    const Icon = value.icon
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -6,
                        transition: { duration: 0.16, ease: "easeOut" },
                    }
            }
            className="
                rounded-[2rem] border border-slate-200/70
                bg-white p-8 shadow-sm transition-all duration-300
                hover:shadow-xl
            "
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
                {value.title}
            </h3>

            <p className="mt-4 leading-relaxed text-slate-600">
                {value.description}
            </p>
        </motion.div>
    )
}

function TrustCard({
    item,
    index,
}: {
    item: (typeof trustItems)[number]
    index: number
}) {
    const Icon = item.icon
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : index * 0.04,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -4,
                        transition: { duration: 0.15, ease: "easeOut" },
                    }
            }
            className="
                rounded-[2rem] border border-slate-200/70
                bg-white p-7 shadow-sm transition-all duration-300
                hover:shadow-xl
            "
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15">
                <Icon className="h-6 w-6 text-secondary" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
                {item.title}
            </h3>

            <p className="mt-3 leading-relaxed text-slate-600">
                {item.description}
            </p>
        </motion.div>
    )
}

function CoachCard({
    coach,
    index,
}: {
    coach: (typeof coaches)[number]
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -5,
                        transition: { duration: 0.16, ease: "easeOut" },
                    }
            }
            className="
                group overflow-hidden rounded-[2rem]
                border border-slate-200/70 bg-white
                shadow-sm transition-all duration-300
                hover:shadow-xl
            "
        >
            <div className="relative overflow-hidden">
                <motion.div
                    whileHover={
                        reduceMotion
                            ? undefined
                            : {
                                scale: 1.05,
                                transition: { duration: 0.5, ease: "easeOut" },
                            }
                    }
                    className="relative h-[380px] w-full"
                >
                    <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        className="object-cover"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            </div>

            <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-900">
                    {coach.name}
                </h3>

                <p className="mt-2 text-slate-600">{coach.role}</p>
            </div>
        </motion.div>
    )
}

export default function AboutUsPage() {
    const reduceMotion = useReducedMotion()

    return (
        <main className="overflow-hidden bg-white">
            {/* ───────────────── Hero ───────────────── */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pb-28">
                <div className="absolute inset-0 -z-10">
                    <motion.div
                        animate={
                            reduceMotion
                                ? undefined
                                : { x: [0, 20, 0], y: [0, -12, 0] }
                        }
                        transition={
                            reduceMotion
                                ? undefined
                                : {
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }
                        }
                        className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
                    />

                    <motion.div
                        animate={
                            reduceMotion
                                ? undefined
                                : { x: [0, -20, 0], y: [0, 12, 0] }
                        }
                        transition={
                            reduceMotion
                                ? undefined
                                : {
                                    duration: 14,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }
                        }
                        className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                            <SectionBadge>About PlayPro Academy</SectionBadge>

                            <motion.h1
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                                className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl"
                            >
                                Growing Children Through
                                <span className="text-primary"> Sports & Confidence</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                                className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600"
                            >
                                PlayPro Academy hadir untuk membantu anak-anak berkembang
                                melalui olahraga yang fun, terarah, dan penuh semangat positif.
                                Kami percaya bahwa olahraga sejak dini membantu membangun
                                karakter, kepercayaan diri, dan kebiasaan hidup sehat.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                                className="mt-10 flex flex-wrap gap-4"
                            >
                                <WhatsAppButton
                                    phone="+6282131111549"
                                    message={`Halo admin PlayPro Academy, saya ingin mendapatkan free trial untuk anak saya. Mohon info program, jadwal, dan cara pendaftarannya. Terima kasih!`}
                                    size="xl"
                                    label="Book Free Trial"
                                />
                                {/* <Button size="xl" asChild>
                                    <Link href="/free-trial">
                                        Book Free Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button> */}

                                <Button size="xl" variant="outline" asChild>
                                    <Link href="/class-programs">Explore Programs</Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 18 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55, ease: "easeOut" }}
                            className="relative"
                        >
                            <motion.div
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : { y: [0, -8, 0] }
                                }
                                transition={
                                    reduceMotion
                                        ? undefined
                                        : {
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }
                                }
                                className="
                                    absolute -left-8 -top-8 h-48 w-48 rounded-full
                                    bg-primary/10 blur-3xl
                                "
                            />

                            <motion.div
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : { y: [0, 8, 0] }
                                }
                                transition={
                                    reduceMotion
                                        ? undefined
                                        : {
                                            duration: 7,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }
                                }
                                className="
                                    absolute -bottom-8 -right-8 h-48 w-48 rounded-full
                                    bg-secondary/10 blur-3xl
                                "
                            />

                            <motion.div
                                whileHover={
                                    reduceMotion
                                        ? undefined
                                        : {
                                            scale: 1.01,
                                            transition: { duration: 0.2, ease: "easeOut" },
                                        }
                                }
                                className="
                                    relative overflow-hidden rounded-[2.5rem]
                                    border border-slate-200/60
                                    shadow-[0_25px_80px_rgba(15,23,42,0.12)]
                                "
                            >
                                <div className="relative h-[520px] w-full">
                                    <Image
                                        src="/images/galleries/gallery-9.png"
                                        alt="PlayPro Academy"
                                        fill
                                        priority
                                        className="object-cover object-center"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───────────────── Story ───────────────── */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-14 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="relative overflow-hidden rounded-[2.5rem]"
                        >
                            <motion.div
                                whileHover={
                                    reduceMotion
                                        ? undefined
                                        : {
                                            scale: 1.03,
                                            transition: { duration: 0.5, ease: "easeOut" },
                                        }
                                }
                                className="relative h-[520px] w-full"
                            >
                                <Image
                                    src="/images/galleries/gallery-8.png"
                                    alt="Our Story"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                            <SectionBadge>Our Story</SectionBadge>

                            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                                Membangun Generasi{" "}
                                <span className="text-secondary">Aktif</span>{" "}
                                dan{" "}
                                <span className="text-primary">Percaya Diri</span>
                            </h2>

                            <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-600">
                                <p>
                                    PlayPro Academy dibangun dengan visi untuk menciptakan tempat
                                    olahraga anak yang modern, aman, dan menyenangkan.
                                </p>

                                <p>
                                    Kami memahami bahwa setiap anak memiliki proses tumbuh yang
                                    berbeda. Karena itu, pendekatan pembelajaran kami dirancang
                                    agar anak dapat berkembang secara bertahap melalui aktivitas
                                    olahraga yang positif.
                                </p>

                                <p>
                                    Tidak hanya fokus pada kemampuan olahraga, kami juga membantu
                                    anak membangun karakter, disiplin, teamwork, dan rasa percaya
                                    diri sejak usia dini.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───────────────── Values ───────────────── */}
            <section className="bg-slate-50 py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <SectionBadge>Mission & Values</SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                            Nilai yang Menjadi{" "}
                            <span className="text-primary">Fondasi Kami</span>
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Kami percaya bahwa olahraga adalah media terbaik untuk membantu
                            anak bertumbuh secara sehat, aktif, dan percaya diri.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {values.map((value, index) => (
                            <ValueCard key={value.title} value={value} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── Trust ───────────────── */}
            <section
                aria-label="Kenapa orang tua memilih PlayPro Academy"
                className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
            >
                {/* Background */}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                </div>

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                            <Sparkles aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Why Parents Trust Us
                        </div>

                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl">
                            Kenapa Orang Tua Memilih Play
                            <span className="text-secondary">Pro</span>{" "}
                            <span className="text-primary">Academy</span>
                        </h2>

                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base md:text-lg">
                            Kami menghadirkan pengalaman olahraga anak yang aman, modern, dan
                            terstruktur untuk mendukung tumbuh kembang terbaik mereka.
                        </p>
                    </motion.div>

                    {/* Mobile & Tablet — Grid Cards */}
                    <div
                        role="list"
                        aria-label="Keunggulan PlayPro Academy"
                        className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:hidden"
                    >
                        {trustItems.map((item, i) => (
                            <motion.div
                                key={item.title}
                                role="listitem"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
                            >
                                <TrustGridCard item={item} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop — Radial Layout */}
                    <div
                        aria-hidden="true"
                        className="relative mt-20 hidden min-h-[700px] lg:block"
                    >
                        {/* Radial Items */}
                        {trustItems.map((item, i) => (
                            <div
                                key={item.title}
                                className="absolute max-w-xs"
                                style={RADIAL_POSITIONS[i].style}
                            >
                                <TrustFeatureCard item={item} align={RADIAL_POSITIONS[i].align} />
                            </div>
                        ))}

                        {/* Center Image */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            {/* Decorative Rings */}
                            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                                <div className="h-[520px] w-[520px] rounded-full border border-slate-200/70" />
                            </div>
                            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                                <div className="h-[420px] w-[420px] rounded-full border border-dashed border-primary/20" />
                            </div>

                            {/* Image Card */}
                            <div className="relative z-10 w-[360px]">
                                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.15)]">
                                    <div className="relative h-[420px]">
                                        <Image
                                            src="/images/ppa-logo-square.png"
                                            alt="Logo PlayPro Academy"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen reader list for desktop radial (hidden visually) */}
                    <ul className="sr-only">
                        {trustItems.map((item) => (
                            <li key={item.title}>
                                <strong>{item.title}</strong>: {item.description}
                            </li>
                        ))}
                    </ul>

                </div>
            </section>

            {/* ───────────────── Coaches ───────────────── */}
            <section className="bg-slate-50 py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <SectionBadge>Our Coaches</SectionBadge>

                            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                                <span className="text-primary">Coach</span>{" "}
                                Profesional dan Berpengalaman
                            </h2>

                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Setiap sesi dipandu oleh coach yang berpengalaman, sabar, dan memahami
                                kebutuhan perkembangan anak di setiap tahap usia.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                        className="mt-14 grid gap-6 md:grid-cols-3"
                    >
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Trophy className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                Certified Coaches
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Dibimbing oleh coach yang punya pengalaman langsung menangani anak-anak.
                            </p>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <HeartHandshake className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                Child-Friendly Approach
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Metode latihan dibuat fun, aman, dan nyaman untuk semua kategori usia.
                            </p>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Users className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                Focus on Growth
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Coach fokus membantu anak berkembang dari sisi skill, karakter, dan kepercayaan diri.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}