"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-sm transition-colors outline-none",
        // checked: warna primary solid
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // unchecked: track abu-abu yang jelas + border tegas
        "data-[state=unchecked]:bg-muted-foreground/30 data-[state=unchecked]:border-muted-foreground/50",
        "dark:data-[state=unchecked]:bg-muted-foreground/40 dark:data-[state=unchecked]:border-muted-foreground/60",
        // focus & disabled
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full shadow-md ring-0 transition-transform",
          // posisi
          "data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[22px]",
          // warna thumb: checked putih kontras, unchecked lebih gelap agar terlihat
          "data-[state=checked]:bg-primary-foreground",
          "data-[state=unchecked]:bg-muted-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }