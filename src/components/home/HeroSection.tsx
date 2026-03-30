"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ArrowRight, Eye, ShoppingBag, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useGetHomeShowcaseQuery } from "@/store/api/productsApi";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { HERO_CARDS_DATA, type FeaturedItem } from "./homeData";

interface HeroSectionProps {
    onSelectItem: (item: FeaturedItem) => void;
}

/**
 * Home page â€” Hero section.
 * Full-screen intro with animated headline, social proof, and two hero product cards.
 */
export function HeroSection({ onSelectItem }: HeroSectionProps) {
    const { t } = useI18n();
    const dispatch = useAppDispatch();

    const { data: homeShowcase } = useGetHomeShowcaseQuery(
        undefined,
        {
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        },
    );

    const showcaseSpecials = homeShowcase?.todaySpecials?.length
        ? homeShowcase.todaySpecials
        : homeShowcase?.featuredProducts?.slice(0, 2) ?? [];

    const heroItems: FeaturedItem[] = showcaseSpecials.length
        ? showcaseSpecials.slice(0, 2).map((product, idx) => {
            const heroCard = HERO_CARDS_DATA[idx % HERO_CARDS_DATA.length];

            return {
                id: product.id,
                emoji: heroCard.emoji,
                imageUrl: product.imageUrl || heroCard.imageUrl,
                nameKey: "",
                descKey: "",
                tagKey: "",
                gradient: "",
                accent: "#d97706",
                accentLight: "rgba(245,158,11,0.18)",
                accentText: "#92400e",
                price: `$${Number(product.price).toFixed(2)}`,
                name: product.name,
                desc: product.description || t("featuredMenu.subtext"),
                tag: product.todaySpecial ? t("hero.todaySpecial") : (product.category || t("hero.todaySpecial")),
            };
        })
        : HERO_CARDS_DATA.slice(0, 2).map((card) => ({
            id: card.id,
            emoji: card.emoji,
            imageUrl: card.imageUrl,
            nameKey: card.nameKey,
            descKey: card.descKey,
            tagKey: "",
            gradient: "",
            accent: "#d97706",
            accentLight: "rgba(245,158,11,0.18)",
            accentText: "#92400e",
            price: card.price,
            name: t(card.nameKey),
            desc: t(card.descKey),
            tag: t("hero.todaySpecial"),
        }));

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
        <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

            {/* Backgrounds */}
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-bg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay-2)" }} />
            <div style={{ position: "absolute", bottom: "6%", left: "-6%", width: "460px", height: "320px", borderRadius: "50%", background: "var(--hero-orb)", filter: "blur(64px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "120px 32px 100px" }}>
                <div style={{ display: "grid", gap: "48px", alignItems: "center" }} className="grid-cols-1 md:grid-cols-2">

                    {/* Left â€” Text */}
                    <div>
                        <div
                            className="animate-fade-up"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--g-soft-border)", borderRadius: "100px", padding: "6px 16px", marginBottom: "28px", background: "var(--g-soft-bg-strong)", backdropFilter: "blur(18px)", boxShadow: "0 14px 36px rgba(42, 62, 34, 0.08)" }}
                        >
                            <Sparkles size={11} style={{ color: "var(--primary)" }} />
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--g-muted-text)" }}>
                                {t("hero.badge")}
                            </span>
                        </div>

                        <h1
                            className="animate-fade-up delay-100 font-display"
                            style={{ fontSize: "clamp(3rem,8vw,5.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em", color: "var(--foreground)", marginBottom: "24px", fontFamily: "'Playfair Display', serif" }}
                        >
                            {t("hero.headline1")}<br />
                            <span className="shimmer-text" style={{ display: "inline-block" }}>
                                {t("hero.headline2")}
                            </span>
                        </h1>

                        <p
                            className="animate-fade-up delay-200"
                            style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.85, color: "var(--g-muted-text)", maxWidth: "460px", marginBottom: "36px", fontWeight: 300 }}
                        >
                            {t("hero.subtext")}
                        </p>

                        <div className="animate-fade-up delay-300" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            <Link
                                href="/menu"
                                className="order-btn"
                                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "100px", border: "none", color: "var(--primary-foreground)", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.02em", textDecoration: "none" }}
                            >
                                {t("hero.browseMenu")} <ArrowRight size={15} />
                            </Link>
                            <a
                                href="#our-story"
                                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "100px", border: "1px solid var(--g-soft-border)", color: "var(--g-muted-text)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "all 0.25s", background: "var(--g-soft-bg)", backdropFilter: "blur(14px)" }}
                                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = "var(--g-card-border)"; e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--g-card-bg)"; }}
                                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = "var(--g-soft-border)"; e.currentTarget.style.color = "var(--g-muted-text)"; e.currentTarget.style.background = "var(--g-soft-bg)"; }}
                            >
                                {t("hero.ourStory")}
                            </a>
                        </div>

                        <div className="animate-fade-up delay-400" style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "36px" }}>
                            <div style={{ display: "flex" }}>
                                {["M", "S", "K", "A"].map((l, i) => (
                                    <div
                                        key={l}
                                        style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid var(--background)", background: `hsl(${25 + i * 15},60%,${58 + i * 5}%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", marginLeft: i === 0 ? 0 : "-10px", zIndex: 4 - i }}
                                    >
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ display: "flex", gap: "2px" }}>
                                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} style={{ fill: "var(--primary)", color: "var(--primary)" }} />)}
                                </div>
                                <p style={{ marginTop: "3px", fontSize: "0.68rem", color: "var(--g-muted-text)", letterSpacing: "0.02em" }}>{t("hero.socialProof")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right â€” Hero product cards */}
                    <div style={{ display: "flex", gap: "24px", position: "relative", width: "100%" }} className="mt-10 md:mt-0 flex-col md:flex-row animate-fade-in delay-300">
                        <div style={{ position: "absolute", inset: "-20px", borderRadius: "40px", background: "rgba(83, 117, 74, 0.16)", filter: "blur(40px)", pointerEvents: "none" }} />

                        {heroItems.map((item, idx) => {
                            const heroCard = HERO_CARDS_DATA[idx % HERO_CARDS_DATA.length];

                            return (
                                <div
                                    key={item.id}
                                    style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minWidth: "200px", borderRadius: "28px", border: "1px solid var(--g-soft-border)", background: "linear-gradient(180deg, var(--g-soft-bg-strong) 0%, var(--g-soft-bg) 100%)", padding: "20px", backdropFilter: "blur(30px) saturate(160%)", boxShadow: "0 24px 80px rgba(42,55,32,0.12), inset 0 1px 0 rgba(255,255,255,0.22)", transition: "all 0.4s" }}
                                    className="hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(76,108,63,0.18)] group"
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                        <span style={{ borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-soft-border)", padding: "4px 12px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)" }}>
                                            {t("hero.todaySpecial")}
                                        </span>
                                        <span style={{ fontSize: "0.6rem", color: "var(--g-muted-text)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{t("hero.limited")}</span>
                                    </div>

                                    <div style={{ height: "100px", borderRadius: "18px", background: heroCard.bgGradient, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "1px solid rgba(255, 255, 255, 0.40)", position: "relative", overflow: "hidden" }}>
                                        {item.imageUrl ? (
                                            <div
                                                className="relative w-16 h-16 rounded-full p-1 transition-transform duration-700 group-hover:scale-110 z-10"
                                                style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)" }}
                                            >
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    unoptimized={item.imageUrl.startsWith("http://") || item.imageUrl.startsWith("https://")}
                                                    className="object-cover rounded-full"
                                                    sizes="64px"
                                                />
                                            </div>
                                        ) : (
                                            <span className="emoji-float" style={{ fontSize: "56px", display: "block", position: "relative", zIndex: 1 }}>{item.emoji}</span>
                                        )}
                                    </div>

                                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "8px", fontFamily: "'Playfair Display', serif" }}>
                                        {item.name}
                                    </h3>
                                    <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "var(--g-muted-text)", marginBottom: "16px", fontWeight: 300 }}>
                                        {item.desc}
                                    </p>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "auto", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em", fontFamily: "'Playfair Display', serif" }}>{item.price}</span>
                                        <button
                                            type="button"
                                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "100px", background: "var(--g-soft-bg)", border: "1px solid var(--g-soft-border)", color: "var(--foreground)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer" }}
                                            onClick={() => onSelectItem(item)}
                                        >
                                            <Eye size={12} /> Details
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="order-btn"
                                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px 16px", borderRadius: "100px", border: "none", color: "var(--primary-foreground)", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer" }}
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <ShoppingBag size={13} /> Add to Cart
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(to bottom, transparent, var(--background))", pointerEvents: "none" }} />
        </section>
    );
}
