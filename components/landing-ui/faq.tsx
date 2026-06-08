"use client"

import Link from "next/link"

import {
    HelpCircle,
    MessageCircle,
    ShieldCheck,
    Users,
    Baby,
    MapPin,
    PhoneCall,
} from "lucide-react"

import { motion, Transition } from "framer-motion"

import { Button } from "@/components/ui/button"
import { WhatsAppButton } from './whatsapp-button';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

type FAQItem = {
    question: string
    answer: React.ReactNode
}

const faqs: FAQItem[] = [
    {
        question:
            "Biaya apa saja yang perlu disiapkan untuk mengikuti kelas di PlayPro Academy?",
        answer: (
            <div className="space-y-3">
                <p>
                    Untuk mengikuti kelas di PlayPro Academy, terdapat{" "}
                    <strong>biaya registrasi</strong> yang dibayarkan satu kali pada saat
                    pendaftaran awal <strong>(Membership fee)</strong>, serta{" "}
                    <strong>biaya bulanan</strong> <strong>(Monthly fee)</strong> berupa
                    paket visit sesuai kelas yang dipilih.
                </p>

                <p>
                    Nominal biaya dapat berbeda tergantung jenis olahraga dan kategori
                    usia anak.
                </p>

                <p>
                    Untuk informasi lebih lengkap mengenai pilihan paket, jadwal, dan
                    rincian biaya, Mom &amp; Dad dapat langsung menghubungi admin
                    PlayPro Academy melalui WhatsApp berikut:
                </p>

                <Link
                    href="https://wa.me/62812XXXXXXXX"
                    target="_blank"
                    className="
            inline-flex items-center gap-2 rounded-full
            bg-primary px-4 py-2 text-sm font-semibold text-white
            transition hover:bg-primary/90
          "
                >
                    <PhoneCall className="h-4 w-4" />
                    Chat Admin via WhatsApp
                </Link>
            </div>
        ),
    },

    {
        question: "Di mana saja lokasi latihan PlayPro Academy tersedia?",
        answer: (
            <div className="space-y-3">
                <p>
                    Saat ini, PlayPro Academy tersedia di beberapa area seperti Jakarta,
                    Tangerang, Bekasi, Karawang, dan Bandung.
                </p>

                <p>
                    Untuk melihat informasi lokasi kelas secara lebih lengkap dan detail,
                    Mom &amp; Dad dapat mengakses halaman lokasi PlayPro Academy melalui
                    link berikut:
                </p>

                <Link
                    href="/locations"
                    className="
            inline-flex items-center gap-2 rounded-full
            bg-primary/5 px-4 py-2 text-sm font-semibold
            text-primary transition hover:bg-primary/10
          "
                >
                    <MapPin className="h-4 w-4" />
                    View Locations
                </Link>
            </div>
        ),
    },

    {
        question: "Apakah PlayPro Academy memiliki jadwal kelas tetap?",
        answer: (
            <div className="space-y-3">
                <p>
                    PlayPro Academy memiliki jadwal kelas yang sudah ditentukan di setiap
                    cabang.
                </p>

                <p>
                    Jadwal kelas dapat berbeda-beda tergantung lokasi dan program yang
                    dipilih.
                </p>

                <p>
                    Saat ini kelas tersedia pada hari Sabtu dan Minggu, serta beberapa
                    cabang tertentu juga menyediakan pilihan kelas di hari kerja
                    (weekdays).
                </p>

                <p>
                    Untuk informasi jadwal yang paling sesuai, Mom &amp; Dad dapat
                    berdiskusi langsung dengan admin PlayPro Academy sesuai cabang yang
                    diinginkan.
                </p>
            </div>
        ),
    },

    {
        question: "Bagaimana sistem membership di PlayPro Academy?",
        answer: (
            <div className="space-y-3">
                <p>
                    Sistem membership di PlayPro Academy diawali dengan pembayaran biaya
                    registrasi member yang dilakukan satu kali pada saat pendaftaran
                    awal.
                </p>

                <p>
                    Keanggotaan memberikan akses bagi si kecil untuk mengikuti berbagai
                    kegiatan dan program yang tersedia di PlayPro Academy.
                </p>

                <p>
                    Setelah registrasi, pembayaran kelas dilakukan menggunakan sistem{" "}
                    <strong>paket visit</strong> atau kunjungan latihan.
                </p>

                <p>
                    Paket visit ini bersifat fleksibel dan dapat digunakan sesuai jumlah
                    pertemuan yang dimiliki.
                </p>

                <p>
                    Untuk informasi lebih detail mengenai pilihan paket dan ketentuan
                    membership, Mom &amp; Dad dapat menghubungi admin PlayPro Academy.
                </p>
            </div>
        ),
    },

    {
        question: "Apakah PlayPro Academy menyediakan trial class?",
        answer: (
            <div className="space-y-3">
                <p>
                    PlayPro Academy menyediakan trial class yang dapat diikuti melalui
                    kelas reguler sesuai program yang tersedia.
                </p>

                <p>
                    Melalui sesi trial ini, si kecil dapat merasakan secara langsung
                    suasana latihan, metode pengajaran coach, aktivitas di kelas, serta
                    interaksi selama kegiatan berlangsung.
                </p>

                <p>
                    Setelah menghubungi admin, Mom &amp; Dad dapat memilih jadwal trial
                    yang paling sesuai dengan ketersediaan kelas di masing-masing cabang.
                </p>
            </div>
        ),
    },

    {
        question:
            "Mulai usia berapa anak dapat mengikuti latihan di PlayPro Academy? Apakah anak di luar kategori usia tetap bisa bergabung?",
        answer: (
            <div className="space-y-3">
                <p>
                    Program di PlayPro Academy tersedia untuk kategori{" "}
                    <strong>Toddler</strong> usia 2–5 tahun dan kategori{" "}
                    <strong>Junior</strong> usia 6–14 tahun.
                </p>

                <p>
                    Namun, karena perkembangan setiap anak dapat berbeda-beda,
                    penyesuaian kategori usia tetap dapat dipertimbangkan berdasarkan
                    kesiapan, kemampuan mengikuti arahan, serta kenyamanan anak saat
                    berada di kelas.
                </p>

                <p>
                    Mom &amp; Dad dapat berkonsultasi terlebih dahulu dengan admin
                    PlayPro Academy untuk menentukan program dan kategori yang paling
                    sesuai bagi si kecil.
                </p>
            </div>
        ),
    },

    {
        question:
            "Apakah anak dengan kebutuhan pendampingan khusus tetap dapat mengikuti kelas di PlayPro Academy?",
        answer: (
            <div className="space-y-3">
                <p>
                    Anak dengan kebutuhan pendampingan khusus pada tingkat ringan, seperti
                    speech delay, ADHD, maupun autism spectrum tingkat ringan, tetap dapat
                    mengikuti kegiatan di PlayPro Academy.
                </p>

                <p>
                    Terutama apabila anak masih dapat berinteraksi dan mengikuti arahan
                    sederhana selama kelas berlangsung.
                </p>

                <p>
                    Untuk memberikan pendampingan yang lebih optimal, PlayPro Academy
                    menyarankan program <strong>VIP Class</strong>.
                </p>

                <p>
                    Pada kelas ini, si kecil akan didampingi secara lebih personal oleh
                    coach sejak awal hingga akhir sesi latihan sehingga proses belajar dan
                    adaptasi di kelas dapat berjalan dengan lebih nyaman dan terarah.
                </p>
            </div>
        ),
    },

    {
        question: "Apa saja yang perlu dibawa saat latihan di PlayPro Academy?",
        answer: (
            <div className="space-y-3">
                <p>
                    Seluruh peralatan latihan telah disediakan oleh PlayPro Academy.
                </p>

                <p>
                    Si kecil hanya perlu membawa <strong>minum pribadi</strong> dan
                    menggunakan pakaian olahraga yang nyaman saat mengikuti kelas.
                </p>

                <p>
                    PlayPro Academy juga menyediakan t-shirt dan jersey yang dapat
                    digunakan sebagai seragam latihan anak selama mengikuti kegiatan di
                    kelas.
                </p>
            </div>
        ),
    },

    {
        question:
            "Berapa jumlah anak dalam satu sesi dan berapa lama durasi latihannya?",
        answer: (
            <div className="space-y-3">
                <p>
                    Jumlah peserta dalam satu sesi latihan umumnya tidak lebih dari 15
                    anak.
                </p>

                <p>
                    Namun, pada beberapa kelas dan cabang tertentu, jumlah peserta dapat
                    dibatasi kurang dari 10 anak agar proses pembelajaran dapat berjalan
                    lebih optimal.
                </p>

                <p>
                    Setiap sesi latihan berlangsung selama 60 menit untuk seluruh cabang
                    dan jenis olahraga.
                </p>

                <p>
                    Dalam durasi tersebut, kegiatan sudah mencakup pemanasan, aktivitas
                    inti, games atau fun activities, serta pendinginan.
                </p>
            </div>
        ),
    },

    {
        question:
            "Apa manfaat dan output utama dari program di PlayPro Academy?",
        answer: (
            <div className="space-y-3">
                <p>
                    Program di PlayPro Academy dirancang untuk membantu anak mendapatkan
                    pengalaman motorik dan pengenalan olahraga sejak dini melalui
                    aktivitas yang aktif, menyenangkan, dan terarah.
                </p>

                <p>
                    Selain perkembangan motorik, program latihan juga membantu membangun
                    rasa percaya diri, keberanian, kemampuan sosial, serta kemandirian
                    anak saat berinteraksi di lingkungan kelas.
                </p>

                <p>
                    Untuk membantu memantau perkembangan si kecil, PlayPro Academy juga
                    memiliki beberapa program evaluasi seperti rapor bulanan dan{" "}
                    <strong>assessment class</strong> yang diadakan secara berkala.
                </p>

                <p>
                    Melalui program ini, Mom &amp; Dad dapat melihat perkembangan anak
                    dari waktu ke waktu baik dari sisi kemampuan mengikuti aktivitas,
                    keberanian, maupun keterampilan dasar olahraga.
                </p>
            </div>
        ),
    },
]

const fadeUpTransition: Transition = {
    duration: 0.7,
    ease: "easeOut",
}

const faqItemTransition: Transition = {
    duration: 0.55,
    ease: "easeOut",
}

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: fadeUpTransition
    },
}

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const faqItemVariant = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: faqItemTransition
    },
}

function ContactCTA() {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 30,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
            }}
            transition={{
                duration: 0.7,
                ease: "easeOut",
            }}
            className="
                rounded-[2rem]
                border border-primary/10
                bg-primary/5 p-6
            "
        >
            <div className="flex items-start gap-4">
                <motion.div
                    animate={{
                        y: [0, -4, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="
                        flex h-12 w-12 shrink-0 items-center
                        justify-center rounded-2xl
                        bg-primary text-white
                    "
                >
                    <MessageCircle className="h-5 w-5" />
                </motion.div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Masih punya pertanyaan?
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Tim PlayPro Academy siap membantu Anda mendapatkan
                        informasi terbaik untuk anak.
                    </p>

                    {/* <Button
                        size="lg"
                        className="mt-5"
                        asChild
                    >
                        <Link
                            href="https://wa.me/62812XXXXXXXX"
                            target="_blank"
                        >
                            Contact Admin
                        </Link>
                    </Button> */}
                    <WhatsAppButton
                        className="mt-5"
                        phone="+6282131111549"
                        message="Halo admin PlayPro Academy, saya ingin menanyakan beberapa hal tentang PlayPro Academy. Mohon bantuannya, terima kasih."
                        label="Contact Admin"
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default function FAQSection() {
    return (
        <section className="relative overflow-hidden py-24">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    className="
        absolute right-[-120px] top-[-120px]
        h-[320px] w-[320px]
        rounded-full bg-secondary/10 blur-3xl
    "
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 25, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <div className="container mx-auto px-4">
                <motion.div
                    className="grid items-start gap-14 lg:grid-cols-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                    variants={staggerContainer}
                >
                    {/* Left Content */}
                    <motion.div className="w-full" variants={staggerContainer}>
                        {/* Badge */}
                        <motion.div
                            variants={fadeUp}
                            className="
                inline-flex items-center gap-2 rounded-full
                border border-primary/10 bg-primary/5
                px-4 py-2 text-sm font-medium text-primary
              "
                        >
                            <HelpCircle className="h-4 w-4" />
                            Frequently Asked Questions
                        </motion.div>

                        {/* Heading */}
                        <motion.h2
                            variants={fadeUp}
                            className="
                mt-5 text-4xl font-extrabold tracking-tight
                text-slate-900 md:text-5xl
              "
                        >
                            Pertanyaan yang
                            <span className="text-primary">
                                {" "}Sering Ditanyakan
                            </span>
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            variants={fadeUp}
                            className="
                mt-6 text-lg leading-relaxed
                text-slate-600
              "
                        >
                            Kami memahami bahwa orang tua ingin memastikan anak mendapatkan
                            lingkungan belajar olahraga yang aman, nyaman, dan berkualitas.
                        </motion.p>

                        {/* Mini Cards */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <motion.div
                                variants={faqItemVariant}
                                whileHover={{
                                    y: -4,
                                    scale: 1.02,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                                className="
                  rounded-2xl border border-slate-200
                  bg-slate-50 p-5
                "
                            >
                                <ShieldCheck className="h-6 w-6 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-slate-900">
                                    Certified Coaches
                                </p>
                            </motion.div>

                            <div
                                className="
                  rounded-2xl border border-slate-200
                  bg-slate-50 p-5
                "
                            >
                                <Users className="h-6 w-6 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-slate-900">
                                    Trusted Parents
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

                        {/* Desktop CTA */}
                        <div className="mt-10 hidden lg:block">
                            <ContactCTA />
                        </div>
                    </motion.div>

                    {/* Right FAQ */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.1,
                        }}
                        variants={staggerContainer}
                    >
                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            {faqs.map((faq, index) => (
                                <motion.div key={index} variants={faqItemVariant}>
                                    <AccordionItem
                                        value={`item-${index}`}
                                        className="
                                        overflow-hidden rounded-[1.5rem]
                                        border border-slate-200/80
                                        bg-white px-6 shadow-sm

                                        transition-all duration-300
                                        hover:border-primary/20
                                        hover:shadow-lg"
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
                                            overflow-hidden
                                            pb-6 pt-0
                                            text-sm leading-relaxed
                                            text-slate-600
                                            "
                                        >
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>

                        {/* Mobile CTA */}
                        <div className="mt-10 block lg:hidden">
                            <ContactCTA />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}