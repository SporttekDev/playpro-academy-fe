"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    ExternalLink,
    MapPin,
    Navigation,
    Sparkles,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// ─── Types ───────────────────────────────────────────────────────────────────

interface BranchLocation {
    name: string
    address: string
    schedules: string[]
    mapsUrl: string
}

interface CityBranch {
    city: string
    students: string
    pinPosition: {
        top?: string
        bottom?: string
        left?: string
        right?: string
    }
    branches: BranchLocation[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const branches: CityBranch[] = [
    {
        city: "Bekasi",
        students: "350+ Students",
        pinPosition: {
            top: "28%",
            left: "18%",
        },
        branches: [
            {
                name: "Decathlon Summarecon Bekasi",
                address:
                    "Jl. Bulevar Ahmad Yani, RT.007/RW.003, Harapan Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142",
                schedules: [
                    "Selasa • 16.00 - 17.00 • Toddler",
                    "Sabtu • 10.00 - 11.00 • Toddler",
                ],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Decathlon+Summarecon+Bekasi",
            },
            {
                name: "Estadio Arena Bekasi",
                address:
                    "Jl. Raya Perjuangan No.66, RT.003/RW.008, Marga Mulya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17142",
                schedules: [
                    "Sabtu • 11.00 - 12.00 • Junior Basketball",
                    "Minggu • 09.00 - 10.00 • Toddler",
                    "Minggu • 10.00 - 11.00 • Junior Soccer",
                ],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Estadio+Arena+Bekasi",
            },
            {
                name: "Arena Sport Center VIDA Bekasi",
                address:
                    "Jl. Alun Alun Utara No.2 Bumipala, Padurenan, Mustika Jaya, Kota Bekasi, Jawa Barat 17156",
                schedules: ["Minggu • 16.00 - 17.00 • Toddler & Junior"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Arena+Sport+Center+Bekasi",
            },
        ],
    },
    {
        city: "Karawang",
        students: "120+ Students",
        pinPosition: {
            top: "24%",
            right: "20%",
        },
        branches: [
            {
                name: "Resinda Sport Center",
                address:
                    "Jl. Resinda, Purwadana, Telukjambe Timur, Karawang, Jawa Barat 41361",
                schedules: ["Sabtu • 16.00 - 17.00 • Toddler & Junior"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Resinda+Futsal+Karawang",
            },
        ],
    },
    {
        city: "Bandung",
        students: "250+ Students",
        pinPosition: {
            bottom: "22%",
            left: "24%",
        },
        branches: [
            {
                name: "Bakjer Arena",
                address:
                    "Jl. Babakan Jeruk IIID No.11, Sukagalih, Sukajadi, Kota Bandung, Jawa Barat 40163",
                schedules: ["Minggu • 10.00 - 11.00 • Toddler", "Minggu • 11.00 - 12.00 • Junior"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bakjer+Arena+Bandung",
            },
        ],
    },
    {
        city: "Jakarta",
        students: "400+ Students",
        pinPosition: {
            top: "4%",
            right: "40%",
        },
        branches: [
            {
                name: "Brickhouse The East",
                address: "Jl. Radin Inten II, Duren Sawit, Jakarta Timur 13440",
                schedules: ["Minggu • 08.00 - 09.00 • Junior", "Minggu • 09.00 - 10.00 • Toddler"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brickhouse+The+East+Jakarta",
            },
            {
                name: "HiPlay Arena",
                address: "Jl. Pegangsaan Dua No.16, Kelapa Gading, Jakarta Utara 14250",
                schedules: ["Sabtu • 10.00 - 11.00 • Toddler", "Sabtu • 11.00 - 12.00 • Junior"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=HiPlay+Arena+Kelapa+Gading",
            },
            {
                name: "Decathlon Pondok Indah",
                address: "Jl. Metro Pondok Indah No.3, Kebayoran Lama, Jakarta Selatan 12310",
                schedules: ["Sabtu • 11.00 - 12.00 • Toddler", "Sabtu • 12.00 - 13.00 • Junior"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Decathlon+Pondok+Indah",
            },
        ],
    },
    {
        city: "Tangerang",
        students: "150+ Students",
        pinPosition: {
            top: "52%",
            right: "12%",
        },
        branches: [
            {
                name: "Respect Basketball Arena",
                address:
                    "BSD City, De Latinos, Rawa Buntu, Serpong, Tangerang Selatan, Banten 15318",
                schedules: ["Sabtu • 10.00 - 11.00 • Toddler", "Sabtu • 11.00 - 12.00 • Toddler"],
                mapsUrl: "https://www.google.com/maps/search/?api=1&query=Respect+Basketball+Arena+BSD",
            },
        ],
    },
]

// ─── Branch Card ─────────────────────────────────────────────────────────────

function BranchCard({
    branch,
    isActive,
    onClick,
}: {
    branch: CityBranch
    isActive: boolean
    onClick: () => void
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            whileHover={{ y: -3, transition: { duration: 0.15, ease: "easeOut" } }}
            className={`
                group shrink-0 rounded-[1.5rem]
                border p-4 text-left transition-all duration-300
                hover:shadow-xl

                min-w-[220px] w-[220px]
                lg:w-full lg:min-w-0

                ${isActive
                    ? "border-primary bg-primary text-white shadow-xl"
                    : "border-slate-200 bg-white"
                }
            `}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`
                        flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
                        transition-colors duration-200
                        ${isActive ? "bg-white/20" : "bg-primary/10"}
                    `}
                >
                    <MapPin
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-white" : "text-primary"
                            }`}
                    />
                </div>

                <div>
                    <h3
                        className={`text-base font-bold ${isActive ? "text-white" : "text-slate-900"
                            }`}
                    >
                        {branch.city}
                    </h3>

                    <div
                        className={`mt-1 flex items-center gap-1.5 text-sm ${isActive ? "text-white/80" : "text-slate-500"
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        {branch.students}
                    </div>
                </div>
            </div>
        </motion.button>
    )
}

// ─── Interactive Map ─────────────────────────────────────────────────────────

function InteractiveMap({
    branches,
    activeBranch,
    onSelect,
    onBack,
}: {
    branches: CityBranch[]
    activeBranch: CityBranch | null
    onSelect: (branch: CityBranch) => void
    onBack: () => void
}) {
    const reduceMotion = useReducedMotion()

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <AnimatePresence mode="wait">
                {!activeBranch && (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative aspect-[1/1] lg:aspect-[1.8/1]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-secondary/10" />

                        <motion.div
                            animate={
                                reduceMotion
                                    ? undefined
                                    : {
                                        y: [0, -6, 0],
                                        opacity: [0.65, 0.9, 0.65],
                                    }
                            }
                            transition={
                                reduceMotion
                                    ? undefined
                                    : {
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }
                            }
                            className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
                        />
                        <motion.div
                            animate={
                                reduceMotion
                                    ? undefined
                                    : {
                                        y: [0, 4, 0],
                                        opacity: [0.55, 0.8, 0.55],
                                    }
                            }
                            transition={
                                reduceMotion
                                    ? undefined
                                    : {
                                        duration: 9,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }
                            }
                            className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
                        />

                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[0_20px_60px_rgba(59,130,246,0.35)]"
                        >
                            <Building2 className="h-10 w-10" />
                        </motion.div>

                        {branches.map((branch, index) => (
                            <motion.button
                                key={branch.city}
                                type="button"
                                onClick={() => onSelect(branch)}
                                style={branch.pinPosition}
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
                                whileHover={{ scale: 1.08 }}
                                className="absolute z-20 flex flex-col items-center transition-all duration-300"
                            >
                                <span className="absolute h-12 w-12 animate-ping rounded-full bg-primary/20" />

                                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>

                                <span className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-md">
                                    {branch.city}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {activeBranch && (
                    <motion.div
                        key={activeBranch.city}
                        initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-secondary p-6 sm:p-8"
                    >
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />

                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Map
                        </button>

                        <div className="mt-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                                <Navigation className="h-4 w-4" />
                                Active City
                            </div>

                            <h3 className="mt-5 text-4xl font-extrabold text-white">
                                {activeBranch.city}
                            </h3>

                            <p className="mt-2 text-white/80">
                                {activeBranch.students} • {activeBranch.branches.length} Branches
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 max-h-[320px] overflow-y-auto pr-2">
                            {activeBranch.branches.map((location) => (
                                <div
                                    key={location.name}
                                    className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h4 className="text-lg font-bold text-white">
                                                {location.name}
                                            </h4>

                                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                                {location.address}
                                            </p>
                                        </div>

                                        <Link
                                            href={location.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {location.schedules.map((schedule) => (
                                            <span
                                                key={schedule}
                                                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
                                            >
                                                {schedule}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/free-trial">Book Free Trial</Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
                                asChild
                            >
                                <Link href="/locations">
                                    View Detail
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LocationsSection() {
    const [activeBranch, setActiveBranch] = useState<CityBranch | null>(null)
    const mapRef = useRef<HTMLDivElement | null>(null)

    const handleSelectBranch = (branch: CityBranch) => {
        setActiveBranch(branch)

        if (window.innerWidth < 1024) {
            setTimeout(() => {
                mapRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            }, 120)
        }
    }

    const handleBack = () => {
        setActiveBranch(null)

        if (window.innerWidth < 1024) {
            setTimeout(() => {
                mapRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            }, 120)
        }
    }

    return (
        <motion.section
            className="relative overflow-hidden bg-slate-50 pt-36 pb-24 sm:py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, 10, 0], x: [0, -4, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                        <Sparkles className="h-4 w-4" />
                        Our Locations
                    </div>

                    <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                        PlayPro Academy
                        <span className="text-primary"> Across Indonesia</span>
                    </h2>

                    <p className="mt-5 text-lg leading-relaxed text-slate-600">
                        Temukan cabang PlayPro Academy terdekat dan mulai perjalanan
                        olahraga terbaik untuk anak Anda.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
                    <div
                        className="
                            order-1 flex gap-3 overflow-x-auto pb-2
                            scrollbar-hide

                            lg:block lg:space-y-4 lg:overflow-visible lg:pb-0
                        "
                    >
                        {branches.map((branch) => (
                            <BranchCard
                                key={branch.city}
                                branch={branch}
                                isActive={activeBranch?.city === branch.city}
                                onClick={() => handleSelectBranch(branch)}
                            />
                        ))}
                    </div>

                    <div ref={mapRef} className="order-2 scroll-mt-28">
                        <InteractiveMap
                            branches={branches}
                            activeBranch={activeBranch}
                            onSelect={handleSelectBranch}
                            onBack={handleBack}
                        />
                    </div>
                </div>
            </div>
        </motion.section>
    )
}