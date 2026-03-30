// ============================================================
// Frontend — Auth Guard Hook
// Redirects unauthenticated users to /login
// src/hooks/useAuthGuard.ts
// ============================================================
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

/**
 * Call this at the top of any page that requires authentication.
 * Returns true once the user is confirmed authenticated.
 */
export function useAuthGuard(): boolean {
    const router = useRouter();
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, router]);

    return isAuthenticated;
}
