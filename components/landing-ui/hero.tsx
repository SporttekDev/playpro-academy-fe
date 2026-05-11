"use client"

import Image from "next/image"
import {
    BadgeCheck,
    BookOpen,
    Camera,
    ClipboardCheck,
    Dumbbell,
    HeartHandshake,
    type LucideIcon,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Benefit {
    title: string
    description: string
    icon: LucideIcon
}

// ─── Data ────────────────────────────────────────────────────────────────────

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function BenefitCard({ title, description, icon: Icon }: Benefit) {
    return (
        <div
            role="listitem"
            className="
        group relative overflow-hidden rounded-3xl
        border border-gray-200/70 bg-white/80 p-4
        backdrop-blur-sm transition-all duration-300
        hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl
      "
        >
            {/* Hover Glow */}
            <div
                aria-hidden="true"
                className="
          absolute right-0 top-0 h-24 w-24
          translate-x-1/3 -translate-y-1/3 rounded-full
          bg-primary/10 blur-2xl opacity-0
          transition-opacity duration-300 group-hover:opacity-100
        "
            />

            {/* Icon */}
            <div className="flex justify-center">
                <div
                    aria-hidden="true"
                    className="
            relative flex h-12 w-12 items-center justify-center
            rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5
            transition-all duration-300
            group-hover:scale-110 group-hover:from-primary group-hover:to-primary/80
          "
                >
                    <Icon className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-white" />
                </div>
            </div>

            {/* Content */}
            <div className="relative mt-4">
                <h3 className="pointer-events-none text-center text-sm font-semibold leading-snug text-black">
                    {title}
                </h3>
                <p className="pointer-events-none mt-1.5 text-center text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroSection() {
    return (
        <section
            aria-label="Hero section"
            className="relative overflow-hidden bg-gradient-to-b from-white via-white to-gray-50"
        >
            {/* Background Decoration */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-100px] right-[-100px] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">

                    {/* Left — Hero Image */}
                    <div className="relative flex items-center justify-center">
                        <div
                            aria-hidden="true"
                            className="absolute h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl"
                        />
                        <div className="relative aspect-square w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[1000px]">
                            <Image
                                src="/images/hero-image.png"
                                alt="Anak-anak berlatih olahraga di PlayPro Academy"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Right — Content */}
                    <div className="w-full max-w-2xl mx-auto lg:mx-0">

                        {/* Badge */}
                        <div
                            aria-label="PlayPro Academy"
                            className="
                mb-4 inline-flex items-center rounded-full
                border border-primary/10 bg-primary/5
                px-3 py-1.5 text-xs font-medium text-primary
                sm:px-4 sm:py-2 sm:text-sm
              "
                        >
                            ⚽ PlayPro Academy
                        </div>

                        {/* Heading */}
                        <h1
                            className="
                text-3xl font-extrabold leading-tight tracking-tight text-black
                sm:text-4xl
                md:text-5xl
                xl:text-6xl
              "
                        >
                            Tempat Terbaik untuk
                            <span className="text-primary"> Mengenalkan</span>
                            <br className="hidden sm:block" />
                            {" "}Olahraga Sejak Dini!
                        </h1>

                        {/* Description */}
                        <p
                            className="
                mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground
                sm:mt-5 sm:text-base
                md:text-lg
              "
                        >
                            Di Playpro Academy, kami percaya bahwa mengenalkan olahraga sejak
                            dini adalah kunci untuk membangun fondasi yang kuat bagi masa
                            depan anak-anak Anda.
                        </p>

                        {/* Benefit Cards */}
                        <div
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
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}