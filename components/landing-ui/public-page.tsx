import Navbar from "@/components/landing-ui/navbar"
import Footer from "@/components/landing-ui/footer"
import WhatsAppCTA from "@/components/landing-ui/whatsapp-cta"

export default function PublicPage({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
            <WhatsAppCTA />
        </>
    )
}