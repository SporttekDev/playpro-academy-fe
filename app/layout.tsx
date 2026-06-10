import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://playpro-academy.id";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "PlayPro Academy",
    template: "%s | PlayPro Academy",
  },

  description:
    "PlayPro Academy adalah akademi olahraga modern untuk anak dan remaja yang berfokus pada teknik, karakter, disiplin, dan prestasi melalui program pelatihan profesional.",

  keywords: [
    "PlayPro Academy",
    "akademi olahraga",
    "sekolah olahraga anak",
    "pelatihan sepak bola",
    "pelatihan basket",
    "sports academy Indonesia",
    "youth sports training",
    "akademi olahraga profesional",
    "pelatihan toddler",
    "motorik anak",
    "padel",
    "tennis",
    "soccer",
  ],

  authors: [{ name: "PlayPro Academy" }],
  creator: "PlayPro Academy",
  publisher: "PlayPro Academy",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "PlayPro Academy",
    title: "PlayPro Academy",
    description:
      "PlayPro Academy adalah akademi olahraga modern untuk anak dan remaja yang berfokus pada teknik, karakter, disiplin, dan prestasi melalui program pelatihan profesional.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PlayPro Academy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PlayPro Academy",
    description:
      "Akademi olahraga modern untuk anak dan remaja.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`antialiased ${poppins.className}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}