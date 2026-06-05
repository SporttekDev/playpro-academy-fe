"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    Check,
    CalendarDays,
    Clock3,
    ShieldCheck,
    Sparkles,
    Trophy,
    Users,
    HeartHandshake,
    BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MembershipPlan {
    name: string
    price: string
    description: string
    badge?: string
    featured?: boolean
    features: string[]
}

interface ProgramData {
    label: string
    heading: string
    description: string
    plans: MembershipPlan[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const membershipPrograms: Record<string, ProgramData> = {
    toddler: {
        label: "Toddler Program",
        heading: "Membership untuk anak usia dini yang aktif dan eksploratif",
        description:
            "Dirancang untuk membangun motorik, keberanian, dan kebiasaan aktif anak sejak dini melalui pendekatan multisport yang fun dan aman.",
        plans: [
            {
                name: "Starter",
                price: "Rp499K",
                description: "Cocok untuk anak yang baru mulai mencoba aktivitas olahraga.",
                features: [
                    "1x training / minggu",
                    "4 session / bulan",
                    "Certified coach",
                    "Progress monitoring",
                    "Free trial eligible",
                ],
            },
            {
                name: "Growth",
                price: "Rp899K",
                description:
                    "Pilihan favorit orang tua untuk perkembangan anak yang lebih konsisten.",
                badge: "Most Popular",
                featured: true,
                features: [
                    "2x training / minggu",
                    "8 session / bulan",
                    "Monthly progress report",
                    "Priority booking",
                    "Free special event access",
                ],
            },
            {
                name: "Elite",
                price: "Rp1.499K",
                description:
                    "Program intensif untuk anak yang sangat aktif dan ingin berkembang lebih cepat.",
                features: [
                    "Unlimited classes",
                    "Coach evaluation",
                    "Exclusive activities",
                    "Priority support",
                    "Premium merchandise",
                ],
            },
        ],
    },
    junior: {
        label: "Junior Program",
        heading: "Membership terarah untuk anak yang siap berkembang lebih serius",
        description:
            "Program junior membantu anak membangun skill, disiplin, teamwork, dan kepercayaan diri melalui latihan yang lebih terstruktur.",
        plans: [
            {
                name: "Starter",
                price: "Rp699K",
                description:
                    "Program dasar untuk mulai membangun konsistensi latihan anak.",
                features: [
                    "1x training / minggu",
                    "4 session / bulan",
                    "Skill evaluation",
                    "Training report",
                    "Free trial eligible",
                ],
            },
            {
                name: "Growth",
                price: "Rp1.199K",
                description:
                    "Paket terbaik untuk perkembangan skill dan konsistensi latihan.",
                badge: "Most Popular",
                featured: true,
                features: [
                    "2x training / minggu",
                    "8 session / bulan",
                    "Monthly evaluation",
                    "Priority class booking",
                    "Competition preparation",
                ],
            },
            {
                name: "Elite",
                price: "Rp1.899K",
                description:
                    "Untuk anak yang ingin latihan lebih intensif dan kompetitif.",
                features: [
                    "Unlimited classes",
                    "Advanced training",
                    "Performance tracking",
                    "Private coach session",
                    "Exclusive academy access",
                ],
            },
        ],
    },
}

const benefits = [
    {
        title: "Certified Coaches",
        description: "Didampingi coach profesional berpengalaman menangani anak.",
        icon: Trophy,
    },
    {
        title: "Safe Environment",
        description: "Fasilitas aman dan nyaman untuk anak beraktivitas.",
        icon: ShieldCheck,
    },
    {
        title: "Progress Report",
        description: "Pantau perkembangan anak setiap bulan secara detail.",
        icon: BarChart3,
    },
    {
        title: "Flexible Schedule",
        description: "Pilihan jadwal fleksibel sesuai kebutuhan orang tua.",
        icon: CalendarDays,
    },
    {
        title: "Multisport Curriculum",
        description: "Anak belajar berbagai olahraga dengan metode fun learning.",
        icon: Sparkles,
    },
    {
        title: "Parent Community",
        description: "Terhubung dengan komunitas orang tua aktif lainnya.",
        icon: HeartHandshake,
    },
]

const steps = [
    {
        title: "Choose Program",
        description: "Pilih program toddler atau junior sesuai usia anak.",
    },
    {
        title: "Book Trial",
        description: "Jadwalkan sesi trial gratis bersama coach kami.",
    },
    {
        title: "Meet Our Coach",
        description: "Anak akan dibimbing langsung oleh coach profesional.",
    },
    {
        title: "Start Training",
        description: "Mulai perjalanan olahraga terbaik bersama PlayPro Academy.",
    },
]

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
}

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
}

function BenefitCard({
    title,
    description,
    icon: Icon,
    index,
}: {
    title: string
    description: string
    icon: React.ElementType
    index: number
}) {
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
                rounded-[2rem] border border-slate-200 bg-white
                p-7 shadow-sm transition-all duration-300
                hover:shadow-xl
            "
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {description}
            </p>
        </motion.div>
    )
}

function PlanCard({
    plan,
    programLabel,
    index,
}: {
    plan: MembershipPlan
    programLabel: string
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
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
            className={`
                relative overflow-hidden rounded-[2rem] border bg-white p-8
                transition-all duration-300 hover:shadow-2xl
                ${plan.featured
                    ? "border-primary shadow-[0_20px_60px_rgba(59,130,246,0.18)] lg:scale-[1.03]"
                    : "border-slate-200 shadow-sm"
                }
            `}
        >
            {plan.badge ? (
                <div className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                </div>
            ) : null}

            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {programLabel}
                </p>

                <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                    {plan.name}
                </h3>

                <div className="mt-5 flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">
                        {plan.price}
                    </span>
                    <span className="pb-1 text-slate-500">/ month</span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-600">
                    {plan.description}
                </p>
            </div>

            <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                            <Check className="h-3.5 w-3.5 text-primary" />
                        </div>

                        <p className="text-sm text-slate-700">{feature}</p>
                    </div>
                ))}
            </div>

            <Button
                size="lg"
                className="mt-10 w-full"
                variant={plan.featured ? "default" : "outline"}
            >
                Choose Plan
            </Button>
        </motion.div>
    )
}

function StepCard({
    step,
    index,
}: {
    step: { title: string; description: string }
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: "easeOut",
            }}
            className="relative"
        >
            {index !== steps.length - 1 ? (
                <div className="absolute left-[50%] top-10 hidden h-[2px] w-full bg-slate-200 lg:block" />
            ) : null}

            <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="
                        flex h-20 w-20 items-center justify-center
                        rounded-full bg-primary text-2xl font-extrabold text-white
                        shadow-[0_20px_50px_rgba(59,130,246,0.25)]
                    "
                >
                    {index + 1}
                </motion.div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {step.description}
                </p>
            </div>
        </motion.div>
    )
}

function SchedulePreviewCard({
    title,
    city,
    day,
    time,
    index,
}: {
    title: string
    city: string
    day: string
    time: string
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: 0.38,
                delay: index * 0.05,
                ease: "easeOut",
            }}
            whileHover={{ y: -4, transition: { duration: 0.15, ease: "easeOut" } }}
            className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                    <Clock3 className="h-5 w-5 text-primary" />
                </div>

                <div>
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500">{city}</p>
                </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p>{day}</p>
                <p>{time}</p>
            </div>
        </motion.div>
    )
}

export default function MembershipPage() {
    const reduceMotion = useReducedMotion()
    const [activeProgram, setActiveProgram] =
        useState<keyof typeof membershipPrograms>("toddler")

    const currentProgram = membershipPrograms[activeProgram]

    const schedulePreview = useMemo(
        () => [
            {
                title: "Toddler Class",
                city: "Bandung",
                day: "Saturday",
                time: "10.00 - 11.00",
            },
            {
                title: "Junior Basketball",
                city: "Bekasi",
                day: "Sunday",
                time: "09.00 - 10.00",
            },
            {
                title: "Junior Soccer",
                city: "Jakarta",
                day: "Saturday",
                time: "11.00 - 12.00",
            },
        ],
        []
    )

    return (
        <main className="relative overflow-hidden bg-white">
            {/* Background Blur */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                x: [0, 18, 0],
                                y: [0, -12, 0],
                            }
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
                            : {
                                x: [0, -18, 0],
                                y: [0, 12, 0],
                            }
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
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mx-auto max-w-5xl text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            Membership Packages
                        </div>

                        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
                            Flexible Membership
                            <span className="text-primary"> For Every Young Athlete</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
                            Mulai perjalanan olahraga anak dengan program yang fleksibel,
                            fun, dan terarah bersama coach profesional PlayPro Academy.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/free-trial">
                                    Book Free Trial
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" asChild>
                                <Link href="/schedules-booking">View Schedule</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ───────────────── MEMBERSHIP ───────────────── */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    {/* Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex justify-center"
                    >
                        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => setActiveProgram("toddler")}
                                className={`
                                    rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300
                                    ${activeProgram === "toddler"
                                        ? "bg-secondary text-white shadow-lg"
                                        : "text-slate-600"
                                    }
                                `}
                            >
                                Toddler
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveProgram("junior")}
                                className={`
                                    rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300
                                    ${activeProgram === "junior"
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-slate-600"
                                    }
                                `}
                            >
                                Junior
                            </button>
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProgram}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="mx-auto mt-10 max-w-3xl text-center"
                        >
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                {currentProgram.heading}
                            </h2>

                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                {currentProgram.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Cards */}
                    <motion.div
                        key={`plans-${activeProgram}`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="mt-16 grid gap-8 lg:grid-cols-3"
                    >
                        {currentProgram.plans.map((plan, index) => (
                            <PlanCard
                                key={plan.name}
                                plan={plan}
                                programLabel={currentProgram.label}
                                index={index}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───────────────── BENEFITS ───────────────── */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            Why Parents Choose
                            <span className="text-primary"> PlayPro Academy</span>
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Lebih dari sekadar tempat olahraga, PlayPro membantu anak berkembang
                            secara aktif, percaya diri, dan disiplin.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <BenefitCard
                                key={benefit.title}
                                index={index}
                                {...benefit}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── HOW IT WORKS ───────────────── */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            How Membership Works
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Mulai perjalanan olahraga anak hanya dalam beberapa langkah mudah.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid gap-8 lg:grid-cols-4">
                        {steps.map((step, index) => (
                            <StepCard key={step.title} step={step} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── SCHEDULE PREVIEW ───────────────── */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                                Weekly Training Schedule
                            </h2>

                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Pilihan jadwal fleksibel untuk toddler dan junior di berbagai kota.
                            </p>
                        </div>

                        <Button size="lg" asChild>
                            <Link href="/schedules-booking">View Full Schedule</Link>
                        </Button>
                    </motion.div>

                    <div className="mt-14 grid gap-6 lg:grid-cols-3">
                        {schedulePreview.map((item, index) => (
                            <SchedulePreviewCard
                                key={item.title}
                                index={index}
                                {...item}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── FINAL CTA ───────────────── */}
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
                            Ready to Start Your Child’s Sports Journey?
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Bergabung bersama ribuan keluarga yang telah mempercayakan
                            perjalanan olahraga anak mereka kepada PlayPro Academy.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/free-trial">Book Free Trial</Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
                                asChild
                            >
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    )
}