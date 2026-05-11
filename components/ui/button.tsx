import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-xl",
    "text-sm font-medium",
    "transition-all duration-200",
    "outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "active:scale-[0.98]",
    "shadow-sm",

    // SVG
    "[&_svg]:pointer-events-none",
    "[&_svg:not([class*='size-'])]:size-4",
    "shrink-0 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "hover:shadow-md",
        ].join(" "),

        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "hover:shadow-md",
        ].join(" "),

        outline: [
          "border border-border",
          "bg-background",
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "hover:shadow-md",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "hover:bg-accent",
          "hover:text-accent-foreground",
        ].join(" "),

        destructive: [
          "bg-destructive text-white",
          "hover:bg-destructive/90",
          "hover:shadow-md",
        ].join(" "),

        link: [
          "text-primary underline-offset-4",
          "hover:underline",
          "shadow-none",
          "p-0 h-auto",
        ].join(" "),

        success: [
          "bg-green-600 text-white",
          "hover:bg-green-700",
          "hover:shadow-md",
        ].join(" "),

        warning: [
          "bg-yellow-500 text-black",
          "hover:bg-yellow-600",
          "hover:shadow-md",
        ].join(" "),
      },

      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        "2xl": "h-14 px-10 text-lg",

        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },

      rounded: {
        default: "rounded-md",
        lg: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          rounded,
          className,
        })
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }