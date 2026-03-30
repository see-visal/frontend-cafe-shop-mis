// #7 — Global error boundary for unexpected runtime errors
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to an error reporting service in production
        console.error("Unhandled error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-stone-50 to-stone-100 p-6">
            <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
                {/* Icon */}
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-50 border border-red-100">
                    <AlertTriangle size={40} className="text-red-400" />
                </div>

                {/* Copy */}
                <div>
                    <h1 className="text-2xl font-black text-foreground">Something went wrong</h1>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        An unexpected error occurred. Please try refreshing the page or go back to the home page.
                    </p>
                    {error.digest && (
                        <p className="mt-2 text-[10px] font-mono text-muted-foreground">Error ID: {error.digest}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary text-white hover:bg-primary/90 px-6 py-3.5 text-sm font-black transition-all active:scale-95 shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                    >
                        <RefreshCw size={14} />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border bg-white px-6 py-3.5 text-sm font-bold text-foreground hover:bg-background transition-all"
                    >
                        <Home size={14} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
