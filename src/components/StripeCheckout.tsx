"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be set in .env.local
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

interface StripeCheckoutProps {
    clientSecret: string;
    onSuccess: () => void | Promise<void>;
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void | Promise<void> }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Here you would redirect if you want the redirect flow,
                // But we recommend setting redirect="if_required" for SPA behavior.
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Record payment and move to done (payment before barista starts)
            await onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-xl p-4 bg-white/7 border border-white/10">
            <PaymentElement id="payment-element" />
            <Button
                disabled={isLoading || !stripe || !elements}
                className="w-full h-12 text-lg font-bold shadow-lg mt-4 bg-primary/90 hover:bg-amber-700 text-white"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isLoading ? "Processing..." : "Pay Now"}
            </Button>
            {message && <div className="text-sm font-semibold text-red-500 mt-2">{message}</div>}
        </form>
    );
}

export function StripeCheckout({ clientSecret, onSuccess }: StripeCheckoutProps) {
    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#d97706', // amber-600
        },
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm onSuccess={onSuccess} />
            </Elements>
        </div>
    );
}
