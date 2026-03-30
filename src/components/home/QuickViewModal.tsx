"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { isRemoteStorageUrl } from "@/lib/storage";
import type { FeaturedItem } from "./homeData";

interface QuickViewModalProps {
    item: FeaturedItem;
    onClose: () => void;
    onViewBag: () => void;
}

/**
 * Quick-view modal for a featured product on the home page.
 * Shows emoji hero, description, feature pills, price, and an order CTA.
 */
export function QuickViewModal({ item, onClose, onViewBag }: QuickViewModalProps) {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);
    const inCart = cartItems.some((cartItem) => cartItem.productId === item.id);

    function handleAddToCart() {
        dispatch(addItem({
            productId: item.id,
            name: item.name,
            price: Number(item.price.replace(/[^0-9.]/g, "")) || 0,
            quantity: 1,
            imageUrl: item.imageUrl,
            category: item.tag,
        }));
        toast.success(`${item.name} added to cart`);
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,3,2,0.88)", backdropFilter: "blur(12px)", animation: "fadeIn 0.2s ease both" }}
            />

            {/* Centering wrapper */}
            <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", pointerEvents: "none" }}>
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: "auto", width: "100%", maxWidth: "420px", borderRadius: "28px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.12)", background: "var(--background)", boxShadow: "0 48px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", animation: "fadeUp 0.3s cubic-bezier(.22,1,.36,1) both" }}
                >
                    {/* Hero */}
                    <div
                        style={{ position: "relative", height: "220px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                        className={`bg-linear-to-br ${item.gradient}`}
                    >
                        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(to top, rgba(14,9,5,0.7), transparent)", pointerEvents: "none" }} />

                        {item.imageUrl ? (
                            <div 
                                className="relative w-36 h-36 rounded-full p-2 z-10 animate-fade-in"
                                style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.25), inset 0 2px 10px rgba(255,255,255,0.5)" }}
                            >
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    fill 
                                    unoptimized={isRemoteStorageUrl(item.imageUrl)}
                                    className="object-cover rounded-full" 
                                    sizes="144px" 
                                />
                            </div>
                        ) : (
                            <span style={{ fontSize: "88px", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.6))", position: "relative", zIndex: 1 }}>
                                {item.emoji}
                            </span>
                        )}

                        {/* Tag */}
                        <span style={{ position: "absolute", top: "14px", left: "14px", borderRadius: "100px", padding: "4px 12px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", background: item.accentLight, color: item.accentText }}>
                            {item.tag}
                        </span>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            style={{ position: "absolute", top: "14px", right: "14px", width: "34px", height: "34px", borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(255,255,255,0.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", lineHeight: 1, transition: "background 0.2s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.65)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.4)"; }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "24px 28px 28px" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--foreground)", letterSpacing: "-0.03em", marginBottom: "10px", fontFamily: "'Playfair Display', serif" }}>
                            {item.name}
                        </h2>
                        <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "var(--g-muted-text)", fontWeight: 300, marginBottom: "24px" }}>
                            {item.desc}
                        </p>

                        {/* Feature pills */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                            {["Made to order", "Freshly prepared", "No shortcuts"].map((pill) => (
                                <span
                                    key={pill}
                                    style={{ borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-soft-bg)", padding: "4px 12px", fontSize: "0.7rem", fontWeight: 600, color: "var(--g-muted-text)", letterSpacing: "0.03em" }}
                                >
                                    {pill}
                                </span>
                            ))}
                        </div>

                        <div style={{ height: "1px", background: "rgba(0,0,0,0.04)", marginBottom: "24px" }} />

                        {/* Price + CTA */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                            <div>
                                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--g-muted-text)", marginBottom: "4px" }}>Price</p>
                                <p style={{ fontSize: "2rem", fontWeight: 900, color: item.accent, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                                    {item.price}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <Link
                                    href="/menu"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 18px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-soft-bg)", color: "var(--foreground)", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em", whiteSpace: "nowrap" }}
                                >
                                    <Eye size={15} /> View Menu
                                </Link>
                                {inCart ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onViewBag();
                                        }}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 24px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-soft-bg)", color: "var(--foreground)", fontSize: "0.88rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em", whiteSpace: "nowrap", cursor: "pointer" }}
                                    >
                                        <ShoppingBag size={15} /> View Bag
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="order-btn"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 24px", borderRadius: "100px", border: "none", color: "var(--primary-foreground)", fontSize: "0.88rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em", whiteSpace: "nowrap", cursor: "pointer" }}
                                    >
                                        <ShoppingBag size={15} /> Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
