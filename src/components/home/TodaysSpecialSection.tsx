"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ArrowRight, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useGetHomeShowcaseQuery } from "@/store/api/productsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { resolveStorageUrl } from "@/lib/storage";
import { FEATURED_DATA, type FeaturedItem } from "./homeData";

interface TodaysSpecialSectionProps {
    onSelectItem: (item: FeaturedItem) => void;
    onViewBag: () => void;
}

export function TodaysSpecialSection({ onSelectItem, onViewBag }: TodaysSpecialSectionProps) {
    const { t } = useI18n();
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);

    const { data: homeShowcase } = useGetHomeShowcaseQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const showcaseSpecials = homeShowcase?.todaySpecials ?? [];

    const specials: FeaturedItem[] = showcaseSpecials.length
        ? showcaseSpecials.map((product, idx) => {
            const fallback = FEATURED_DATA[idx % FEATURED_DATA.length];
            const imageUrl = resolveStorageUrl(product.imageUrl) || fallback.imageUrl;

            return {
                ...fallback,
                id: product.id,
                imageUrl,
                price: `$${Number(product.price).toFixed(2)}`,
                name: product.name,
                desc: product.description || t("featuredMenu.subtext"),
                tag: t("hero.todaySpecial"),
            };
        })
        : [];

    function handleAddToCart(item: FeaturedItem) {
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
        <section id="todays-special" style={{ background: "var(--background)", padding: "0 24px 64px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div
                    style={{
                        borderRadius: "32px",
                        border: "1px solid var(--g-card-border)",
                        background: "var(--special-panel-bg)",
                        padding: "28px",
                        boxShadow: "var(--special-panel-shadow)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "20px", flexWrap: "wrap", marginBottom: "28px" }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", padding: "6px 16px", marginBottom: "16px" }}>
                                <Sparkles size={10} style={{ color: "var(--primary)" }} />
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)" }}>
                                    Today&apos;s Special
                                </span>
                            </div>
                            <h2
                                className="font-display"
                                style={{ fontSize: "clamp(1.85rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}
                            >
                                Today&apos;s Special
                            </h2>
                            <p style={{ marginTop: "10px", maxWidth: "520px", fontSize: "0.92rem", lineHeight: 1.7, color: "var(--g-muted-text)" }}>
                                Discover the drinks and bites your coffee shop is featuring right now. These cards are powered by your admin-managed Today&apos;s Special products, so guests always see the latest highlighted picks first.
                            </p>
                        </div>

                        <Link
                            href="/menu"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-soft-bg)", color: "var(--foreground)", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700 }}
                        >
                            Browse Full Menu <ArrowRight size={14} />
                        </Link>
                    </div>

                    {specials.length === 0 ? (
                        <div
                            style={{
                                borderRadius: "24px",
                                border: "1px dashed var(--g-card-border)",
                                background: "var(--g-card-bg)",
                                padding: "28px",
                                textAlign: "center",
                            }}
                        >
                            <p
                                className="font-display"
                                style={{ fontSize: "clamp(1.3rem,3vw,2rem)", fontWeight: 900, color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}
                            >
                                Today&apos;s Special
                            </p>
                            <p style={{ marginTop: "10px", maxWidth: "560px", marginInline: "auto", fontSize: "0.92rem", lineHeight: 1.75, color: "var(--g-muted-text)" }}>
                                No Today&apos;s Special products have been added yet. Once your admin marks products as Today&apos;s Special, they will appear here for guests to discover first.
                            </p>
                        </div>
                    ) : (
                    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                        {specials.map((item) => {
                            const inCart = cartItems.some((cartItem) => cartItem.productId === item.id);

                            return (
                            <div
                                key={item.id}
                                className="card-hover"
                                onClick={() => onSelectItem(item)}
                                role="button"
                                tabIndex={0}
                                aria-label={`View details for ${item.name}`}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onSelectItem(item);
                                    }
                                }}
                                style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", backdropFilter: "blur(20px)", cursor: "pointer" }}
                            >
                                <div
                                    style={{ position: "relative", height: "170px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    className={`bg-linear-to-br ${item.gradient}`}
                                >
                                    {item.imageUrl ? (
                                        <div
                                            className="relative w-28 h-28 rounded-full p-1"
                                            style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 12px 36px rgba(0,0,0,0.14), inset 0 2px 8px rgba(255,255,255,0.4)" }}
                                        >
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                unoptimized={item.imageUrl.startsWith("http://") || item.imageUrl.startsWith("https://")}
                                                className="object-cover rounded-full"
                                                sizes="112px"
                                            />
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: "64px", zIndex: 1, position: "relative" }}>{item.emoji}</span>
                                    )}

                                    <span style={{ position: "absolute", left: "14px", top: "14px", borderRadius: "100px", padding: "5px 12px", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--special-chip-bg)", color: "var(--primary)" }}>
                                        {item.tag}
                                    </span>
                                </div>

                                <div style={{ padding: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}>
                                        <div>
                                            <h3 style={{ fontSize: "1.02rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", fontFamily: "'Playfair Display', serif" }}>
                                                {item.name}
                                            </h3>
                                            <p style={{ marginTop: "8px", fontSize: "0.84rem", lineHeight: 1.65, color: "var(--g-muted-text)" }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em", whiteSpace: "nowrap", fontFamily: "'Playfair Display', serif" }}>
                                            {item.price}
                                        </span>
                                    </div>

                                    <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "20px" }}>
                                        <button
                                            type="button"
                                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", color: "var(--foreground)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectItem(item);
                                            }}
                                        >
                                            <Eye size={12} /> Details
                                        </button>
                                        {inCart ? (
                                            <button
                                                type="button"
                                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", color: "var(--foreground)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewBag();
                                                }}
                                            >
                                                <ShoppingBag size={12} /> View Bag
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="order-btn"
                                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", border: "none", color: "var(--primary-foreground)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(item);
                                                }}
                                            >
                                                <ShoppingBag size={12} /> Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                    )}
                </div>
            </div>
        </section>
    );
}
