"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
    Quote,
    Star,
    HeartHandshake,
    Users,
    UserRound,
    Baby,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Testimonial {
    name: string
    role: string
    review: string
}

interface TrustMetric {
    icon: React.ElementType
    value: string
    label: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const testimonials: Testimonial[] = [
    {
        name: "Amanda Putri",
        role: "Parent of Junior Class Student",
        review:
            "Awalnya anak saya sulit fokus dan kurang percaya diri saat bermain dengan teman-temannya. Setelah ikut PlayPro Academy, sekarang dia jauh lebih aktif, percaya diri, dan selalu semangat datang latihan setiap minggu.",
    },
    {
        name: "Rina Maharani",
        role: "Parent of Toddler Class Student",
        review:
            "Coach sangat sabar menghadapi anak-anak dan suasana latihannya benar-benar menyenangkan.",
    },
    {
        name: "Budi Santoso",
        role: "Parent of Basketball Class Student",
        review:
            "Anak saya yang tadinya pemalu sekarang jadi lebih berani dan punya banyak teman baru di academy. Terima kasih PlayPro!",
    },
    {
        name: "Dimas Saputra",
        role: "Parent of Football Class Student",
        review:
            "Saya suka karena perkembangan anak selalu dievaluasi secara berkala dan komunikasi dengan coach sangat terbuka dan responsif.",
    },
    {
        name: "Sari Dewi",
        role: "Parent of Swimming Class Student",
        review:
            "Fasilitas bersih, coach profesional, dan anak saya selalu pulang dengan senyum lebar setiap selesai latihan.",
    },
    {
        name: "Hendra Wijaya",
        role: "Parent of Futsal Class Student",
        review:
            "Program latihannya terstruktur dan disesuaikan dengan kemampuan anak. Perkembangan si kecil terasa nyata dari bulan ke bulan.",
    },
]

const trustMetrics: TrustMetric[] = [
    {
        icon: Users,
        value: "500+",
        label: "Trusted Parents",
    },
    {
        icon: Baby,
        value: "1.000+",
        label: "Active Students",
    },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating() {
    return (
        <div
            className="flex items-center gap-1"
            role="img"
            aria-label="Rating 5 dari 5 bintang"
        >
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    aria-hidden="true"
                    className="h-4 w-4 fill-primary text-primary"
                />
            ))}
        </div>
    )
}

function TestimonialCard({
    testimonial,
    index,
}: {
    testimonial: Testimonial
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.article
            aria-label={`Testimoni dari ${testimonial.name}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : index * 0.05,
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
                group relative break-inside-avoid overflow-hidden
                rounded-[1.5rem] border border-slate-200/70
                bg-white p-5 shadow-sm
                transition-all duration-300
                hover:shadow-xl
                sm:rounded-[2rem] sm:p-6
            "
        >
            <div
                aria-hidden="true"
                className="
                    absolute right-5 top-5 flex h-10 w-10 items-center
                    justify-center rounded-xl bg-primary/5
                    sm:right-6 sm:top-6 sm:h-12 sm:w-12 sm:rounded-2xl
                "
            >
                <Quote className="h-4 w-4 text-primary sm:h-6 sm:w-6" />
            </div>

            <StarRating />

            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                &quot;{testimonial.review}&quot;
            </p>

            <div className="mt-5 flex items-center gap-3 sm:mt-6">
                <div
                    aria-hidden="true"
                    className="
                        flex h-12 w-12 shrink-0 items-center justify-center
                        rounded-full bg-primary/10
                    "
                >
                    <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 sm:text-base">
                        {testimonial.name}
                    </h4>
                    <p className="text-xs text-slate-500 sm:text-sm">
                        {testimonial.role}
                    </p>
                </div>
            </div>
        </motion.article>
    )
}

function TrustMetricCard({
    icon: Icon,
    value,
    label,
    index,
}: TrustMetric & { index: number }) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
                duration: reduceMotion ? 0 : 0.3,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4"
        >
            <Icon aria-hidden="true" className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <div>
                <p className="text-base font-bold text-slate-900 sm:text-lg">{value}</p>
                <p className="text-xs text-slate-600 sm:text-sm">{label}</p>
            </div>
        </motion.div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestimonialSection() {
    const reduceMotion = useReducedMotion()

    const leftCol = testimonials.filter((_, i) => i % 2 === 0)
    const rightCol = testimonials.filter((_, i) => i % 2 !== 0)

    return (
        <motion.section
            aria-label="Testimoni orang tua PlayPro Academy"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden py-16 sm:py-24"
        >
            {/* Background */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                y: [0, -10, 0],
                                x: [0, 6, 0],
                            }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }
                    }
                    className="absolute right-[-120px] top-[-100px] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-3xl"
                />
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                y: [0, 12, 0],
                                x: [0, -6, 0],
                            }
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
                    className="absolute bottom-[-120px] left-[-100px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                        <HeartHandshake aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Parent Testimonials
                    </div>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl">
                        Apa Kata
                        <span className="text-primary"> Orang Tua</span>
                    </h2>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base md:text-lg">
                        Pengalaman nyata dari para orang tua yang telah mempercayakan
                        perjalanan olahraga anak mereka bersama PlayPro Academy.
                    </p>
                </motion.div>

                {/* Trust Metrics */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
                    {trustMetrics.map((metric, index) => (
                        <TrustMetricCard key={metric.label} index={index} {...metric} />
                    ))}
                </div>

                {/* Masonry Grid */}
                <div
                    role="list"
                    aria-label="Daftar testimoni"
                    className="
                        mt-10 grid grid-cols-1 gap-4
                        sm:mt-14 sm:grid-cols-2 sm:gap-6 sm:items-start
                    "
                >
                    <div className="sm:hidden flex flex-col gap-4">
                        {testimonials.map((item, index) => (
                            <div key={item.name} role="listitem">
                                <TestimonialCard testimonial={item} index={index} />
                            </div>
                        ))}
                    </div>

                    <div className="hidden sm:flex flex-col gap-6">
                        {leftCol.map((item, index) => (
                            <div key={item.name} role="listitem">
                                <TestimonialCard testimonial={item} index={index} />
                            </div>
                        ))}
                    </div>

                    <div className="hidden sm:flex flex-col gap-6 sm:pt-10">
                        {rightCol.map((item, index) => (
                            <div key={item.name} role="listitem">
                                <TestimonialCard testimonial={item} index={index + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    )
}