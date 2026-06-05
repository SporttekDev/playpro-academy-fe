"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    Award,
    BadgeCheck,
    CalendarDays,
    Dumbbell,
    ShieldCheck,
    Sparkles,
    Star,
    Trophy,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Coach {
    name: string
    role: string
    category: string
    sport: string
    image: string
    experience: string
    certifications: string[]
    bio: string
    quote: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const filters = [
    "All Coaches",
    "Toddler",
    "Junior",
    "Basketball",
    "Soccer",
    "Tennis",
    "Padel",
]

const coaches: Coach[] = [
    {
        name: "Coach Daniel",
        role: "Basketball Development Coach",
        category: "Junior",
        sport: "Basketball",
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
        experience: "8 Years Experience",
        certifications: ["Licensed Coach", "Child Specialist"],
        bio:
            "Berpengalaman melatih anak usia dini dan junior dengan pendekatan aktif, suportif, dan fun learning.",
        quote: "Every child grows differently. Our job is helping them enjoy the process.",
    },
    {
        name: "Coach Amanda",
        role: "Toddler Multisport Coach",
        category: "Toddler",
        sport: "Multisport",
        image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
        experience: "6 Years Experience",
        certifications: ["Certified Toddler Coach", "Motor Skill Expert"],
        bio:
            "Fokus membantu anak toddler membangun koordinasi, keberanian, dan kebiasaan aktif sejak dini.",
        quote: "Sports should feel exciting, safe, and confidence-building for every child.",
    },
    {
        name: "Coach Michael",
        role: "Soccer Performance Coach",
        category: "Junior",
        sport: "Soccer",
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop",
        experience: "10 Years Experience",
        certifications: ["AFC Licensed", "Youth Development"],
        bio:
            "Melatih skill teknik dan teamwork anak melalui pendekatan disiplin namun tetap menyenangkan.",
        quote: "Discipline and fun can grow together on the field.",
    },
    {
        name: "Coach Sophia",
        role: "Tennis Coach",
        category: "Junior",
        sport: "Tennis",
        image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop",
        experience: "7 Years Experience",
        certifications: ["National Tennis Coach", "Junior Specialist"],
        bio:
            "Berpengalaman membangun fokus, refleks, dan konsistensi latihan anak melalui tennis training.",
        quote: "Confidence begins when children believe they can improve.",
    },
    {
        name: "Coach Kevin",
        role: "Padel Coach",
        category: "Junior",
        sport: "Padel",
        image:
            "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop",
        experience: "5 Years Experience",
        certifications: ["International Padel Coach", "Kids Training Expert"],
        bio:
            "Membantu anak menikmati olahraga modern dengan latihan aktif dan interaktif.",
        quote: "Children learn best when movement feels natural and exciting.",
    },
    {
        name: "Coach Olivia",
        role: "Toddler Soccer Coach",
        category: "Toddler",
        sport: "Soccer",
        image:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop",
        experience: "4 Years Experience",
        certifications: ["Toddler Coach", "Positive Learning"],
        bio:
            "Mengembangkan keberanian dan kemampuan motorik anak melalui aktivitas sepak bola yang fun.",
        quote: "A happy child learns faster and grows more confidently.",
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function CoachCard({ coach, index }: { coach: Coach; index: number }) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -6,
                        transition: { duration: 0.18, ease: "easeOut" },
                    }
            }
            className="
                group overflow-hidden rounded-[2rem]
                border border-slate-200 bg-white
                shadow-sm transition-all duration-500
                hover:shadow-[0_25px_70px_rgba(15,23,42,0.12)]
            "
        >
            <div className="relative aspect-[4/5] overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    whileHover={
                        reduceMotion
                            ? undefined
                            : {
                                scale: 1.05,
                                transition: { duration: 0.5, ease: "easeOut" },
                            }
                    }
                >
                    <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        className="object-cover"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur-md"
                >
                    {coach.sport}
                </motion.div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-md"
                    >
                        <Star className="h-3.5 w-3.5" />
                        {coach.experience}
                    </motion.div>

                    <h3 className="mt-4 text-2xl font-extrabold text-white">
                        {coach.name}
                    </h3>

                    <p className="mt-1 text-sm text-white/80">{coach.role}</p>
                </div>
            </div>

            <div className="p-6">
                <p className="text-sm leading-relaxed text-slate-600">{coach.bio}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                    {coach.certifications.map((item) => (
                        <div
                            key={item}
                            className="
                                inline-flex items-center gap-1.5 rounded-full
                                bg-primary/5 px-3 py-1.5
                                text-xs font-medium text-primary
                            "
                        >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {item}
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm italic leading-relaxed text-slate-600">
                        “{coach.quote}”
                    </p>
                </div>
            </div>
        </motion.article>
    )
}

function StatCard({
    value,
    label,
    icon: Icon,
    index,
}: {
    value: string
    label: string
    icon: React.ElementType
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : index * 0.04,
                ease: "easeOut",
            }}
            className="
                rounded-[2rem] border border-slate-200 bg-white
                p-8 text-center shadow-sm
            "
        >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mt-6 text-4xl font-extrabold text-slate-900">{value}</h3>

            <p className="mt-2 text-sm text-slate-600">{label}</p>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CoachesPage() {
    const reduceMotion = useReducedMotion()
    const [activeFilter, setActiveFilter] = useState("All Coaches")

    const filteredCoaches = useMemo(() => {
        if (activeFilter === "All Coaches") return coaches

        return coaches.filter(
            (coach) =>
                coach.category === activeFilter || coach.sport === activeFilter
        )
    }, [activeFilter])

    return (
        <main className="relative overflow-hidden bg-white">
            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : { x: [0, 18, 0], y: [0, -12, 0] }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 11,
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
                            : { x: [0, -18, 0], y: [0, 12, 0] }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 13,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }
                    }
                    className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            {/* ───────────────── HERO ───────────────── */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                                <Sparkles className="h-4 w-4" />
                                Professional Coaches
                            </div>

                            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
                                Meet Our
                                <span className="text-primary"> Expert Coaches</span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                                Coach profesional dan berpengalaman yang siap membantu anak
                                berkembang dengan cara yang fun, aman, dan positif.
                            </p>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <Trophy className="h-7 w-7 text-primary" />
                                    <h3 className="mt-4 font-bold text-slate-900">
                                        Certified Coaches
                                    </h3>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.03 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <ShieldCheck className="h-7 w-7 text-primary" />
                                    <h3 className="mt-4 font-bold text-slate-900">
                                        Child-Friendly
                                    </h3>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.06 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <Dumbbell className="h-7 w-7 text-primary" />
                                    <h3 className="mt-4 font-bold text-slate-900">
                                        Multisport Experts
                                    </h3>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-5 pt-10">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl"
                                    >
                                        <Image
                                            src={coaches[0].image}
                                            alt={coaches[0].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                        className="relative aspect-square overflow-hidden rounded-[2rem] shadow-xl"
                                    >
                                        <Image
                                            src={coaches[1].image}
                                            alt={coaches[1].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-5">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                        className="relative aspect-square overflow-hidden rounded-[2rem] shadow-xl"
                                    >
                                        <Image
                                            src={coaches[2].image}
                                            alt={coaches[2].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl"
                                    >
                                        <Image
                                            src={coaches[3].image}
                                            alt={coaches[3].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="
                                    absolute bottom-6 left-1/2 z-10
                                    w-[280px] -translate-x-1/2
                                    rounded-[2rem] border border-white/30
                                    bg-white/90 p-5 backdrop-blur-xl
                                    shadow-[0_20px_50px_rgba(15,23,42,0.18)]
                                "
                            >
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-primary/10 p-3">
                                        <Award className="h-6 w-6 text-primary" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            25+ Professional Coaches
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Experienced & Certified
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───────────────── FILTERS ───────────────── */}
            <section className="pb-10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {filters.map((filter, index) => (
                            <motion.button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                whileHover={reduceMotion ? undefined : { y: -2 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={`
                                    rounded-full px-5 py-2.5 text-sm font-semibold
                                    transition-all duration-300
                                    ${activeFilter === filter
                                        ? "bg-primary text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }
                                `}
                            >
                                {filter}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───────────────── COACH GRID ───────────────── */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFilter}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {filteredCoaches.map((coach, index) => (
                                <CoachCard key={coach.name} coach={coach} index={index} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* ───────────────── SPOTLIGHT ───────────────── */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="
                            overflow-hidden rounded-[3rem]
                            bg-gradient-to-br from-primary via-primary/95 to-secondary
                            shadow-[0_25px_80px_rgba(59,130,246,0.25)]
                        "
                    >
                        <div className="grid items-center gap-10 lg:grid-cols-2">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="relative aspect-[4/4.5] overflow-hidden"
                            >
                                <Image
                                    src={coaches[0].image}
                                    alt={coaches[0].name}
                                    fill
                                    className="object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </motion.div>

                            <div className="p-8 text-white md:p-14">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
                                    <Sparkles className="h-4 w-4" />
                                    Coach Spotlight
                                </div>

                                <h2 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                                    {coaches[0].name}
                                </h2>

                                <p className="mt-3 text-lg text-white/80">
                                    {coaches[0].role}
                                </p>

                                <blockquote className="mt-8 text-2xl font-bold leading-relaxed">
                                    “{coaches[0].quote}”
                                </blockquote>

                                <p className="mt-8 max-w-xl leading-relaxed text-white/80">
                                    PlayPro Academy percaya bahwa setiap anak memiliki potensi
                                    besar untuk berkembang ketika didampingi coach yang tepat,
                                    suportif, dan memahami proses belajar anak.
                                </p>

                                <div className="mt-10 flex flex-wrap gap-3">
                                    {coaches[0].certifications.map((item) => (
                                        <div
                                            key={item}
                                            className="
                                                rounded-full border border-white/20
                                                bg-white/10 px-4 py-2 text-sm font-medium
                                                backdrop-blur-md
                                            "
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ───────────────── STATS ───────────────── */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                value: "25+",
                                label: "Professional Coaches",
                                icon: Trophy,
                            },
                            {
                                value: "1.000+",
                                label: "Active Students",
                                icon: Users,
                            },
                            {
                                value: "8+",
                                label: "Cities",
                                icon: CalendarDays,
                            },
                            {
                                value: "95%",
                                label: "Parent Satisfaction",
                                icon: Star,
                            },
                        ].map((stat, index) => (
                            <StatCard
                                key={stat.label}
                                value={stat.value}
                                label={stat.label}
                                icon={stat.icon}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── CTA ───────────────── */}
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />

                <div className="container relative z-10 mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                            Ready to Meet Our Coaches?
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Mulai perjalanan olahraga terbaik anak bersama coach profesional
                            dan lingkungan belajar yang positif.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/free-trial">Book Free Trial</Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="
                                    border-white/20 bg-white/10 text-white
                                    hover:bg-white hover:text-primary
                                "
                                asChild
                            >
                                <Link href="/schedules-booking">
                                    View Schedule
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}