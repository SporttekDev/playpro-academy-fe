import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3">

      {/* LEFT SIDE - LOGIN FORM */}
      <div className="flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Login untuk melanjutkan ke dashboard
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE / DESIGN */}
      <div className="hidden lg:flex lg:col-span-2 relative overflow-hidden">

        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
          alt="Login Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-start text-center pt-24 text-white mx-auto">
          <h2 className="text-5xl font-bold max-w-2xl leading-tight">
            Manage Your Business More Efficiently
          </h2>

          <p className="mt-6 max-w-xl text-lg text-white/80">
            Pantau data, laporan, dan aktivitas bisnis dalam satu dashboard modern.
          </p>
        </div>
      </div>
    </div>
  )
}