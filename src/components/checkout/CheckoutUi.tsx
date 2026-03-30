"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Price } from "@/components/ui/Price";

export type CheckoutStep = "bag" | "scan" | "done";

export function StepIndicator({ current }: { current: CheckoutStep }) {
    const steps = [
        { key: "bag", label: "Order", num: 1 },
        { key: "scan", label: "Payment", num: 2 },
        { key: "done", label: "Confirmation", num: 3 },
    ] as const;
    const idx = steps.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center justify-center gap-1 py-4">
            {steps.map((step, i) => {
                const done = i < idx;
                const active = i === idx;
                return (
                    <div key={step.key} className="flex items-center">
                        <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white shadow-xl shadow-primary/25" : "bg-black/8 text-black/35"}`}>
                                {done ? <CheckCircle size={14} /> : step.num}
                            </div>
                            <span className={`text-xs font-semibold transition-colors ${active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>
                                {step.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`mx-3 h-px w-8 sm:w-12 transition-colors ${i < idx ? "bg-green-400" : "bg-black/10"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function CheckoutHeader({ onBackAction, title }: { onBackAction?: () => void; title: string }) {
    return (
        <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: "var(--g-card-border)", background: "var(--g-surface-bg)" }}>
            <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
                {onBackAction ? (
                    <button
                        onClick={onBackAction}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                ) : (
                    <Link
                        href="/menu"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} /> Menu
                    </Link>
                )}
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <Logo size="sm" />
                    <span className="font-bold text-foreground">{title}</span>
                </div>
            </div>
        </header>
    );
}

export function FieldError({ msg }: { msg: string | null }) {
    if (!msg) return null;
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={10} /> {msg}
        </p>
    );
}

export function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">{icon}</div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        </div>
    );
}

export function CheckoutPanel({ children }: { children: ReactNode }) {
    return (
        <section
            className="rounded-3xl p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8"
            style={{
                border: "1px solid var(--g-card-border)",
                background: "linear-gradient(180deg, var(--g-card-bg), var(--g-surface-bg))",
                backdropFilter: "blur(10px)",
            }}
        >
            {children}
        </section>
    );
}

export function AmountDueHeader({ amount, orderId }: { amount: number; orderId?: string | null }) {
    return (
        <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Order Placed · Amount Due</p>
            <Price amount={amount} size="xl" />
            <p className="mt-0.5 text-xs text-muted-foreground">
                Order <span className="font-mono font-semibold">#{orderId?.slice(0, 8).toUpperCase()}</span>
            </p>
        </div>
    );
}

export function RadioDot({ checked }: { checked: boolean }) {
    return (
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${checked ? "border-amber-500 bg-primary text-primary-foreground shadow-sm" : "border-foreground/20"}`}>
            {checked && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
    );
}

export function TelegramToggle({ value, onChangeAction }: { value: boolean; onChangeAction: (v: boolean) => void }) {
    return (
        <label
            className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300"
            style={{
                border: "1px solid var(--g-card-border)",
                background: "var(--g-soft-bg)",
            }}
        >
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-400">
                    <MessageCircle size={14} />
                </div>
                <div>
                    <span className="text-sm font-bold text-foreground/90">Contact via Telegram</span>
                    <p className="text-[11px] font-medium text-foreground/70">Get order updates instantly</p>
                </div>
            </div>
            <div className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${value ? "bg-primary text-primary-foreground shadow-sm" : "bg-foreground/10"}`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${value ? "translate-x-5.5" : "translate-x-1"}`} />
                <input type="checkbox" checked={value} onChange={(e) => onChangeAction(e.target.checked)} className="sr-only" />
            </div>
        </label>
    );
}

export function labelCls(hasError: string | null) {
    return `mb-2 block text-xs font-bold uppercase tracking-wider ${hasError ? "text-red-400" : "text-foreground/80"}`;
}
