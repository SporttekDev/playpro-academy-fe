import * as React from "react"

export function SectionTitle({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string
    title: string
    description: string
    action?: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                    {title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                    {description}
                </p>
            </div>

            {action ? <div>{action}</div> : null}
        </div>
    )
}