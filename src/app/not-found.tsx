// #7 — Global 404 not-found page
import Link from "next/link";
import { Home, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — Page Not Found",
    description: "The page you are looking for doesn't exist.",
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-stone-50 to-stone-100 p-6">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
                {/* Big 404 */}
                <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-[var(--g-card-bg)] border border-[var(--g-card-border)]">
                    <span className="text-5xl font-black text-foreground/20 select-none">404</span>
                </div>

                {/* Copy */}
                <div>
                    <h1 className="text-2xl font-black text-foreground">Page not found</h1>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full">
                    <Link
                        href="/menu"
                        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary text-white hover:bg-primary/90 px-6 py-3.5 text-sm font-black transition-all active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                    >
                        <Search size={14} />
                        Browse Menu
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-[var(--g-card-border)] bg-[var(--g-surface-bg)] px-6 py-3.5 text-sm font-bold text-foreground hover:bg-[var(--g-surface-hover)] transition-all"
                    >
                        <Home size={14} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
