"use client"

import Image from "next/image"
import { motion, Transition, useReducedMotion } from "framer-motion"
import {
    BadgeCheck,
    BookOpen,
    Camera,
    ClipboardCheck,
    Dumbbell,
    HeartHandshake,
    type LucideIcon,
} from "lucide-react"

interface Benefit {
    title: string
    description: string
    icon: LucideIcon
}

const benefits: Benefit[] = [
    {
        title: "Pembelajaran Intensif",
        description: "Metode latihan aktif dan terstruktur untuk perkembangan maksimal.",
        icon: Dumbbell,
    },
    {
        title: "Coach Bersertifikat",
        description: "Didampingi pelatih profesional dan berpengalaman.",
        icon: BadgeCheck,
    },
    {
        title: "Kurikulum Standar Nasional",
        description: "Materi latihan mengikuti standar pembelajaran olahraga nasional.",
        icon: BookOpen,
    },
    {
        title: "Kids Friendly",
        description: "Lingkungan belajar aman dan menyenangkan untuk anak.",
        icon: HeartHandshake,
    },
    {
        title: "Evaluasi Setiap Bulan",
        description: "Monitoring perkembangan anak dilakukan secara berkala.",
        icon: ClipboardCheck,
    },
    {
        title: "Dokumentasi Latihan",
        description: "Momen latihan terdokumentasi untuk laporan dan kenangan.",
        icon: Camera,
    },
]

const smoothTransition: Transition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1],
}

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 18,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: smoothTransition,
    },
}

function BenefitCard({ title, description, icon: Icon }: Benefit) {
    return (
        <motion.div
            role="listitem"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 34,
                mass: 0.7,
            }}
            whileHover={{
                y: -2,
                transition: { duration: 0.15, ease: "easeOut" },
            }}
            className="
          group relative overflow-hidden rounded-3xl
          border border-gray-200/70 bg-white/80 p-4
          backdrop-blur-sm shadow-sm
          transition-colors duration-200
          hover:border-primary/20 hover:shadow-lg
        "
        >
            <div
                aria-hidden="true"
                className="
            absolute right-0 top-0 h-24 w-24
            translate-x-1/3 -translate-y-1/3 rounded-full
            bg-primary/10 blur-2xl opacity-0
            transition-opacity duration-200 group-hover:opacity-100
          "
            />

            <div className="flex justify-center">
                <div
                    aria-hidden="true"
                    className="
              relative flex h-12 w-12 items-center justify-center
              rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5
              transition-all duration-200
              group-hover:scale-105 group-hover:from-primary group-hover:to-primary/80
            "
                >
                    <Icon className="h-5 w-5 text-primary transition-colors duration-200 group-hover:text-white" />
                </div>
            </div>

            <div className="relative mt-4">
                <h3 className="pointer-events-none text-center text-sm font-semibold leading-snug text-black">
                    {title}
                </h3>
                <p className="pointer-events-none mt-1.5 text-center text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </motion.div>
    )
}

export default function HeroSection() {
    const reduceMotion = useReducedMotion()

    return (
        <motion.section
            aria-label="Hero section"
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="relative overflow-hidden bg-gradient-to-b from-white via-white to-gray-50"
        >
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
                    className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl"
                />
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                y: [0, 12, 0],
                                x: [0, -8, 0],
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
                    className="absolute bottom-[-100px] right-[-100px] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        className="relative flex items-center justify-center"
                    >
                        <motion.div
                            animate={
                                reduceMotion
                                    ? undefined
                                    : {
                                        y: [0, -8, 0],
                                    }
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
                            aria-hidden="true"
                            className="absolute h-[320px] w-[320px] rounded-full bg-primary/5 blur-3xl sm:h-[420px] sm:w-[420px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 18 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative aspect-square w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[1000px]"
                        >
                            <Image
                                src="/images/hero-image.png"
                                alt="Anak-anak berlatih olahraga di PlayPro Academy"
                                fill
                                priority
                                className="object-contain"
                            />
                        </motion.div>
                    </motion.div>

                    <div className="w-full max-w-2xl mx-auto lg:mx-0">
                        <motion.div variants={itemVariants}>
                            <div
                                aria-label="PlayPro Academy"
                                className="
                  mb-4 inline-flex items-center rounded-full
                  border border-primary/10 bg-primary/5
                  px-3 py-1.5 text-xs font-medium text-primary
                  sm:px-4 sm:py-2 sm:text-sm
                "
                            >
                                PlayPro Academy
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="
                text-3xl font-extrabold leading-tight tracking-tight text-black
                sm:text-4xl md:text-5xl xl:text-6xl
              "
                        >
                            Tempat Terbaik untuk
                            <span className="text-primary"> Mengenalkan</span>
                            <br className="hidden sm:block" />{" "}
                            Olahraga Sejak Dini!
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="
                mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground
                sm:mt-5 sm:text-base md:text-lg
              "
                        >
                            Di Playpro Academy, kami percaya bahwa mengenalkan olahraga sejak
                            dini adalah kunci untuk membangun fondasi yang kuat bagi masa
                            depan anak-anak Anda.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            role="list"
                            aria-label="Keunggulan PlayPro Academy"
                            className="
                mt-6 grid gap-3
                grid-cols-2
                sm:mt-8 sm:gap-4
                md:grid-cols-3
              "
                        >
                            {benefits.map((benefit) => (
                                <BenefitCard key={benefit.title} {...benefit} />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}