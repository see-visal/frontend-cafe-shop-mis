"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

function SuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "succeeded" | "failed">("loading");

    useEffect(() => {
        const clientSecret = searchParams.get("payment_intent_client_secret");
        if (!clientSecret || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            setStatus("failed");
            return;
        }

        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).then((stripe) => {
            if (!stripe) { setStatus("failed"); return; }
            stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
                setStatus(paymentIntent?.status === "succeeded" ? "succeeded" : "failed");
            });
        });
    }, [searchParams]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm font-medium">Verifying payment…</p>
            </div>
        );
    }

    if (status === "succeeded") {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 border border-green-500/30">
                    <CheckCircle size={32} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-foreground">Payment Successful</h1>
                    <p className="text-sm text-muted-foreground mt-1">Your order has been confirmed.</p>
                </div>
                <Link
                    href="/orders"
                    className="rounded-full bg-primary text-white px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all"
                >
                    View Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                <AlertCircle size={32} className="text-red-500" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-foreground">Payment Incomplete</h1>
                <p className="text-sm text-muted-foreground mt-1">Something went wrong. Please try again.</p>
            </div>
            <Link
                href="/checkout"
                className="rounded-full bg-primary text-white px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all"
            >
                Back to Checkout
            </Link>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: "var(--background)" }}>
            <Logo size="md" />
            <Suspense fallback={
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading…</p>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
