
"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ArrowRight, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useGetHomeShowcaseQuery, useGetMenuQuery } from "@/store/api/productsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { resolveStorageUrl } from "@/lib/storage";
import { FEATURED_DATA, type FeaturedItem } from "./homeData";

interface FeaturedSectionProps {
    /** Called when a product card is clicked to open the quick-view modal */
    onSelectItem: (item: FeaturedItem) => void;
    onViewBag: () => void;
}

/**
 * Home page — Featured Menu section.
 * Grid of 8 curated product cards with hover effects and a quick-view callback.
 */
export function FeaturedSection({ onSelectItem, onViewBag }: FeaturedSectionProps) {
    const { t } = useI18n();
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.items);

    const { data: productsPage } = useGetMenuQuery(
        { page: 0, size: 8 },
        {
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        },
    );
    const { data: homeShowcase } = useGetHomeShowcaseQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const palette = [
        { gradient: "from-amber-200 via-amber-300 to-orange-300", accent: "#d97706", accentLight: "rgba(245,158,11,0.18)", accentText: "#92400e" },
        { gradient: "from-lime-200 via-green-200 to-emerald-200", accent: "#4d7c0f", accentLight: "rgba(132,204,22,0.20)", accentText: "#365314" },
        { gradient: "from-sky-200 via-cyan-200 to-blue-200", accent: "#0369a1", accentLight: "rgba(14,165,233,0.18)", accentText: "#0c4a6e" },
        { gradient: "from-amber-100 via-yellow-100 to-orange-100", accent: "#b45309", accentLight: "rgba(251,191,36,0.20)", accentText: "#78350f" },
        { gradient: "from-stone-300 via-neutral-300 to-zinc-300", accent: "#7c3f00", accentLight: "rgba(120,53,15,0.16)", accentText: "#431407" },
        { gradient: "from-pink-200 via-rose-200 to-fuchsia-200", accent: "#be185d", accentLight: "rgba(236,72,153,0.18)", accentText: "#831843" },
        { gradient: "from-violet-200 via-purple-200 to-indigo-200", accent: "#6d28d9", accentLight: "rgba(139,92,246,0.18)", accentText: "#4c1d95" },
        { gradient: "from-teal-200 via-cyan-200 to-emerald-200", accent: "#0f766e", accentLight: "rgba(20,184,166,0.18)", accentText: "#134e4a" },
    ] as const;

    const showcaseProducts = homeShowcase?.featuredProducts?.length
        ? homeShowcase.featuredProducts.filter((product) => !product.todaySpecial)
        : (productsPage?.content ?? []).filter((product) => !product.todaySpecial);

    const apiFeatured: FeaturedItem[] =
        showcaseProducts.map((product, idx) => {
            const p = palette[idx % palette.length];
            const imageUrl = resolveStorageUrl(product.imageUrl);

            return {
                id: product.id,
                emoji: "☕",
                imageUrl,
                nameKey: "",
                descKey: "",
                tagKey: "",
                gradient: p.gradient,
                accent: p.accent,
                accentLight: p.accentLight,
                accentText: p.accentText,
                price: `$${Number(product.price).toFixed(2)}`,
                name: product.name,
                desc: product.description || t("featuredMenu.subtext"),
                tag: product.todaySpecial ? t("hero.todaySpecial") : (product.category || t("featuredMenu.badge")),
            };
        }) ?? [];

    const fallbackFeatured = FEATURED_DATA.map((item) => ({
        ...item,
        name: t(item.nameKey),
        desc: t(item.descKey),
        tag: t(item.tagKey),
    }));

    const featuredItems = apiFeatured.length > 0 ? apiFeatured : fallbackFeatured;

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
        <section id="menu" style={{ background: "var(--background)", padding: "24px 24px 100px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Section header */}
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", padding: "6px 16px", marginBottom: "20px" }}>
                        <Sparkles size={10} style={{ color: "var(--primary)" }} />
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--g-muted-text)" }}>{t("featuredMenu.badge")}</span>
                    </div>
                    <h2
                        className="font-display"
                        style={{ fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}
                    >
                        {t("featuredMenu.heading")} <em style={{ color: "var(--primary)", fontStyle: "italic" }}>{t("featuredMenu.passion")}</em>
                    </h2>
                    <p style={{ marginTop: "12px", maxWidth: "380px", margin: "12px auto 0", fontSize: "0.88rem", lineHeight: 1.75, color: "var(--g-muted-text)", fontWeight: 300 }}>
                        {t("featuredMenu.subtext")}
                    </p>
                </div>

                {/* Product grid */}
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                    {featuredItems.map((item, idx) => {
                        const inCart = cartItems.some((cartItem) => cartItem.productId === item.id);

                        return (
                        <div
                            key={item.name}
                            className="card-hover animate-fade-up group"
                            onClick={() => onSelectItem(item)}
                            style={{ animationDelay: `${idx * 70}ms`, borderRadius: "24px", overflow: "hidden", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", backdropFilter: "blur(20px)", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                        >
                            {/* Image / emoji hero */}
                            <div
                                style={{ position: "relative", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                className={`bg-linear-to-br ${item.gradient}`}
                            >
                                {item.imageUrl ? (
                                    <div
                                        className="relative w-28 h-28 rounded-full p-1 transition-transform duration-700 group-hover:scale-110 z-10"
                                        style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 12px 40px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.4)" }}
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
                                    <span style={{ fontSize: "64px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))", zIndex: 1, position: "relative" }}>{item.emoji}</span>
                                )}
                                <span style={{ position: "absolute", top: "12px", right: "12px", borderRadius: "100px", padding: "4px 10px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", background: item.accentLight, color: item.accentText, zIndex: 2 }}>
                                    {item.tag}
                                </span>
                            </div>

                            {/* Body */}
                            <div style={{ padding: "20px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "8px", fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                                <p style={{ fontSize: "0.83rem", lineHeight: 1.65, color: "var(--g-muted-text)", marginBottom: "20px", fontWeight: 300 }}>{item.desc}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                                    <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em", fontFamily: "'Playfair Display', serif" }}>{item.price}</span>
                                    <button
                                        type="button"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", color: "var(--foreground)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.04em", transition: "all 0.25s", cursor: "pointer" }}
                                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "var(--g-card-bg-hover)"; }}
                                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "var(--g-soft-bg)"; }}
                                        onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}
                                    >
                                        <Eye size={11} /> Details
                                    </button>
                                </div>
                                <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                                    {inCart ? (
                                        <button
                                            type="button"
                                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", color: "var(--foreground)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer" }}
                                            onClick={(e) => { e.stopPropagation(); onViewBag(); }}
                                        >
                                            <ShoppingBag size={12} /> View Bag
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="order-btn"
                                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", border: "none", color: "var(--primary-foreground)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer" }}
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                                        >
                                            <ShoppingBag size={12} /> Add to Cart
                                        </button>
                                    )}
                                    <Link
                                        href="/menu"
                                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", color: "var(--primary)", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em", transition: "all 0.25s" }}
                                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--g-card-bg-hover)"; e.currentTarget.style.color = "var(--primary)"; }}
                                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--g-soft-bg)"; e.currentTarget.style.color = "var(--primary)"; }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t("featuredMenu.order")} <ArrowRight size={11} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

                {/* See full menu CTA */}
                <div style={{ textAlign: "center", marginTop: "56px" }}>
                    <Link
                        href="/menu"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "100px", border: "1px solid var(--g-card-border)", color: "var(--g-muted-text)", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none", transition: "all 0.3s", letterSpacing: "0.04em" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--g-soft-bg)"; e.currentTarget.style.borderColor = "var(--g-card-border)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--g-card-border)"; e.currentTarget.style.color = "var(--g-muted-text)"; }}
                    >
                        {t("featuredMenu.exploreFullMenu")} <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
