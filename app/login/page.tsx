import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import {
  Dumbbell,
  Target,
  Users,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const PILLARS = [
  {
    icon: Dumbbell,
    label: "Body Control",
    description: "Kuasai gerak tubuhmu",
  },
  {
    icon: Target,
    label: "Fundamental",
    description: "Bangun fondasi yang kuat",
  },
  {
    icon: Users,
    label: "Teamwork",
    description: "Menang bersama tim",
  },
  {
    icon: Sparkles,
    label: "Social Skill",
    description: "Tumbuh bersama komunitas",
  },
]

export default function LoginPage() {
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-3 overflow-hidden">

      {/* ─── LEFT: LOGIN FORM ─────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center bg-background p-6 lg:p-12">
        <Link
          href="/"
          className=" absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/20 hover:text-primary hover:shadow-sm sm:left-6 sm:top-6 sm:px-4 sm:text-sm "
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />

          <span className="hidden xs:inline">
            Back to Home
          </span>
        </Link>
        <div className="w-full max-w-sm">

          <LoginForm />

        </div>
      </div>

      {/* ─── RIGHT: HERO PANEL ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:col-span-2 relative overflow-hidden min-h-dvh">

        {/* Background Image */}
        <Image
          src="/images/login-bg.png"
          alt="Login Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Dark + gradient overlays */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-transparent" />

        {/* Decorative left chevron */}
        <div className="absolute left-0 top-0 w-0 h-0
          border-t-[50vh] border-t-transparent
          border-b-[50vh] border-b-transparent
          border-l-[300px] border-l-white" />

        {/* Centre mascot / logo image */}
        <div className="absolute inset-0 flex items-center justify-center px-10">
          <div className="relative w-full max-w-[1000px] xl:max-w-[1100px] 2xl:max-w-[1200px] aspect-square">
            <Image
              src="/images/bocil.png"
              alt="Logo PPA"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* ── Top tagline block ── */}
        <div className="relative z-10 flex flex-col items-center justify-start text-center
                        pt-16 px-10 text-white mx-auto w-full">

          {/* Main heading */}
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold max-w-2xl leading-[1.1] tracking-tight drop-shadow-lg">
            Be a{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary-foreground bg-primary px-3 py-0.5 rounded-md">
                Pro Player
              </span>
            </span>
            <br />
            with Playpro Academy
          </h2>

          {/* Sub-tagline */}
          <div className="mt-5 flex items-center gap-3 text-white/70 text-base font-medium tracking-wider select-none">
            <span className="h-px w-10 bg-white/40" />
            <span>Move</span>
            <span className="text-white/30">·</span>
            <span>Play</span>
            <span className="text-white/30">·</span>
            <span>Grow</span>
            <span className="h-px w-10 bg-white/40" />
          </div>

        </div>

        {/* ── Bottom pillars row ── */}
        <div className="absolute bottom-8 xl:bottom-12 left-0 right-0 z-10
                        flex items-end justify-center gap-6 px-10">
          {PILLARS.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-2 text-center"
            >
              {/* Circle icon */}
              <div className="w-20 h-20 xl:w-24 xl:h-24 rounded-full
                              bg-white/10 border border-white/25 backdrop-blur-md
                              flex items-center justify-center
                              shadow-lg shadow-black/30
                              transition-all duration-300
                              group-hover:bg-primary/70 group-hover:border-primary
                              group-hover:scale-110">
                <Icon className="w-7 h-7 text-white drop-shadow" strokeWidth={1.8} />
              </div>

              {/* Label */}
              <span className="text-white text-xs font-bold tracking-wide leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}