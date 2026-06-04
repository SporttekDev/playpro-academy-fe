"use client"

import Image from "next/image"
import Link from "next/link"

import {
    ArrowRight,
    Award,
    BookOpen,
    Goal,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

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

const trustItems = [
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

// ─── Components ──────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
        inline-flex items-center gap-2 rounded-full
        border border-primary/10 bg-primary/5
        px-4 py-2 text-sm font-medium text-primary
      "
        >
            <Sparkles className="h-4 w-4" />
            {children}
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AboutUsPage() {
    return (
        <main className="overflow-hidden bg-white">
            {/* ───────────────── Hero ───────────────── */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pb-28">
                {/* Background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />

                    <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Content */}
                        <div>
                            <SectionBadge>About PlayPro Academy</SectionBadge>

                            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                                Growing Children Through
                                <span className="text-primary"> Sports & Confidence</span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                                PlayPro Academy hadir untuk membantu anak-anak berkembang
                                melalui olahraga yang fun, terarah, dan penuh semangat positif.
                                Kami percaya bahwa olahraga sejak dini membantu membangun
                                karakter, kepercayaan diri, dan kebiasaan hidup sehat.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Button size="xl" asChild>
                                    <Link href="/free-trial">
                                        Book Free Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>

                                <Button size="xl" variant="outline" asChild>
                                    <Link href="/class-programs">Explore Programs</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative">
                            <div
                                className="
                  absolute -left-8 -top-8 h-48 w-48 rounded-full
                  bg-primary/10 blur-3xl
                "
                            />

                            <div
                                className="
                  absolute -bottom-8 -right-8 h-48 w-48 rounded-full
                  bg-secondary/10 blur-3xl
                "
                            />

                            <div
                                className="
                  relative overflow-hidden rounded-[2.5rem]
                  border border-slate-200/60
                  shadow-[0_25px_80px_rgba(15,23,42,0.12)]
                "
                            >
                                <Image
                                    src="/images/galleries/gallery-9.png"
                                    alt="PlayPro Academy"
                                    width={1200}
                                    height={900}
                                    className="h-[520px] w-full object-cover object-center"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────── Story ───────────────── */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-14 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative overflow-hidden rounded-[2.5rem]">
                            <Image
                                src="/images/galleries/gallery-8.png"
                                alt="Our Story"
                                width={1200}
                                height={900}
                                className="h-[520px] w-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <SectionBadge>Our Story</SectionBadge>

                            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                                Membangun Generasi Aktif dan Percaya Diri
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
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────── Values ───────────────── */}
            <section className="bg-slate-50 py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <SectionBadge>Mission & Values</SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                            Nilai yang Menjadi Fondasi Kami
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Kami percaya bahwa olahraga adalah media terbaik untuk membantu
                            anak bertumbuh secara sehat, aktif, dan percaya diri.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {values.map((value) => {
                            const Icon = value.icon

                            return (
                                <div
                                    key={value.title}
                                    className="
                    rounded-[2rem] border border-slate-200/70
                    bg-white p-8
                    shadow-sm transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                  "
                                >
                                    <div
                                        className="
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-primary/10
                    "
                                    >
                                        <Icon className="h-7 w-7 text-primary" />
                                    </div>

                                    <h3 className="mt-6 text-2xl font-bold text-slate-900">
                                        {value.title}
                                    </h3>

                                    <p className="mt-4 leading-relaxed text-slate-600">
                                        {value.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ───────────────── Trust ───────────────── */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <SectionBadge>Why Parents Trust Us</SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                            Kenapa Orang Tua Memilih PlayPro Academy
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Kami menghadirkan pengalaman olahraga anak yang aman, modern, dan
                            terstruktur untuk mendukung tumbuh kembang terbaik mereka.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {trustItems.map((item) => {
                            const Icon = item.icon

                            return (
                                <div
                                    key={item.title}
                                    className="
                    rounded-[2rem] border border-slate-200/70
                    bg-white p-7
                    shadow-sm transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                  "
                                >
                                    <div
                                        className="
                      flex h-12 w-12 items-center justify-center
                      rounded-2xl bg-secondary/15
                    "
                                    >
                                        <Icon className="h-6 w-6 text-secondary" />
                                    </div>

                                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ───────────────── Coaches ───────────────── */}
            <section className="bg-slate-50 py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <SectionBadge>Our Coaches</SectionBadge>

                            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                                Coach Profesional dan Berpengalaman
                            </h2>
                        </div>

                        <Button variant="outline" asChild>
                            <Link href="/coach-list">
                                View All Coaches
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        {coaches.map((coach) => (
                            <div
                                key={coach.name}
                                className="
                  group overflow-hidden rounded-[2rem]
                  border border-slate-200/70 bg-white
                  shadow-sm transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl
                "
                            >
                                <div className="relative overflow-hidden">
                                    <Image
                                        src={coach.image}
                                        alt={coach.name}
                                        width={800}
                                        height={1000}
                                        className="
                      h-[380px] w-full object-cover
                      transition-transform duration-700
                      group-hover:scale-105
                    "
                                    />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {coach.name}
                                    </h3>

                                    <p className="mt-2 text-slate-600">{coach.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── CTA ───────────────── */}
            <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-br from-primary via-primary/95 to-secondary">

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                            Siap Memulai Perjalanan Olahraga Anak Anda?
                        </h2>

                        <p className="mt-6 text-lg leading-relaxed text-white/80">
                            Bergabung bersama PlayPro Academy dan bantu anak tumbuh lebih
                            aktif, percaya diri, dan sehat melalui olahraga yang menyenangkan.
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <Button size="xl" variant="secondary" asChild>
                                <Link href="/free-trial">
                                    Book Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>

                            <Button
                                size="xl"
                                variant="outline"
                                className="
                  border-white/20 bg-white/10 text-white
                  hover:bg-white hover:text-primary
                "
                                asChild
                            >
                                <Link href="/class-programs">Explore Programs</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}