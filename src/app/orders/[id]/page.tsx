"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    useGetOrderQuery,
    useCancelOrderMutation,
    useGetReceiptQuery,
    useSubmitRatingMutation,
} from "@/store/api/ordersApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { resolveStorageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import {
    Clock, CheckCircle, Coffee, Loader2,
    XCircle, Receipt, Package, MapPin, RefreshCw,
    Banknote, CreditCard, QrCode, ChefHat, Bell, ShoppingBag, BellRing, Star, Sparkles, CheckCircle2,
} from "lucide-react";
import type { OrderStatus } from "@/types";

/* ── Order Progress Steps ────────────────────────────────────────────────── */
const STEPS = [
    { key: "PENDING_PAYMENT", label: "Payment", icon: Banknote, desc: "Waiting for payment" },
    { key: "CONFIRMED", label: "Confirmed", icon: Clock, desc: "Order received" },
    { key: "PREPARING", label: "Preparing", icon: ChefHat, desc: "Being made for you" },
    { key: "READY", label: "Ready", icon: Bell, desc: "Ready for pickup!" },
    { key: "SERVED", label: "Served", icon: CheckCircle, desc: "Enjoy!" },
] as const;

/* ── Status colours ─────────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bar: string; glow: string; bg: string }> = {
    SERVED: { bar: "bg-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,.25)]", bg: "bg-emerald-500/10" },
    READY: { bar: "bg-teal-400", glow: "shadow-[0_0_20px_rgba(45,212,191,.25)]", bg: "bg-teal-400/10" },
    PREPARING: { bar: "bg-sky-500", glow: "shadow-[0_0_20px_rgba(14,165,233,.20)]", bg: "bg-sky-500/10" },
    CONFIRMED: { bar: "bg-primary text-primary-foreground shadow-sm", glow: "shadow-[0_0_20px_rgba(245,158,11,.20)]", bg: "bg-primary/10" },
    PENDING_PAYMENT: { bar: "bg-orange-400", glow: "shadow-[0_0_20px_rgba(251,146,60,.20)]", bg: "bg-orange-400/10" },
    CANCELLED: { bar: "bg-red-500", glow: "", bg: "bg-red-500/10" },
};

const PAYMENT_ICON: Record<string, typeof Banknote> = {
    CASH: Banknote,
    CARD: CreditCard,
    QR_CODE: QrCode,
};

const STAR_FEEDBACK_LABEL: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Great",
    5: "Excellent",
};

const QUICK_COMMENT_CHIPS = [
    "Great taste",
    "Perfect temperature",
    "Friendly service",
    "Fast preparation",
    "Nice presentation",
];

function formatDate(iso: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
}

/* ── Estimated wait time (#36) ─────────────────────────────────── */
const AVG_PREP_MINUTES: Record<string, number> = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 3,
    PREPARING: 4,
    READY: 0,
    SERVED: 0,
    CANCELLED: 0,
};

function estimatedWait(status: string, itemCount: number): string | null {
    const base = AVG_PREP_MINUTES[status];
    if (base == null || base === 0) return null;
    const extra = Math.ceil(itemCount / 3);   // +1 min per 3 items
    const total = base + extra;
    return total <= 1 ? "< 1 min" : `~${total} min`;
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isAuthenticated = useAuthGuard();

    // Adaptive polling:
    //   PREPARING → 5 s   (customer is most impatient here)
    //   CONFIRMED / READY → 8 s
    //   SERVED / CANCELLED → 0 (stop)
    const [pollingInterval, setPollingInterval] = useState(8000);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    const { data: order, isLoading, refetch } = useGetOrderQuery(id, {
        pollingInterval,
        skip: !isAuthenticated,
    });
    const orderStatus = order?.status;

    // Adjust polling speed based on live status
    useEffect(() => {
        if (!orderStatus) return;
        setLastUpdatedAt(new Date());
        if (orderStatus === "SERVED" || orderStatus === "CANCELLED") {
            setPollingInterval(0);        // stop polling — terminal state
        } else if (orderStatus === "PREPARING") {
            setPollingInterval(5000);     // fast
        } else {
            setPollingInterval(8000);     // normal
        }
    }, [orderStatus]);

    const isLive = pollingInterval > 0;
    const [streamLive, setStreamLive] = useState(false);
    const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
    const [submitRating, { isLoading: submittingRating }] = useSubmitRatingMutation();

    const [ratingStars, setRatingStars] = useState(5);
    const [ratingComment, setRatingComment] = useState("");
    const [ratingProductId, setRatingProductId] = useState<string>("");
    const [ratingMessage, setRatingMessage] = useState<string | null>(null);
    const [ratingError, setRatingError] = useState<string | null>(null);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    // ── "Ready" notification state ──────────────────────────────────────────
    const prevStatusRef = useRef<string | undefined>(undefined);
    const [showReadyBanner, setShowReadyBanner] = useState(false);
    const [dismissedReady, setDismissedReady] = useState(false);

    useEffect(() => {
        if (!orderStatus) return;
        // Detect transition INTO READY from any other status
        if (orderStatus === "READY" && prevStatusRef.current !== "READY" && !dismissedReady) {
            setShowReadyBanner(true);
        }
        prevStatusRef.current = orderStatus;
    }, [dismissedReady, orderStatus]);

    useEffect(() => {
        if (!order?.items?.length) return;
        if (!ratingProductId) {
            setRatingProductId(order.items[0].productId);
        }
    }, [order?.id, order?.items, ratingProductId]);

    useEffect(() => {
        if (!isAuthenticated || !orderStatus) return;
        if (orderStatus === "SERVED" || orderStatus === "CANCELLED") return;

        const base = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!base || !token) return;

        const controller = new AbortController();

        const connect = async () => {
            try {
                const response = await fetch(`${base}/api/customer/orders/${id}/stream`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "text/event-stream",
                    },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    setStreamLive(false);
                    return;
                }

                setStreamLive(true);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done || controller.signal.aborted) break;

                    buffer += decoder.decode(value, { stream: true });
                    const events = buffer.split("\n\n");
                    buffer = events.pop() ?? "";

                    for (const evt of events) {
                        if (!evt.trim()) continue;
                        // Backend emits "status" events on each order transition.
                        if (evt.includes("event: status") || evt.includes("event:status")) {
                            void refetch();
                        }
                    }
                }
            } catch {
                setStreamLive(false);
            }
        };

        void connect();

        return () => {
            setStreamLive(false);
            controller.abort();
        };
    }, [id, isAuthenticated, orderStatus, refetch]);

    const handleSubmitRating = async () => {
        if (!order || !ratingProductId) return;

        setRatingError(null);
        setRatingMessage(null);

        if (ratingStars <= 2 && ratingComment.trim().length < 8) {
            setRatingError("Please add a short comment so we can improve your experience.");
            return;
        }

        try {
            await submitRating({
                orderId: id,
                body: {
                    productId: ratingProductId,
                    stars: ratingStars,
                    comment: ratingComment.trim() || undefined,
                },
            }).unwrap();
            setRatingMessage("Thanks for your feedback.");
            setRatingSubmitted(true);
        } catch (err) {
            const message = (err as { data?: { message?: string } })?.data?.message;
            setRatingError(message ?? "Unable to submit your rating.");
        }
    };

    const skipReceipt =
        !isAuthenticated || !order || !["SERVED", "READY", "CONFIRMED", "PREPARING"].includes(order.status);
    const { data: receipt } = useGetReceiptQuery(id, { skip: skipReceipt });

    if (!isAuthenticated) return null;

    const currentStepIndex = STEPS.findIndex((s) => s.key === order?.status);
    const isCancelled = order?.status === "CANCELLED";
    const canCancel =
        order?.status === "PENDING_PAYMENT" || order?.status === "CONFIRMED";

    const colors = STATUS_COLORS[order?.status ?? ""] ?? STATUS_COLORS["CONFIRMED"];
    const PayIcon = PAYMENT_ICON[receipt?.paymentMethod ?? ""] ?? Banknote;
    const isReady = order?.status === "READY";

    return (
        <div className="min-h-screen" style={{ background: "var(--background)" }}>

            {/* ══ READY NOTIFICATION OVERLAY ════════════════════════════════ */}
            {showReadyBanner && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    style={{ zIndex: 999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                        style={{ animation: "readyPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
                    >
                        {/* Green top */}
                        <div className="bg-emerald-500 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                            <div
                                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 mb-4"
                                style={{ animation: "bellShake 0.6s ease 0.5s both" }}
                            >
                                <BellRing size={40} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white leading-tight">Your order is<br />ready! 🎉</h2>
                            <p className="mt-2 text-emerald-100 text-sm font-medium">
                                {order?.orderType === "DINE_IN"
                                    ? `Please collect from the counter — Table ${order.tableNumber}`
                                    : "Please come collect your order at the counter"}
                            </p>
                        </div>
                        {/* Order summary */}
                        <div className="bg-[#1a1520] px-6 py-5 space-y-3">
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Your items</p>
                                {order?.items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm py-0.5">
                                        <span className="text-foreground">{item.quantity}× {item.productName}</span>
                                        <span className="font-semibold text-foreground">{formatCurrency(item.unitPrice * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-emerald-500/20 mt-2 pt-2 flex justify-between font-bold text-foreground">
                                    <span>Total</span>
                                    <span className="text-emerald-400">{formatCurrency(order?.totalPrice ?? 0)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowReadyBanner(false); setDismissedReady(true); }}
                                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all py-3.5 text-white font-black text-sm tracking-wide"
                            >
                                Got it! 👍
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes readyPop {
                            from { opacity: 0; transform: scale(0.85) translateY(20px); }
                            to   { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes bellShake {
                            0%,100% { transform: rotate(0deg); }
                            20%     { transform: rotate(-18deg); }
                            40%     { transform: rotate(18deg); }
                            60%     { transform: rotate(-12deg); }
                            80%     { transform: rotate(8deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* ══ READY TOP BANNER (persistent after dismissing overlay) ═══ */}
            {isReady && dismissedReady && (
                <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-emerald-500 px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                            <BellRing size={16} className="text-white" style={{ animation: "bellShake 1.5s ease infinite" }} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white leading-tight">Your order is ready!</p>
                            <p className="text-xs text-emerald-100">
                                {order?.orderType === "DINE_IN" ? `Collect at the counter · Table ${order.tableNumber}` : "Come pick it up at the counter"}
                            </p>
                        </div>
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-white animate-ping shrink-0" />
                    <style>{`
                        @keyframes bellShake {
                            0%,90%,100% { transform: rotate(0deg); }
                            92%  { transform: rotate(-12deg); }
                            96%  { transform: rotate(12deg); }
                            98%  { transform: rotate(-8deg); }
                        }
                    `}</style>
                </div>
            )}

            <AppHeader
                backHref="/orders"
                backLabel="Orders"
                title="Order Details"
                className="border-white/8 bg-[#0d0c14]/90"
                right={
                    <div className="flex items-center gap-2">
                        {streamLive && (
                            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live
                            </span>
                        )}
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 shadow-sm transition hover:border-primary/50 hover:text-primary active:scale-95"
                        >
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                }
            />

            <main className="mx-auto max-w-xl px-4 py-5 sm:px-6 space-y-3 animate-fade-in">

                {/* ── Loading ── */}
                {isLoading && (
                    <div className="flex flex-col items-center gap-4 py-24">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Loader2 size={28} className="animate-spin text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Loading your order…</p>
                    </div>
                )}

                {/* ── Not found ── */}
                {!isLoading && !order && (
                    <div className="flex flex-col items-center gap-4 py-24 text-center">
                        <ShoppingBag size={40} className="text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Order not found.</p>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/orders">Back to Orders</Link>
                        </Button>
                    </div>
                )}

                {!isLoading && order && (
                    <>
                        {/* ══ Order Meta Card ══════════════════════════════════════════ */}
                        <div className={`rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 p-5 overflow-hidden relative`}>
                            {/* Coloured left bar */}
                            <div className={`absolute inset-y-0 left-0 w-1 ${colors.bar}`} />

                            <div className="pl-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                                            Order #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                            {order.orderType === "DINE_IN"
                                                ? <><MapPin size={13} className="text-primary" /> Dine In · Table {order.tableNumber}</>
                                                : <><Package size={13} className="text-primary" /> Takeaway</>
                                            }
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                            <Clock size={11} /> Placed {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                    <StatusBadge status={order.status as OrderStatus} />
                                </div>

                                {/* Total */}
                                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                    <span className="text-sm text-muted-foreground">Order Total</span>
                                    <span className="text-lg font-extrabold text-primary">{formatCurrency(order.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ══ Progress Tracker ══════════════════════════════════════════ */}
                        {!isCancelled && (
                            <div className="rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 p-5">
                                <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/40">
                                    Order Progress
                                </h3>

                                {/* Steps row */}
                                <div className="relative flex items-start justify-between">
                                    {/* Connector track behind the dots */}
                                    <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-muted/80" style={{ zIndex: 0 }}>
                                        <div
                                            className={`h-full ${colors.bar} transition-all duration-700 ease-out`}
                                            style={{
                                                width: currentStepIndex < 0 ? "0%" :
                                                    `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    {STEPS.map((step, i) => {
                                        const done = i <= currentStepIndex;
                                        const active = i === currentStepIndex;
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2" style={{ flex: 1 }}>
                                                <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 ${active
                                                    ? `${colors.bar} border-white ring-2 ring-amber-300 ${colors.glow}`
                                                    : done
                                                        ? `${colors.bar} border-white`
                                                        : "border-white/15 bg-white/5"
                                                    }`}>
                                                    {done
                                                        ? <Icon size={13} color="white" />
                                                        : <div className="h-2 w-2 rounded-full bg-stone-300" />
                                                    }
                                                </div>
                                                <span className={`text-center text-[10px] leading-tight transition-colors ${active ? "font-bold text-foreground" :
                                                    done ? "font-medium text-muted-foreground" :
                                                        "text-muted-foreground"
                                                    }`} style={{ maxWidth: 56 }}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Current step description */}
                                {currentStepIndex >= 0 && (
                                    <div className={`mt-4 flex items-center gap-2.5 rounded-xl ${colors.bg} px-4 py-2.5`}>
                                        <div className={`h-2 w-2 rounded-full ${colors.bar} animate-pulse`} />
                                        <p className="text-xs font-semibold text-foreground">
                                            {STEPS[currentStepIndex]?.desc}
                                        </p>
                                        {isLive && (
                                            <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                </span>
                                                {lastUpdatedAt
                                                    ? `Updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                                                    : "Auto-refreshing…"}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Estimated wait time */}
                                {(() => {
                                    const eta = estimatedWait(order.status, order.items.length);
                                    return eta ? (
                                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-primary/10 px-4 py-2.5">
                                            <Clock size={12} className="text-primary shrink-0" />
                                            <p className="text-xs font-semibold text-primary">
                                                Estimated wait: <span className="font-black">{eta}</span>
                                            </p>
                                            <span className="ml-auto text-[9px] uppercase tracking-widest font-bold text-primary">Est.</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {/* Cancelled notice */}
                        {isCancelled && (
                            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-950/40 p-4">
                                <XCircle size={20} className="text-red-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-red-300">Order Cancelled</p>
                                    <p className="text-xs text-red-400/70 mt-0.5">This order has been cancelled. Place a new order to continue.</p>
                                </div>
                            </div>
                        )}

                        {/* ══ Items ════════════════════════════════════════════════════ */}
                        <div className="rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 p-5">
                            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-widest text-white/40">
                                Items Ordered
                            </h3>
                            <div className="divide-y divide-white/6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 py-3">
                                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 overflow-hidden border border-amber-400/20">
                                            {resolveStorageUrl(item.productImageUrl) ? (
                                                <Image
                                                    src={resolveStorageUrl(item.productImageUrl)!}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover"
                                                    sizes="36px"
                                                />
                                            ) : (
                                                <span className="text-lg">☕</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold text-foreground shrink-0">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                            </div>
                        </div>

                        {/* ══ Receipt (payment info) ════════════════════════════════════ */}
                        {receipt && (
                            <div className="rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 p-5">
                                <div className="mb-3.5 flex items-center gap-2">
                                    <Receipt size={14} className="text-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Payment Receipt
                                    </h3>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <PayIcon size={14} className="text-muted-foreground" />
                                            Payment method
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            {receipt.paymentMethod.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {receipt.paidAt && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Paid at</span>
                                            <span className="text-foreground font-medium text-xs">
                                                {formatDate(receipt.paidAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between border-t border-border pt-2.5 text-base font-extrabold text-foreground">
                                        <span>Total Paid</span>
                                        <span className="text-primary">{formatCurrency(receipt.totalPaid)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {order.status === "SERVED" && (
                            <div className="rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 p-5">
                                <div className="mb-3.5 flex items-center gap-2">
                                    <Star size={14} className="text-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Rate This Order
                                    </h3>
                                </div>

                                {ratingSubmitted ? (
                                    <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-200">Rating submitted</p>
                                                <p className="mt-1 text-xs text-emerald-100/80">
                                                    Thank you. Your feedback helps us improve quality and service.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer rating flow</p>
                                            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                                                <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-foreground/85">1. Pick product</div>
                                                <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-foreground/85">2. Select stars</div>
                                                <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-foreground/85">3. Add comment</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-muted-foreground">Product</label>
                                            <select
                                                value={ratingProductId}
                                                onChange={(e) => setRatingProductId(e.target.value)}
                                                className="h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-foreground outline-none focus:border-primary/50"
                                            >
                                                {order.items.map((item) => (
                                                    <option key={item.productId} value={item.productId} className="bg-[#1a1520]">
                                                        {item.productName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <label className="block text-xs text-muted-foreground">Stars</label>
                                                <span className="text-[11px] font-bold text-amber-300">{ratingStars}/5 • {STAR_FEEDBACK_LABEL[ratingStars]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRatingStars(star)}
                                                        className={`rounded-xl border p-2 transition ${star <= ratingStars
                                                            ? "border-amber-300/40 bg-amber-400/10 text-amber-300"
                                                            : "border-white/10 text-white/30 hover:text-white/60"
                                                            }`}
                                                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                                    >
                                                        <Star size={18} fill={star <= ratingStars ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-muted-foreground">Comment (optional)</label>
                                            <textarea
                                                rows={3}
                                                maxLength={500}
                                                value={ratingComment}
                                                onChange={(e) => setRatingComment(e.target.value)}
                                                className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                                                placeholder="How was your drink and service?"
                                            />

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {QUICK_COMMENT_CHIPS.map((chip) => (
                                                    <button
                                                        key={chip}
                                                        type="button"
                                                        onClick={() => {
                                                            setRatingComment((prev) => {
                                                                if (prev.toLowerCase().includes(chip.toLowerCase())) return prev;
                                                                return prev.trim() ? `${prev.trim()}. ${chip}` : chip;
                                                            });
                                                        }}
                                                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <Sparkles size={10} />
                                                            {chip}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="mt-1 text-right text-[11px] text-muted-foreground">{ratingComment.length}/500</p>
                                        </div>

                                        {ratingError && (
                                            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-2 text-xs text-red-300">{ratingError}</p>
                                        )}
                                        {ratingMessage && (
                                            <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-300">{ratingMessage}</p>
                                        )}

                                        <Button onClick={handleSubmitRating} disabled={submittingRating || !ratingProductId}>
                                            {submittingRating ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                                            {submittingRating ? "Submitting..." : "Submit Rating"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ Actions ══════════════════════════════════════════════════ */}
                        <div className="flex gap-3 pb-4">
                            {canCancel && (
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                    onClick={() => cancelOrder(id)}
                                    disabled={cancelling}
                                >
                                    {cancelling
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <XCircle size={15} />
                                    }
                                    Cancel Order
                                </Button>
                            )}
                            <Button asChild className="flex-1">
                                <Link href="/menu">
                                    <Coffee size={15} /> Order More
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
