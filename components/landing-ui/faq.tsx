"use client"

import Link from "next/link"

import {
    HelpCircle,
    MessageCircle,
    ShieldCheck,
    Users,
    Baby,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Minimal usia anak untuk bergabung di PlayPro Academy?",
        answer:
            "PlayPro Academy menerima siswa mulai dari usia toddler hingga junior dengan program dan pendekatan pembelajaran yang disesuaikan berdasarkan usia anak.",
    },
    {
        question: "Apakah tersedia free trial sebelum mendaftar?",
        answer:
            "Ya, kami menyediakan sesi free trial agar anak dan orang tua dapat merasakan suasana latihan serta metode pembelajaran PlayPro Academy terlebih dahulu.",
    },
    {
        question: "Apakah coach di PlayPro Academy bersertifikat?",
        answer:
            "Semua coach PlayPro Academy telah memiliki pengalaman dan sertifikasi sesuai bidang olahraga masing-masing untuk memastikan kualitas pembelajaran terbaik.",
    },
    {
        question: "Berapa kali latihan dilakukan dalam seminggu?",
        answer:
            "Jadwal latihan berbeda untuk setiap program dan cabang olahraga, namun umumnya dilakukan 1–3 kali per minggu sesuai paket yang dipilih.",
    },
    {
        question: "Apakah ada evaluasi perkembangan anak?",
        answer:
            "Ya, kami melakukan evaluasi perkembangan siswa secara berkala agar orang tua dapat memantau progres kemampuan dan perkembangan anak.",
    },
    {
        question: "Apakah orang tua diperbolehkan menunggu selama latihan?",
        answer:
            "Tentu. Kami menyediakan area tunggu yang nyaman bagi orang tua selama anak mengikuti sesi latihan.",
    },
]

export default function FAQSection() {
    return (
        <section className="relative overflow-hidden py-24">

            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4">

                <div className="grid items-start gap-14 lg:grid-cols-2">

                    {/* Left Content */}
                    <div className="w-full">

                        {/* Badge */}
                        <div
                            className="
                inline-flex items-center gap-2 rounded-full
                border border-primary/10 bg-primary/5
                px-4 py-2 text-sm font-medium text-primary
              "
                        >
                            <HelpCircle className="h-4 w-4" />
                            Frequently Asked Questions
                        </div>

                        {/* Heading */}
                        <h2
                            className="
                mt-5 text-4xl font-extrabold tracking-tight
                text-slate-900 md:text-5xl
              "
                        >
                            Pertanyaan yang
                            <span className="text-primary">
                                {" "}Sering Ditanyakan
                            </span>
                        </h2>

                        {/* Description */}
                        <p
                            className="
                mt-6 text-lg leading-relaxed
                text-slate-600
              "
                        >
                            Kami memahami bahwa orang tua ingin memastikan
                            anak mendapatkan lingkungan belajar olahraga
                            yang aman, nyaman, dan berkualitas.
                        </p>

                        {/* Mini Cards */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">

                            <div
                                className="
                  rounded-2xl border border-slate-200
                  bg-slate-50 p-5
                "
                            >
                                <ShieldCheck className="h-6 w-6 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-slate-900">
                                    Certified Coaches
                                </p>
                            </div>

                            <div
                                className="
                  rounded-2xl border border-slate-200
                  bg-slate-50 p-5
                "
                            >
                                <Users className="h-6 w-6 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-slate-900">
                                    500+ Parents
                                </p>
                            </div>

                            <div
                                className="
                  rounded-2xl border border-slate-200
                  bg-slate-50 p-5
                "
                            >
                                <Baby className="h-6 w-6 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-slate-900">
                                    Toddler & Junior
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div
                            className="
                mt-10 rounded-[2rem]
                border border-primary/10
                bg-primary/5 p-6
              "
                        >
                            <div className="flex items-start gap-4">

                                <div
                                    className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-2xl
                    bg-primary text-white
                  "
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Masih punya pertanyaan?
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Tim PlayPro Academy siap membantu Anda
                                        mendapatkan informasi terbaik untuk anak.
                                    </p>

                                    <Button
                                        size="lg"
                                        className="mt-5"
                                        asChild
                                    >
                                        <Link href="/contact">
                                            Contact Us
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right FAQ */}
                    <div>
                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="
                    overflow-hidden rounded-[1.5rem]
                    border border-slate-200/80
                    bg-white px-6 shadow-sm
                  "
                                >
                                    <AccordionTrigger
                                        className="
                      py-6 text-left text-base font-semibold
                      text-slate-900 hover:no-underline
                    "
                                    >
                                        {faq.question}
                                    </AccordionTrigger>

                                    <AccordionContent
                                        className="
                      pb-6 pt-0 text-sm leading-relaxed
                      text-slate-600
                    "
                                    >
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}