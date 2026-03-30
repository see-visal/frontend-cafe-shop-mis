"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
    backHref?: string;
    backLabel?: string;
    title: string;
    showLogo?: boolean;
    right?: React.ReactNode;
    className?: string;
}

/**
 * Shared sticky page header — mobile-first, premium finish.
 * Layout: [← back] | [logo?]  Title          [right slot]
 */
export function AppHeader({
    backHref,
    backLabel = "Back",
    title,
    showLogo = false,
    right,
    className,
}: AppHeaderProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-40 gm-panel border-b border-(--g-card-border)",
                className,
            )}
        >
            <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                {/* Left — back + title */}
                <div className="flex items-center gap-3 min-w-0">
                    {backHref && (
                        <>
                            <Link
                                href={backHref}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-lg py-1 pr-1 -ml-1 hover:bg-background"
                            >
                                <ArrowLeft size={16} />
                                <span className="hidden sm:inline font-medium">{backLabel}</span>
                            </Link>
                            <div className="h-4 w-px bg-muted/80 shrink-0" />
                        </>
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                        {showLogo && <Logo size="sm" />}
                        <span className="font-bold text-base sm:text-lg text-foreground truncate">{title}</span>
                    </div>
                </div>

                {/* Right slot and Global Theme Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle />
                    {right}
                </div>
            </div>
        </header>
    );
}
