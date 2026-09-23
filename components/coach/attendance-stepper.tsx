"use client"

import { Fragment } from "react"
import { Check } from "lucide-react"

type StepState = "done" | "active" | "pending"

function cx(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ")
}

function resolveState(done: boolean, active: boolean): StepState {
    if (done) return "done"
    if (active) return "active"
    return "pending"
}

export function AttendanceStepper({
    hasCheckedIn,
    hasCheckedOut,
}: {
    hasCheckedIn: boolean
    hasCheckedOut: boolean
}) {
    const steps: { label: string; state: StepState }[] = [
        { label: "Check-in", state: resolveState(hasCheckedIn, !hasCheckedIn) },
        { label: "Check-out", state: resolveState(hasCheckedOut, hasCheckedIn && !hasCheckedOut) },
    ]

    return (
        <div className="flex items-center">
            {steps.map((step, idx) => (
                <Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={cx(
                                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                                step.state === "done" &&
                                    "border-emerald-500 bg-emerald-500 text-white",
                                step.state === "active" &&
                                    "border-primary bg-primary text-white",
                                step.state === "pending" &&
                                    "border-slate-200 bg-white text-slate-400"
                            )}
                        >
                            {step.state === "done" ? <Check className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span
                            className={cx(
                                "text-xs font-semibold",
                                step.state === "done" && "text-emerald-600",
                                step.state === "active" && "text-primary",
                                step.state === "pending" && "text-slate-400"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>

                    {idx < steps.length - 1 && (
                        <div
                            className={cx(
                                "mx-2 mb-5 h-0.5 flex-1 rounded-full transition-colors",
                                hasCheckedIn ? "bg-emerald-500" : "bg-slate-200"
                            )}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    )
}