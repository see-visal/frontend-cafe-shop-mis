"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, ClipboardList, LogOut, ChevronDown } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useLogoutMutation } from "@/store/api/authApi";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";

/**
 * Authenticated user menu with dropdown.
 * Displays the user's name and a dropdown with My Orders, Profile, Sign Out.
 */
export function UserMenu() {
    const { t } = useI18n();
    const user = useAppSelector((s) => s.auth.user);
    const [logout] = useLogoutMutation();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Render a neutral placeholder during SSR / before hydration
    if (!mounted) {
        return (
            <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
        );
    }

    const displayName = user?.givenName || user?.username || "Account";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white/78 px-3.5 py-2 text-sm font-semibold text-stone-800 shadow-[0_8px_18px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all hover:bg-white/92 dark:border-white/12 dark:bg-white/7 dark:text-foreground dark:hover:bg-white/12"
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-stone-700 dark:bg-white/10 dark:text-white/85">
                    <User size={13} />
                </span>
                <span className="max-w-25 truncate">{displayName}</span>
                <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-47.5 overflow-hidden rounded-2xl border border-black/10 bg-white/88 backdrop-blur-xl shadow-[0_20px_48px_rgba(0,0,0,0.24)] dark:border-white/10 dark:bg-[rgba(18,15,28,0.96)]">
                    <Link
                        href="/orders"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-black/4 dark:text-foreground dark:hover:bg-white/7"
                    >
                        <ClipboardList size={14} /> {t("auth.orders")}
                    </Link>
                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 border-t border-black/10 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-black/4 dark:border-white/8 dark:text-foreground dark:hover:bg-white/7"
                    >
                        <User size={14} /> {t("auth.profile")}
                    </Link>
                    <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="flex w-full items-center gap-2 border-t border-black/10 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/12 dark:border-white/8 dark:text-red-400 dark:hover:bg-red-500/15"
                    >
                        <LogOut size={14} /> {t("auth.logout")}
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Auth nav for unauthenticated state: Login + Sign Up links.
 */
export function AuthNav() {
    const { t } = useI18n();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Render a neutral placeholder during SSR / before hydration
    if (!mounted) {
        return <div className="h-8 w-32 rounded-full bg-muted animate-pulse" />;
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/login">{t("auth.login")}</Link>
            </Button>
            <Button size="sm" asChild>
                <Link href="/register">{t("auth.register")}</Link>
            </Button>
        </div>
    );
}

