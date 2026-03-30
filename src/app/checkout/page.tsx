"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectCartItems, selectCartTotal,
    updateQuantity, removeItem, clearCart,
} from "@/store/slices/cartSlice";
import {
    usePlaceOrderMutation, usePayMutation, useGetReceiptQuery, useGenerateBakongQrMutation,
    useCheckBakongTransactionMutation, useValidatePromoMutation,
} from "@/store/api/ordersApi";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { formatCurrency } from "@/lib/utils";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";
import { Price } from "@/components/ui/Price";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AmountDueHeader,
    CheckoutPanel,
    CheckoutHeader,
    FieldError,
    RadioDot,
    SectionHeader,
    StepIndicator,
    TelegramToggle,
    labelCls,
} from "@/components/checkout/CheckoutUi";
import {
    ShoppingBag, Minus, Plus, Trash2, Coffee,
    MapPin, Package, CreditCard, Banknote, QrCode, Loader2,
    CheckCircle, Receipt, ScanLine, BadgeCheck,
    AlertCircle, Phone, User, FileText, MessageCircle, ChevronDown,
    Sparkles, Truck, Store,
} from "lucide-react";
import { StripeCheckout } from "@/components/StripeCheckout";
import { QRCodeSVG } from "qrcode.react";


/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
    {
        value: "QR_CODE",
        label: "ABA KHQR",
        icon: QrCode,
        desc: "Scan QR with any banking app",
        recommended: true,
    },
    { value: "CARD", label: "Card", icon: CreditCard, desc: "Visa / Mastercard" },
    { value: "CASH", label: "Cash at Counter", icon: Banknote, desc: "Pay when order is called" },
];

const PROVINCES = [
    "Phnom Penh", "Siem Reap", "Battambang", "Kandal", "Banteay Meanchey",
    "Kampong Cham", "Kampong Chhnang", "Kampong Speu", "Kampong Thom",
    "Kampot", "Kep", "Koh Kong", "Kratie", "Mondulkiri", "Oddar Meanchey",
    "Pailin", "Preah Sihanouk", "Preah Vihear", "Prey Veng", "Pursat",
    "Ratanakiri", "Stung Treng", "Svay Rieng", "Takeo", "Tboung Khmum",
];


/* ═════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   Real-world flow (pichpisey.shop pattern):
   ① Fill bag + info → ② Place order → ③ Pay (QR scan / cash / card) → ④ Done
═════════════════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
    const isAuthenticated = useAuthGuard();
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

    /* ── form ── */
    const [buyerName, setBuyerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [province, setProvince] = useState("");
    const [note, setNote] = useState("");
    const [contactViaTelegram, setContactViaTelegram] = useState(false);

    /* ── order config ── */
    const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("TAKEAWAY");
    const [tableNumber, setTableNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("QR_CODE");
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState<string | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [redeemLoyalty, setRedeemLoyalty] = useState(false);

    /* ─────────────────────────────────────────────────────────────────────
       FLOW STATE
       "bag"  → customer filling the form
       "scan" → order PLACED, awaiting QR payment confirmation from customer
       "done" → payment registered, show receipt
    ───────────────────────────────────────────────────────────────────── */
    const [step, setStep] = useState<"bag" | "scan" | "done">("bag");
    const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
    const [finalTotal, setFinalTotal] = useState<number>(0);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [qrConfirmed, setQrConfirmed] = useState(false);
    // Countdown before auto-confirming QR payment (seconds remaining, null = idle)
    const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
    const [qrString, setQrString] = useState<string | null>(null);
    const [qrError, setQrError] = useState<string | null>(null);
    // MD5 of the generated KHQR — used for automatic transaction polling
    const [qrMd5, setQrMd5] = useState<string | null>(null);
    // True once the Bakong API confirms the transaction automatically
    const [khqrAutoDetected, setKhqrAutoDetected] = useState(false);

    /* ─────────────────────────────────────────────────────────────────────
       DYNAMIC KHQR GENERATION
    ───────────────────────────────────────────────────────────────────── */
    const [generateQrMutation] = useGenerateBakongQrMutation();
    const [checkTransaction]   = useCheckBakongTransactionMutation();

    useEffect(() => {
        if (step !== "scan" || paymentMethod !== "QR_CODE" || !placedOrderId) return;
        setQrString(null);
        setQrError(null);
        setQrMd5(null);
        setKhqrAutoDetected(false);
        
        async function fetchQR() {
            try {
                // Call backend instead of generating on frontend
                const response = await generateQrMutation({
                    amount: finalTotal,
                    currency: "USD",
                    billNumber: placedOrderId!.slice(0, 15).toUpperCase(),
                    mobileNumber: process.env.NEXT_PUBLIC_BAKONG_MOBILE || '855963001940',
                    storeLabel: process.env.NEXT_PUBLIC_STORE_LABEL || 'SalSee Coffee',
                    terminalLabel: 'OnlineKHQR',
                }).unwrap();

                if (response?.data?.qr) {
                    setQrString(response.data.qr);
                    // Capture MD5 for automatic transaction polling
                    if (response.data?.md5) {
                        setQrMd5(response.data.md5);
                    }
                } else if (response?.qr) {
                    // Fallback just in case backend returns it directly
                    setQrString(response.qr);
                    if (response?.md5) setQrMd5(response.md5);
                } else {
                    const msg = response?.status?.message ?? 'Unknown KHQR error from backend';
                    console.error("KHQR generation failed:", response);
                    setQrError(`QR generation failed: ${msg}. Please ask staff for assistance.`);
                }
            } catch (err: unknown) {
                console.error("Failed to generate KHQR via backend", err);
                const msg = (err as { data?: { message?: string }; message?: string })?.data?.message
                    || (err as { message?: string })?.message
                    || "Unknown error";
                setQrError(`Could not generate the QR code (${msg}). Please ask staff for assistance.`);
            }
        }
        
        fetchQR();
    }, [step, paymentMethod, placedOrderId, finalTotal, generateQrMutation]);

    /* ── validation ── */
    const [touched, setTouch] = useState<Record<string, boolean>>({});
    const [showAllErrors, setShowAllErrors] = useState(false);

    /* ── API ── */
    const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();
    const [pay, { isLoading: paying }] = usePayMutation();
    const [validatePromo, { isLoading: validatingPromo }] = useValidatePromoMutation();

    /* ─────────────────────────────────────────────────────────────────────
       KHQR AUTO-DETECTION: Poll Bakong API every 5 s using the MD5 hash.
       When the bank confirms the transaction (responseCode === 0), the
       payment is recorded automatically — no manual checkbox required.
       The checkbox stays as a fallback if polling is unavailable.
    ───────────────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (
            step !== "scan" ||
            paymentMethod !== "QR_CODE" ||
            !qrMd5 ||
            !placedOrderId ||
            qrConfirmed ||
            paying
        ) return;

        const poll = setInterval(async () => {
            try {
                const result = await checkTransaction({ md5: qrMd5 }).unwrap();
                // Bakong API returns responseCode 0 when transaction is found and paid
                if (result?.responseCode === 0 && result?.data) {
                    clearInterval(poll);
                    setKhqrAutoDetected(true);
                    try {
                        await pay({
                            orderId: placedOrderId,
                            paymentMethod: "QR_CODE",
                            amount: finalTotal,
                            transactionRef: (result.data as { hash?: string })?.hash ?? undefined,
                        }).unwrap();
                        dispatch(clearCart());
                        setStep("done");
                    } catch (e: unknown) {
                        const msg = (e as { data?: { message?: string } })?.data?.message;
                        if (msg?.toLowerCase().includes("already paid")) {
                            dispatch(clearCart());
                            setStep("done"); // idempotent — webhook already processed
                        } else {
                            setKhqrAutoDetected(false);
                            setError(msg ?? "Auto-confirmation failed. Please use the button below.");
                        }
                    }
                }
            } catch {
                // Polling error — silent, keep polling until manual confirmation
            }
        }, 5000);

        return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, paymentMethod, qrMd5, qrConfirmed, paying, placedOrderId, finalTotal]);

    /* ── animation ── */
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!appliedPromoCode) return;
        setPromoDiscount(0);
        setAppliedPromoCode(null);
        setPromoMessage("Cart changed. Re-apply your promo code.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total]);

    /* ─────────────────────────────────────────────────────────────────────
       AUTO-CONFIRM: when user checks the QR checkbox, count down 3 s then
       auto-call handleConfirmQrPayment so they don't have to click again.
    ───────────────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!qrConfirmed) {
            setAutoCountdown(null);
            return;
        }
        setAutoCountdown(3);
        const interval = setInterval(() => {
            setAutoCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        // Fire confirmation after 3 s
        const timeout = setTimeout(() => {
            handleConfirmQrPayment();
        }, 3000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrConfirmed]);

    /* ── validation rules ── */
    const errs: Record<string, string> = {};
    if (!buyerName.trim()) errs.buyerName = "Name is required";
    if (!phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (orderType === "TAKEAWAY") {
        if (!address.trim()) errs.address = "Delivery address is required";
        if (!province) errs.province = "Province is required";
    }
    if (orderType === "DINE_IN" && !tableNumber.trim())
        errs.tableNumber = "Table number is required";

    const isValid = Object.keys(errs).length === 0;

    const fieldErr = (f: string): string | null => {
        if (!showAllErrors && !touched[f]) return null;
        return errs[f] ?? null;
    };
    const touch = (f: string) => setTouch((p) => ({ ...p, [f]: true }));

    const loyaltyPoints = profile?.loyaltyPoints ?? 0;
    const loyaltyDiscount = redeemLoyalty && loyaltyPoints >= 100 ? 1 : 0;
    const discountedTotal = Math.max(0, total - promoDiscount - loyaltyDiscount);

    const handleApplyPromo = async () => {
        const code = promoCode.trim();
        if (!code) {
            setPromoError("Enter a promo code first.");
            setPromoMessage(null);
            return;
        }

        setPromoError(null);
        setPromoMessage(null);
        try {
            const response = await validatePromo({ code, orderTotal: total }).unwrap();
            const discount = Number(response.discountAmount ?? 0);
            setPromoDiscount(Number.isFinite(discount) ? Math.max(0, discount) : 0);
            setAppliedPromoCode(response.code);
            setPromoMessage(response.message ?? "Promo applied.");
        } catch (err) {
            const message = (err as { data?: { message?: string } })?.data?.message;
            setPromoDiscount(0);
            setAppliedPromoCode(null);
            setPromoError(message ?? "Invalid promo code.");
        }
    };

    /* ─────────────────────────────────────────────────────────────────────
       STEP 1 → STEP 2 (Place Order)
       Called when customer clicks the primary CTA button on the bag page.
       - Validates the form.
       - Places the order on the backend → gets orderId.
       - For CASH:        registers the counter payment and jumps to done.
       - For QR / CARD:   advances to the payment step for the final confirmation.
    ───────────────────────────────────────────────────────────────────── */
    const handlePlaceOrder = async () => {
        setShowAllErrors(true);
        if (!isValid) return;
        setError(null);

        try {
            /* 1. Compile order notes from user details */
            const orderNotes = [
                `Buyer: ${buyerName}`,
                `Phone: ${phoneNumber} ${contactViaTelegram ? '(Telegram)' : ''}`,
                orderType === "TAKEAWAY" ? `Delivery To: ${address}, ${province}` : '',
                appliedPromoCode ? `Promo: ${appliedPromoCode} (-${formatCurrency(promoDiscount)})` : '',
                loyaltyDiscount > 0 ? `Loyalty Redeemed: ${loyaltyPoints} pts (-${formatCurrency(loyaltyDiscount)})` : '',
                note ? `Notes: ${note}` : ''
            ].filter(Boolean).join(' | ');

            /* 2. Create the order */
            const order = await placeOrder({
                orderType,
                tableNumber: orderType === "DINE_IN" && tableNumber
                    ? parseInt(tableNumber, 10)
                    : undefined,
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: i.price,
                    specialInstructions: i.specialInstructions,
                })),
                notes: orderNotes,
                promoCode: appliedPromoCode ?? undefined,
                discountAmount: promoDiscount > 0 ? promoDiscount : undefined,
            }).unwrap();

            const orderTotal = typeof order.totalPrice === "number" ? order.totalPrice : discountedTotal;
            setPlacedOrderId(order.id);
            setFinalTotal(orderTotal);
            setClientSecret(order.clientSecret || null);

            if (paymentMethod === "QR_CODE" || paymentMethod === "CARD") {
                /* 2a. Show scan / payment screen — cart cleared after user confirms payment */
                setStep("scan");
            } else {
                /* 2b. Cash — explicitly register the pending payment then jump to 'done' */
                await pay({
                    orderId: order.id,
                    paymentMethod: "CASH",
                    amount: orderTotal,
                }).unwrap();
                dispatch(clearCart());
                setStep("done");
            }
        } catch (e: unknown) {
            console.error(e);
            const typedE = e as { data?: { message?: string }; status?: number };
            let errMsg = JSON.stringify(e);
            if (typedE?.data?.message) {
                errMsg = typedE.data.message;
            } else if (typedE?.status) {
                errMsg = `Error ${typedE.status}: Invalid items or missing details. Try clearing your cart or re-logging. Payload: ${JSON.stringify(typedE.data)}`;
            }
            setError(errMsg);
        }
    };

    /* ─────────────────────────────────────────────────────────────────────
       STEP 2 → STEP 3  (Confirm QR payment)
       Called when customer clicks "I've Paid" after scanning the QR code.
       - Calls pay() to register the payment record on the backend.
    - Order moves from PENDING_PAYMENT / CONFIRMED after payment.
    ───────────────────────────────────────────────────────────────────── */
    const handleConfirmQrPayment = async () => {
        if (!placedOrderId) return;
        setError(null);
        try {
            await pay({
                orderId: placedOrderId,
                paymentMethod: "QR_CODE",
                amount: finalTotal,           // amount captured before clearCart
                transactionRef: undefined,
            }).unwrap();
            dispatch(clearCart());
            setStep("done");
        } catch (e: unknown) {
            const msg = (e as { data?: { message?: string } })?.data?.message;
            setError(msg ?? "Failed to record payment. Please contact staff.");
        }
    };

    /* ─────────────────────────────────────────────────────────────────────
       GUARDS
    ───────────────────────────────────────────────────────────────────── */
    if (!isAuthenticated) return null;

    /* ─────────────────────────────────────────────────────────────────────
       RENDER — DONE
    ───────────────────────────────────────────────────────────────────── */
    if (step === "done") {
        return <DoneScreen orderId={placedOrderId!} paymentMethod={paymentMethod} />;
    }

    /* ─────────────────────────────────────────────────────────────────────
       RENDER — QR SCAN  (order already placed, waiting for payment)
    ───────────────────────────────────────────────────────────────────── */
    if (step === "scan") {
        if (paymentMethod === "CARD" && clientSecret) {
            return (
                <div className="min-h-screen" style={{ background: "var(--background)" }}>
                    <CheckoutHeader title="Secure Payment" />
                    <StepIndicator current="scan" />
                    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-4 pb-16">
                        <AmountDueHeader amount={finalTotal} orderId={placedOrderId} />
                        <StripeCheckout
                            clientSecret={clientSecret}
                            onSuccess={async (paymentIntentId) => {
                                try {
                                    await pay({
                                        orderId: placedOrderId!,
                                        paymentMethod: "CARD",
                                        amount: finalTotal,
                                        transactionRef: paymentIntentId,
                                    }).unwrap();
                                } catch (e) {
                                    const msg = (e as { data?: { message?: string } })?.data?.message;
                                    if (msg?.toLowerCase().includes("already paid")) {
                                        // Webhook may have run first — idempotent, treat as success
                                    } else {
                                        setError(msg ?? "Failed to record payment.");
                                        return;
                                    }
                                }
                                dispatch(clearCart());
                                setStep("done");
                            }}
                        />
                    </main>
                </div>
            );
        }

        if (paymentMethod === "CARD" && !clientSecret) {
            return (
                <div className="min-h-screen" style={{ background: "var(--background)" }}>
                    <CheckoutHeader title="Card Payment" />
                    <StepIndicator current="scan" />
                    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-4 pb-16">
                        <AmountDueHeader amount={finalTotal} orderId={placedOrderId} />

                        {/* EDC Terminal Card */}
                        <div className="w-full rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                                    <CreditCard size={22} />
                                </div>
                                <div>
                                    <p className="font-bold text-stone-900">EDC Card Terminal</p>
                                    <p className="text-xs text-stone-500">Visa · Mastercard · UnionPay</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Ready</span>
                                </div>
                            </div>

                            {/* Terminal amount display */}
                            <div className="rounded-2xl bg-stone-900 p-4 font-mono text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Amount to Pay</p>
                                <p className="text-3xl font-black text-green-400">${finalTotal.toFixed(2)}</p>
                                <p className="text-[10px] text-stone-600 mt-1 uppercase tracking-wider">USD</p>
                            </div>

                            {/* Step-by-step EDC instructions */}
                            <ol className="space-y-3 text-sm">
                                {[
                                    { icon: "💰", label: "Amount synced to terminal", done: true },
                                    { icon: "💳", label: "Tap, insert, or swipe your card on the EDC device", active: true },
                                    { icon: "🔄", label: "Terminal contacts your bank for approval" },
                                    { icon: "✅", label: "Terminal shows \"Approved\" — tap confirm below" },
                                ].map(({ icon, label, done, active }, i) => (
                                    <li key={i} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${
                                        done   ? "bg-green-50 text-green-700" :
                                        active ? "bg-blue-50 text-blue-700 font-semibold" :
                                                 "text-stone-500"
                                    }`}>
                                        <span className="text-base shrink-0">{icon}</span>
                                        <span className="text-xs leading-5">{label}</span>
                                        {done && <CheckCircle size={14} className="ml-auto shrink-0 text-green-500 mt-0.5" />}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Warning */}
                        <div className="flex w-full items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-xs text-stone-600">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <p>Only tap <strong>Confirm</strong> after you see &quot;Approved&quot; on the card terminal screen.</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                                <AlertCircle size={16} className="shrink-0" /> {error}
                            </div>
                        )}

                        {/* Confirm approved button */}
                        <Button
                            onClick={async () => {
                                setError(null);
                                try {
                                    await pay({
                                        orderId: placedOrderId!,
                                        paymentMethod: "CARD",
                                        amount: finalTotal,
                                    }).unwrap();
                                    dispatch(clearCart());
                                    setStep("done");
                                } catch (e: unknown) {
                                    const msg = (e as { data?: { message?: string } })?.data?.message;
                                    setError(msg ?? "Failed to confirm card payment. Please try again.");
                                }
                            }}
                            disabled={paying}
                            className="h-14 w-full text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-300"
                            size="lg"
                        >
                            {paying ? (
                                <><Loader2 size={18} className="animate-spin" /> Recording payment…</>
                            ) : (
                                <><CheckCircle size={18} /> Card Approved — Confirm Order</>
                            )}
                        </Button>
                    </main>
                </div>
            );
        }

        return (
            <div className="min-h-screen" style={{ background: "var(--background)" }}>
                <CheckoutHeader title="Scan to Pay" onBackAction={undefined /* can't go back; order placed */} />
                <StepIndicator current="scan" />

                <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-4 pb-16">
                    <AmountDueHeader amount={finalTotal} orderId={placedOrderId} />

                    {/* QR Card */}
                    <div className="w-full rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col items-center gap-5">
                        <div className="relative w-full max-w-70">
                            {/* Corner decorations */}
                            <div className="pointer-events-none absolute inset-0 z-10">
                                <span className="absolute left-0  top-0    h-8 w-8 rounded-tl-xl border-l-[3px] border-t-[3px] border-primary/50" />
                                <span className="absolute right-0 top-0    h-8 w-8 rounded-tr-xl border-r-[3px] border-t-[3px] border-primary/50" />
                                <span className="absolute left-0  bottom-0 h-8 w-8 rounded-bl-xl border-b-[3px] border-l-[3px] border-primary/50" />
                                <span className="absolute right-0 bottom-0 h-8 w-8 rounded-br-xl border-b-[3px] border-r-[3px] border-primary/50" />
                            </div>
                            {/* Animated scan line */}
                            <div className="absolute inset-x-4 z-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-60 animate-scan-line" />
                            <div className="relative z-0 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                                {qrString ? (
                                    <QRCodeSVG value={qrString} size={256} className="h-full w-full object-contain" />
                                ) : qrError ? (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-red-50 p-4 text-center">
                                        <AlertCircle size={28} className="text-red-400" />
                                        <p className="text-xs text-red-500 font-medium">{qrError}</p>
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-background">
                                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <ScanLine size={16} className="text-primary" />
                                Scan with ABA / KHQR / Wing / TrueMoney
                            </div>
                            <p className="text-xs text-muted-foreground max-w-65">
                                Open your banking app → tap <strong>Scan</strong> → point at the code above to pay exactly {formatCurrency(finalTotal)}.
                            </p>
                        </div>

                        {/* Step-by-step instructions */}
                        <ol className="w-full space-y-2.5 rounded-2xl bg-stone-50 p-4 text-xs text-stone-700">
                            {[
                                "Open your mobile banking or ABA Pay app",
                                "Tap \"Scan QR\" and scan the code above",
                                `Amount ${formatCurrency(finalTotal)} is automatically filled`,
                                "Confirm the payment inside your app",
                                khqrAutoDetected
                                    ? "✅ Payment detected automatically!"
                                    : qrMd5
                                    ? "Payment detected automatically — or tick the box below"
                                    : "Come back here and tick the box below",
                            ].map((s, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-foreground shadow-sm ${
                                        i === 4 && (khqrAutoDetected || qrMd5) ? "bg-green-400 text-white" : "bg-primary text-primary-foreground"
                                    }`}>
                                        {i === 4 && (khqrAutoDetected || qrMd5) ? "✓" : i + 1}
                                    </span>
                                    <span className="leading-5">{s}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* ⚠ Warning — same warning pichpisey.shop shows for Bakong direct transfers */}
                    <div className="flex w-full items-start gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-4 py-3.5 text-xs">
                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-primary" />
                        <div className="text-primary space-y-0.5">
                            <p className="font-bold">Do not transfer directly to a personal account.</p>
                            <p className="text-primary">Only scan the QR code shown above. If you have trouble, ask our staff for assistance.</p>
                        </div>
                    </div>

                    {/* Confirmation checkbox — checking starts auto-countdown */}
                    <label
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
                            qrConfirmed
                                ? "border-green-500/40 bg-green-500/10"
                                : "border-stone-200 bg-white hover:border-primary/50"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={qrConfirmed}
                            onChange={(e) => setQrConfirmed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 cursor-pointer accent-amber-500"
                            disabled={paying}
                        />
                        <span className="text-sm font-medium text-foreground leading-relaxed">
                            I have successfully paid{" "}
                            <strong className="text-primary">{formatCurrency(finalTotal)}</strong>{" "}
                            via QR code and the payment is confirmed in my banking app.
                        </span>
                    </label>

                    {/* Error */}
                    {error && (
                        <div className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                            <AlertCircle size={16} className="shrink-0" /> {error}
                        </div>
                    )}

                    {/* Auto-confirm progress button */}
                    <div className="relative w-full">
                        <Button
                            onClick={handleConfirmQrPayment}
                            disabled={!qrConfirmed || paying}
                            className="h-14 w-full text-base font-bold shadow-lg shadow-amber-200 transition-all duration-300"
                            size="lg"
                        >
                            {paying ? (
                                <><Loader2 size={18} className="animate-spin" /> Confirming payment…</>
                            ) : qrConfirmed && autoCountdown !== null ? (
                                <><BadgeCheck size={18} /> Auto-confirming in {autoCountdown}s…</>
                            ) : (
                                <><BadgeCheck size={18} /> I&apos;ve Paid · Confirm Order</>
                            )}
                        </Button>

                        {/* Shrinking border progress bar that depletes over 3 s */}
                        {qrConfirmed && autoCountdown !== null && !paying && (
                            <div
                                className="absolute bottom-0 left-0 h-1 rounded-b-xl bg-green-400 transition-all"
                                style={{
                                    width: `${(autoCountdown / 3) * 100}%`,
                                    transition: "width 1s linear",
                                }}
                            />
                        )}
                    </div>

                    <p className="pb-4 text-center text-xs text-muted-foreground">
                        {qrConfirmed
                            ? "Payment will be confirmed automatically — or tap the button above."
                            : qrMd5
                            ? "🔍 Monitoring your payment automatically. You can also confirm manually below."
                            : "Check the box above after completing payment in your banking app."
                        }
                    </p>
                </main>

                <style>{`
                    @keyframes scanLine {
                        0%   { top: 0;                    opacity: 0; }
                        10%  { opacity: 0.6; }
                        90%  { opacity: 0.6; }
                        100% { top: calc(100% - 2px);     opacity: 0; }
                    }
                    .animate-scan-line { animation: scanLine 2.5s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    /* ─────────────────────────────────────────────────────────────────────
       RENDER — EMPTY CART
    ───────────────────────────────────────────────────────────────────── */
    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5" style={{ background: "var(--background)" }}>
                <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-stone-100">
                        <ShoppingBag size={48} className="text-stone-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 border-4 border-white text-lg">
                        😊
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-foreground">Your bag is empty</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">Add some delicious items from the menu first</p>
                </div>
                <Button asChild size="lg"><Link href="/menu">Browse Menu</Link></Button>
            </div>
        );
    }

    /* ─────────────────────────────────────────────────────────────────────
       RENDER — BAG + CHECKOUT FORM  (single page, pichpisey.shop style)
    ───────────────────────────────────────────────────────────────────── */
    const subtotal = total;
    const grandTotal = discountedTotal;

    return (
        <div
            className={`min-h-screen transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
            style={{ background: "var(--background)" }}
        >
            <CheckoutHeader title="Checkout" />
            <div className="max-w-5xl mx-auto px-4 mt-2">
                <StepIndicator current="bag" />
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 pb-24">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

                    {/* ══════════════════════════════════════════════
                        LEFT — Buyer Info + Order Type + Payment
                    ══════════════════════════════════════════════ */}
                    <div className="order-2 space-y-4 lg:order-1">

                        {/* ── Buyer Information ─────────────────────── */}
                        <CheckoutPanel>
                            <SectionHeader icon={<User size={16} className="text-primary" />} title="Buyer Information" />

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={labelCls(fieldErr("buyerName"))}>
                                        Name <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/80 pointer-events-none" />
                                        <Input
                                            placeholder="John Doe"
                                            value={buyerName}
                                            onChange={(e) => setBuyerName(e.target.value)}
                                            onBlur={() => touch("buyerName")}
                                            className={`pl-9 ${fieldErr("buyerName") ? "border-red-300 focus:ring-red-100/50" : ""}`}
                                        />
                                    </div>
                                    <FieldError msg={fieldErr("buyerName")} />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={labelCls(fieldErr("phoneNumber"))}>
                                        Phone Number <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/80 pointer-events-none" />
                                        <Input
                                            type="tel"
                                            placeholder="0xx xxx xxx"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            onBlur={() => touch("phoneNumber")}
                                            className={`pl-9 ${fieldErr("phoneNumber") ? "border-red-300 focus:ring-red-100/50" : ""}`}
                                        />
                                    </div>
                                    <FieldError msg={fieldErr("phoneNumber")} />
                                </div>

                                {/* Telegram toggle */}
                                <TelegramToggle value={contactViaTelegram} onChangeAction={setContactViaTelegram} />
                            </div>
                        </CheckoutPanel>

                        {/* ── Order Type ────────────────────────────── */}
                        <CheckoutPanel>
                            <SectionHeader icon={<Package size={16} className="text-primary" />} title="Order Type" />

                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { value: "DINE_IN", label: "Dine In", icon: Store, desc: "Enjoy at our shop" },
                                    { value: "TAKEAWAY", label: "Delivery", icon: Truck, desc: "Delivered to you" },
                                ] as const).map(({ value, label, icon: Icon, desc }) => (
                                    <button
                                        key={value}
                                        onClick={() => setOrderType(value)}
                                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 ${orderType === value
                                            ? "border-amber-300 bg-amber-50 shadow-[0_10px_30px_rgba(217,119,6,0.12)] dark:border-amber-500/40 dark:bg-amber-500/10"
                                            : "border-border bg-background hover:bg-muted/50 hover:border-border"
                                            }`}
                                    >
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${orderType === value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-foreground/70"}`}>
                                            <Icon size={22} className={orderType === value ? "text-primary" : "text-foreground/60"} />
                                        </div>
                                        <span className={`text-sm font-bold ${orderType === value ? "text-amber-700" : "text-foreground/90"}`}>{label}</span>
                                        <span className="text-[11px] text-foreground/70 -mt-1">{desc}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Dine In: table number */}
                            {orderType === "DINE_IN" && (
                                <div className="mt-4 space-y-1.5">
                                    <label className={labelCls(fieldErr("tableNumber"))}>
                                        Table Number <span className="text-red-400">*</span>
                                    </label>
                                    <Input
                                        type="number" min="1" placeholder="5"
                                        className="max-w-30"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        onBlur={() => touch("tableNumber")}
                                    />
                                    <FieldError msg={fieldErr("tableNumber")} />
                                </div>
                            )}

                            {/* Takeaway: delivery info */}
                            {orderType === "TAKEAWAY" && (
                                <div className="mt-4 space-y-4">
                                    {/* Address */}
                                    <div>
                                        <label className={labelCls(fieldErr("address"))}>
                                            Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/80 pointer-events-none" />
                                            <Input
                                                placeholder="Toul Tompung, Street 123"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                onBlur={() => touch("address")}
                                                className={`pl-9 ${fieldErr("address") ? "border-red-300 focus:ring-red-100/50" : ""}`}
                                            />
                                        </div>
                                        <FieldError msg={fieldErr("address")} />
                                    </div>

                                    {/* Province */}
                                    <div>
                                        <label className={labelCls(fieldErr("province"))}>
                                            Province / City <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value)}
                                                onBlur={() => touch("province")}
                                                className={`h-12 w-full appearance-none rounded-2xl border bg-background pl-4 pr-10 text-sm outline-none transition-all duration-300 ${fieldErr("province")
                                                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100/50"
                                                    : "border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                                    } ${!province ? "text-foreground/80" : "text-foreground"}`}
                                            >
                                                <option value="">Select Province</option>
                                                {PROVINCES.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/80 pointer-events-none" />
                                        </div>
                                        <FieldError msg={fieldErr("province")} />
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground/90 mb-1.5">
                                            Note <span className="text-foreground/70 font-normal text-xs">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <FileText size={14} className="absolute left-3 top-3 text-foreground/80 pointer-events-none" />
                                            <textarea
                                                placeholder="Special instructions, landmarks, etc."
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                rows={3}
                                                className="w-full resize-none rounded-2xl border border-border bg-background pl-9 pr-4 pt-3 pb-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CheckoutPanel>

                        {/* ── Payment Method ────────────────────────── */}
                        <CheckoutPanel>
                            <SectionHeader icon={<CreditCard size={16} className="text-primary" />} title="Payment Method" />

                            <div className="space-y-2">
                                {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc, recommended }) => (
                                    <button
                                        key={value}
                                        onClick={() => setPaymentMethod(value)}
                                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ${paymentMethod === value
                                            ? "border-amber-300 bg-amber-50 shadow-[0_10px_30px_rgba(217,119,6,0.12)] dark:border-amber-500/40 dark:bg-amber-500/10"
                                            : "border-border bg-background hover:bg-muted/50 hover:border-border"
                                            }`}
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${paymentMethod === value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-foreground/70"}`}>
                                            <Icon size={20} className={paymentMethod === value ? "text-primary" : "text-foreground/60"} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-semibold ${paymentMethod === value ? "text-amber-700" : "text-foreground/90"}`}>{label}</p>
                                                {recommended && (
                                                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700 border border-green-200">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-foreground/70">{desc}</p>
                                        </div>
                                        <RadioDot checked={paymentMethod === value} />
                                    </button>
                                ))}
                            </div>

                            {/* Method-specific contextual hints */}
                            {paymentMethod === "QR_CODE" && (
                                <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-primary text-primary-foreground shadow-sm/10 px-4 py-3">
                                    <ScanLine size={16} className="shrink-0 text-primary" />
                                    <p className="text-xs text-amber-100 font-medium">
                                        After placing your order, a QR code will appear. Scan it in your banking app to pay.
                                    </p>
                                </div>
                            )}
                            {paymentMethod === "CASH" && (
                                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                                    <Banknote size={16} className="shrink-0 text-foreground/80" />
                                    <p className="text-xs text-foreground/80">
                                        Your order will be confirmed immediately after payment is recorded.
                                    </p>
                                </div>
                            )}
                            {paymentMethod === "CARD" && (
                                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                                    <CreditCard size={16} className="shrink-0 text-foreground/80" />
                                    <p className="text-xs text-foreground/80">
                                        Card payment is processed at the counter. Your order will be confirmed immediately.
                                    </p>
                                </div>
                            )}
                        </CheckoutPanel>
                    </div>

                    {/* ══════════════════════════════════════════════
                        RIGHT — Shopping Bag Summary + CTA
                    ══════════════════════════════════════════════ */}
                    <div className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-20 lg:self-start">
                        <section className="rounded-3xl border border-border bg-[var(--g-surface-bg)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-primary" />
                                    <h2 className="font-bold text-foreground">Shopping Bag</h2>
                                </div>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {items.map((item) => (
                                    <div key={item.productId} className="group flex items-start gap-3 py-3.5">
                                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/15 to-orange-500/15 overflow-hidden border border-amber-400/20">
                                            {resolveStorageUrl(item.imageUrl) ? (
                                                <Image
                                                    src={resolveStorageUrl(item.imageUrl)!}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="44px"
                                                    unoptimized={isRemoteStorageUrl(resolveStorageUrl(item.imageUrl))}
                                                />
                                            ) : (
                                                <span className="text-lg">☕</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                                            <Price amount={item.price} size="sm" muted />
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5">
                                                    <button
                                                        onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground hover:bg-muted/80 transition-colors"
                                                    ><Minus size={11} /></button>
                                                    <span className="min-w-6 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                                                    <button
                                                        onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                                                    ><Plus size={11} color="white" /></button>
                                                </div>
                                                <button
                                                    onClick={() => dispatch(removeItem(item.productId))}
                                                    className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            {/* #33 — show special instructions if set */}
                                            {item.specialInstructions && (
                                                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-primary font-medium">
                                                    <MessageCircle size={10} />  &ldquo;{item.specialInstructions}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                        <Price amount={item.price * item.quantity} size="md" muted />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-3.5">
                                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground/70">Promo Code</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        className="h-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleApplyPromo}
                                        disabled={validatingPromo || !promoCode.trim()}
                                        className="h-10 shrink-0"
                                    >
                                        {validatingPromo ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                                    </Button>
                                </div>
                                {promoMessage && (
                                    <p className="mt-2 text-xs text-emerald-400">{promoMessage}</p>
                                )}
                                {promoError && (
                                    <p className="mt-2 text-xs text-red-400">{promoError}</p>
                                )}
                            </div>

                            <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/70">Loyalty</p>
                                        <p className="mt-1 text-xs text-foreground/70">
                                            Balance: <span className="font-semibold text-foreground">{loyaltyPoints}</span> points
                                        </p>
                                        <p className="text-[11px] text-foreground/60">Redeem 100 points for $1.00 off</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={loyaltyPoints < 100}
                                        onClick={() => setRedeemLoyalty((prev) => !prev)}
                                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                                            loyaltyPoints < 100
                                                ? "bg-muted text-foreground/50 cursor-not-allowed"
                                                : redeemLoyalty
                                                ? "bg-primary text-white"
                                                : "bg-muted text-foreground/80 hover:bg-muted/80"
                                        }`}
                                    >
                                        {redeemLoyalty ? "Applied" : "Use Points"}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 space-y-2 border-t border-border pt-4">
                                <div className="flex justify-between text-sm text-foreground/80">
                                    <span>Subtotal</span><Price amount={subtotal} size="md" />
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span>Promo {appliedPromoCode ? `(${appliedPromoCode})` : ""}</span>
                                        <span>-{formatCurrency(promoDiscount)}</span>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span>Loyalty Redemption</span>
                                        <span>-{formatCurrency(loyaltyDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-extrabold text-foreground pt-1">
                                    <span>Total</span>
                                    <Price amount={grandTotal} size="lg" />
                                </div>
                            </div>
                        </section>

                        {/* ── Place Order CTA ── */}
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={placing || paying}
                            className="h-12 w-full text-base font-bold shadow-lg shadow-amber-200"
                            size="lg"
                        >
                            {(placing || paying) ? (
                                <><Loader2 size={18} className="animate-spin" /> Placing Order…</>
                            ) : paymentMethod === "QR_CODE" ? (
                                <><QrCode size={18} /> Place Order &amp; Scan to Pay · {formatCurrency(grandTotal)}</>
                            ) : paymentMethod === "CASH" ? (
                                <><Banknote size={16} /> Place Order · Pay at Counter</>
                            ) : (
                                <><Sparkles size={16} /> Place Order · {formatCurrency(grandTotal)}</>
                            )}
                        </Button>

                        {/* Validation summary */}
                        {showAllErrors && !isValid && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                                <p className="font-semibold mb-1.5 flex items-center gap-1.5">
                                    <AlertCircle size={13} /> Please fill in required fields:
                                </p>
                                <ul className="list-disc list-inside text-xs space-y-0.5 text-red-600">
                                    {Object.values(errs).map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* API error */}
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 flex items-center justify-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DONE SCREEN — Order confirmed
───────────────────────────────────────────────────────────────────────────── */
function DoneScreen({ orderId, paymentMethod }: { orderId: string; paymentMethod: string }) {
    // Poll every 3 s until the receipt appears — the backend may take a moment
    // to create it after payment confirmation.
    const [pollingInterval, setPollingInterval] = useState(3000);
    const { data: receipt, isLoading, isError, refetch } = useGetReceiptQuery(orderId, {
        pollingInterval,
    });
    const isCash = paymentMethod === "CASH";

    // Stop polling once we have data
    useEffect(() => {
        if (receipt) setPollingInterval(0);
    }, [receipt]);

    const [confetti, setConfetti] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setConfetti(false), 3000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
            <header className="border-b backdrop-blur-xl" style={{ borderColor: "var(--g-card-border)", background: "var(--g-surface-bg)" }}>
                <div className="mx-auto flex h-16 max-w-lg items-center justify-center px-4">
                    <Logo size="sm" />
                </div>
            </header>
            <StepIndicator current="done" />

            <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-4">

                {/* Success hero */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/15 ring-8 ring-green-500/8">
                            <CheckCircle size={44} className="text-green-400" />
                        </div>
                        {confetti && (
                            <div className="pointer-events-none absolute -inset-8">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute h-2 w-2 rounded-full animate-confetti"
                                        style={{
                                            background: ["#f59e0b", "#10b981", "#6366f1", "#f43f5e", "#14b8a6", "#eab308", "#8b5cf6", "#ec4899"][i],
                                            left: `${50 + Math.cos((i * Math.PI) / 4) * 40}%`,
                                            top: `${50 + Math.sin((i * Math.PI) / 4) * 40}%`,
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Order Confirmed! 🎉</h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {isCash
                                ? "Pay at the counter when you arrive. Your order will be prepared after payment."
                                : "Payment received. Your order is being prepared."}
                        </p>
                        <code className="mt-3 inline-block rounded-xl bg-muted px-4 py-1.5 font-mono text-sm font-bold tracking-widest text-foreground">
                            #{orderId.slice(0, 8).toUpperCase()}
                        </code>
                    </div>
                </div>

                {/* Cash reminder */}
                {isCash && (
                    <div className="flex items-start gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-4 py-3.5">
                        <Banknote size={18} className="mt-0.5 shrink-0 text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-primary">Pay at Counter First</p>
                            <p className="text-xs text-primary mt-0.5">
                                Show your order code to staff and pay when you arrive. Your coffee will be prepared after payment is confirmed.
                            </p>
                        </div>
                    </div>
                )}

                {/* Receipt — auto-polls until loaded */}
                {isLoading && !receipt && (
                    <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Loader2 size={15} className="animate-spin text-primary" />
                            <span className="text-sm font-semibold text-stone-400">Preparing your receipt…</span>
                        </div>
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 rounded-lg bg-muted w-3/4" />
                            <div className="h-4 rounded-lg bg-muted w-1/2" />
                            <div className="h-4 rounded-lg bg-muted w-2/3" />
                            <div className="h-px bg-muted my-2" />
                            <div className="h-5 rounded-lg bg-primary/10 w-1/3 ml-auto" />
                        </div>
                    </div>
                )}
                {isError && !receipt && (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center">
                        <AlertCircle size={24} className="text-stone-300" />
                        <p className="text-sm text-stone-500">Could not load receipt</p>
                        <button onClick={() => refetch()} className="text-xs font-semibold text-primary hover:underline">
                            Try again
                        </button>
                    </div>
                )}
                {!isLoading && !isError && receipt && (
                    <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt size={15} className="text-primary" />
                                <span className="font-bold text-foreground">Receipt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {receipt.orderType === "DINE_IN" ? `Table ${receipt.tableNumber}` : "Takeaway"}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${receipt.paidAt ? "bg-green-500/15 text-green-300" : "bg-primary/10 text-primary"}`}>
                                    {receipt.paidAt ? "Paid" : "Pending"}
                                </span>
                            </div>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {receipt.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm">☕</span>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">×{item.quantity} · {formatCurrency(item.unitPrice)}</p>
                                        </div>
                                    </div>
                                    <Price amount={item.lineTotal} size="sm" muted />
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3.5">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span><Price amount={receipt.subtotal} size="md" muted />
                            </div>
                            <div className="flex justify-between text-base font-extrabold text-foreground pt-1">
                                <span>Total</span>
                                <Price amount={receipt.totalPaid} size="lg" />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <p className="text-xs text-muted-foreground">{receipt.paymentMethod.replace(/_/g, " ")}</p>
                                {receipt.paidAt && (
                                    <p className="text-xs text-muted-foreground">{new Date(receipt.paidAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pb-6">
                    <Button asChild size="lg" className="bg-amber-700 hover:bg-amber-800 text-foreground font-bold h-12 shadow-md">
                        <Link href={`/orders/${orderId}`} className="flex items-center gap-2"><Coffee size={16} /> Track Order</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-2 border-stone-200 bg-white text-stone-800 hover:bg-stone-50 font-bold h-12">
                        <Link href="/menu">Order More</Link>
                    </Button>
                </div>
            </main>

            <style>{`
                @keyframes confetti {
                    0%   { transform: scale(0); opacity: 1; }
                    50%  { transform: scale(1.5); opacity: 0.8; }
                    100% { transform: scale(0); opacity: 0; }
                }
                .animate-confetti { animation: confetti 1.5s ease-out forwards; }
            `}</style>
        </div>
    );
}
