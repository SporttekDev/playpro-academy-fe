import Link from "next/link"
import { Button } from "@/components/ui/button"

function buildWhatsAppUrl(phone: string, message: string) {
    const cleanedPhone = phone.replace(/\D/g, "")
    const encodedMessage = encodeURIComponent(message)

    return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`
}

type WhatsAppButtonProps = {
    phone: string
    message: string
    label: string
    variant?: "default" | "outline" | "secondary"
    size?: "default" | "sm" | "lg" | "xl"
    className?: string
    disabled?: boolean
}

export function WhatsAppButton({
    phone,
    message,
    label,
    variant = "default",
    size = "lg",
    className,
    disabled = false,
}: WhatsAppButtonProps) {
    const href = buildWhatsAppUrl(phone, message)

    return (
        <Button
            asChild
            variant={variant}
            size={size}
            className={className}
            disabled={disabled}
        >
            <Link href={href} target="_blank" rel="noopener noreferrer">
                {disabled ? "Class Full" : label}
            </Link>
        </Button>
    )
}