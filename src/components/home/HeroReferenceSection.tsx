"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { ArrowRight, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useGetHomeShowcaseQuery } from "@/store/api/productsApi";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";
import { HERO_CARDS_DATA, type FeaturedItem } from "./homeData";

interface HeroReferenceSectionProps {
    onSelectItem: (item: FeaturedItem) => void;
}

export function HeroReferenceSection({ onSelectItem }: HeroReferenceSectionProps) {
    const { t } = useI18n();
    const dispatch = useAppDispatch();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [selectedSize, setSelectedSize] = React.useState<"large" | "small">("large");

    const { data: homeShowcase } = useGetHomeShowcaseQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const showcaseSpecials = homeShowcase?.todaySpecials?.length
        ? homeShowcase.todaySpecials
        : homeShowcase?.featuredProducts?.slice(0, 3) ?? [];

    const heroItems: FeaturedItem[] = showcaseSpecials.length
        ? showcaseSpecials.slice(0, 3).map((product, idx) => {
            const heroCard = HERO_CARDS_DATA[idx % HERO_CARDS_DATA.length];

            return {
                id: product.id,
                emoji: heroCard.emoji,
                imageUrl: resolveStorageUrl(product.imageUrl) || heroCard.imageUrl,
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
        : HERO_CARDS_DATA.slice(0, 3).map((card) => ({
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

    const activeItem = heroItems[Math.min(selectedIndex, Math.max(heroItems.length - 1, 0))];

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

    if (!activeItem) return null;

    const beanPositions = [
        { left: "7%", top: "21%", rotate: "-14deg", size: "2.3rem" },
        { left: "38%", top: "7%", rotate: "12deg", size: "2.7rem" },
        { left: "64%", top: "2%", rotate: "-8deg", size: "2.2rem" },
        { left: "82%", top: "18%", rotate: "13deg", size: "2.8rem" },
        { left: "12%", top: "72%", rotate: "-10deg", size: "2.4rem" },
        { left: "84%", top: "74%", rotate: "9deg", size: "2.5rem" },
    ];

    return (
        <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-bg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay-2)" }} />
            <div style={{ position: "absolute", bottom: "6%", left: "-6%", width: "460px", height: "320px", borderRadius: "50%", background: "var(--hero-orb)", filter: "blur(64px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "1240px", margin: "0 auto", width: "100%", padding: "118px 32px 100px" }}>
                <div style={{ display: "grid", gap: "52px", alignItems: "center" }} className="grid-cols-1 lg:grid-cols-[1.02fr_1fr]">
                    <div className="animate-fade-up">
                        <div
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", padding: "7px 16px", marginBottom: "24px" }}
                        >
                            <Sparkles size={11} style={{ color: "var(--primary)" }} />
                            <span style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)" }}>
                                {t("hero.todaySpecial")}
                            </span>
                        </div>

                        <h1
                            className="font-display"
                            style={{ fontSize: "clamp(3.15rem,7vw,5.75rem)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.05em", color: "var(--foreground)", marginBottom: "26px", maxWidth: "650px", fontFamily: "'Playfair Display', serif" }}
                        >
                            For people
                            <span style={{ color: "var(--primary)", marginInline: "10px" }}>who love</span>
                            coffee
                        </h1>

                        <p
                            style={{ fontSize: "clamp(0.98rem,1.9vw,1.14rem)", lineHeight: 1.82, color: "var(--g-muted-text)", maxWidth: "560px", marginBottom: "38px", fontWeight: 400 }}
                        >
                            Elevate your day with a featured cup that feels smooth, warm, and easy to order. Today&apos;s highlighted drink comes straight from your store specials while keeping your existing home background colors.
                        </p>

                        <div style={{ maxWidth: "500px", marginBottom: "30px" }}>
                            <div style={{ marginBottom: "18px" }}>
                                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "12px", fontFamily: "'Playfair Display', serif" }}>
                                    Today&apos;s picks
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 22px" }}>
                                    {heroItems.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedIndex(idx)}
                                            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", padding: 0, cursor: "pointer", color: idx === selectedIndex ? "var(--foreground)" : "var(--g-muted-text)", fontSize: "0.96rem", fontWeight: 500 }}
                                        >
                                            <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: `1.5px solid ${idx === selectedIndex ? "var(--foreground)" : "rgba(60,35,10,0.35)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: idx === selectedIndex ? "var(--primary)" : "transparent" }} />
                                            </span>
                                            <span>{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ height: "1px", background: "rgba(60,35,10,0.18)", margin: "18px 0 20px" }} />

                            <div style={{ marginBottom: "30px" }}>
                                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "12px", fontFamily: "'Playfair Display', serif" }}>
                                    Sizes
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 26px" }}>
                                    {[
                                        { id: "large", label: "Large" },
                                        { id: "small", label: "Small" },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setSelectedSize(option.id as "large" | "small")}
                                            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", padding: 0, cursor: "pointer", color: selectedSize === option.id ? "var(--foreground)" : "var(--g-muted-text)", fontSize: "0.96rem", fontWeight: 500 }}
                                        >
                                            <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: `1.5px solid ${selectedSize === option.id ? "var(--foreground)" : "rgba(60,35,10,0.35)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: selectedSize === option.id ? "var(--primary)" : "transparent" }} />
                                            </span>
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                <button
                                    type="button"
                                    className="order-btn"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "8px", border: "1px solid rgba(180,140,80,0.28)", color: "var(--primary-foreground)", fontSize: "0.94rem", fontWeight: 700, letterSpacing: "0.02em", cursor: "pointer" }}
                                    onClick={() => handleAddToCart(activeItem)}
                                >
                                    <ShoppingBag size={16} /> Order Now
                                </button>
                                <button
                                    type="button"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 24px", borderRadius: "8px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", color: "var(--foreground)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
                                    onClick={() => onSelectItem(activeItem)}
                                >
                                    <Eye size={15} /> Details
                                </button>
                                <Link
                                    href="/menu"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 22px", borderRadius: "8px", border: "1px solid transparent", color: "var(--g-muted-text)", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}
                                >
                                    {t("hero.browseMenu")} <ArrowRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="animate-fade-in delay-200" style={{ position: "relative", minHeight: "620px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ position: "absolute", inset: "14% 9% 12%", borderRadius: "50%", background: "radial-gradient(circle, rgba(173,115,36,0.10) 0%, rgba(173,115,36,0) 70%)", filter: "blur(12px)" }} />

                        <div style={{ position: "absolute", width: "78%", aspectRatio: "1 / 1", borderRadius: "50%", opacity: 0.68 }}>
                            {Array.from({ length: 24 }).map((_, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "50%",
                                        width: idx % 2 === 0 ? "34%" : "28%",
                                        height: "1.5px",
                                        background: "linear-gradient(90deg, rgba(180,140,80,0.02), rgba(180,140,80,0.22), rgba(180,140,80,0.02))",
                                        transformOrigin: "0% 50%",
                                        transform: `rotate(${idx * 15}deg) translateX(20%)`,
                                    }}
                                />
                            ))}
                        </div>

                        {beanPositions.map((bean, idx) => (
                            <span
                                key={`${bean.left}-${bean.top}`}
                                className="emoji-float"
                                style={{
                                    position: "absolute",
                                    left: bean.left,
                                    top: bean.top,
                                    fontSize: bean.size,
                                    filter: "drop-shadow(0 8px 16px rgba(78,53,18,0.18))",
                                    transform: `rotate(${bean.rotate})`,
                                    animationDelay: `${idx * 0.45}s`,
                                }}
                            >
                                🫘
                            </span>
                        ))}

                        <div style={{ position: "relative", width: "100%", maxWidth: "520px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ position: "absolute", bottom: "6%", width: "82%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,21,22,0.96) 0%, rgba(74,21,22,0.96) 56%, rgba(252,231,192,0.95) 57%, rgba(252,231,192,0.95) 74%, rgba(252,231,192,0) 75%)" }} />

                            <div style={{ position: "relative", width: "65%", maxWidth: "340px", minHeight: "430px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ width: "96%", height: "62px", borderRadius: "28px 28px 18px 18px", background: "linear-gradient(90deg, #3a2721 0%, #201613 50%, #4a332c 100%)", boxShadow: "0 12px 24px rgba(36,22,6,0.22)", position: "relative", zIndex: 3 }} />
                                <div style={{ width: "104%", height: "24px", marginTop: "-9px", borderRadius: "0 0 28px 28px", background: "linear-gradient(90deg, #231916 0%, #0f0b0a 45%, #2f211d 100%)", transform: "skewX(-8deg)", zIndex: 2 }} />
                                <div style={{ width: "90%", flex: 1, minHeight: "320px", marginTop: "-2px", background: "linear-gradient(90deg, #8a5a25 0%, #c59760 34%, #d5b17d 50%, #bc8b4c 74%, #9a6930 100%)", clipPath: "polygon(12% 0%, 88% 0%, 76% 100%, 24% 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", zIndex: 1 }}>
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 18%, rgba(60,32,12,0.10) 100%)" }} />
                                    <div style={{ width: "45%", aspectRatio: "1 / 1", borderRadius: "50%", background: "linear-gradient(180deg, rgba(45,33,24,0.96) 0%, rgba(58,45,34,0.92) 100%)", border: "10px solid #c8873a", boxShadow: "inset 0 0 0 2px rgba(37,24,16,0.8), 0 10px 24px rgba(37,24,16,0.18)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
                                        <div style={{ position: "absolute", inset: "10px", borderRadius: "50%", border: "4px dotted rgba(28,18,12,0.85)" }} />
                                        <div style={{ textAlign: "center", padding: "0 14px" }}>
                                            <div style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.18em", color: "#fff6eb", textTransform: "uppercase" }}>
                                                {activeItem.tag}
                                            </div>
                                            <div style={{ height: "1px", background: "rgba(255,255,255,0.4)", margin: "10px 0" }} />
                                            <div style={{ fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff8f0", fontFamily: "'Playfair Display', serif", lineHeight: 0.92 }}>
                                                {activeItem.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ position: "absolute", top: "32%", left: "50%", width: selectedSize === "large" ? "58%" : "50%", aspectRatio: "1 / 1", transform: "translate(-50%, -6%)", zIndex: 2 }}>
                                    {activeItem.imageUrl ? (
                                        <Image
                                            src={activeItem.imageUrl}
                                            alt={activeItem.name}
                                            fill
                                            unoptimized={isRemoteStorageUrl(activeItem.imageUrl)}
                                            className="object-contain"
                                            sizes="320px"
                                        />
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: "6rem" }}>
                                            {activeItem.emoji}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ position: "absolute", right: "4%", bottom: "8%", borderRadius: "20px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", backdropFilter: "blur(18px)", padding: "14px 16px", maxWidth: "220px", boxShadow: "0 16px 34px rgba(36,22,6,0.10)" }}>
                            <p style={{ fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, marginBottom: "8px" }}>
                                {t("hero.todaySpecial")}
                            </p>
                            <p style={{ fontSize: "1rem", color: "var(--foreground)", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                {activeItem.name}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "var(--g-muted-text)", lineHeight: 1.6, marginTop: "6px", marginBottom: "10px" }}>
                                {activeItem.desc}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                <span style={{ fontSize: "1.24rem", fontWeight: 900, color: "var(--primary)", fontFamily: "'Playfair Display', serif" }}>
                                    {activeItem.price}
                                </span>
                                <button
                                    type="button"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", border: "1px solid var(--g-card-border)", background: "var(--g-soft-bg)", color: "var(--foreground)", padding: "8px 12px", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                                    onClick={() => onSelectItem(activeItem)}
                                >
                                    <Eye size={12} /> Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(to bottom, transparent, var(--background))", pointerEvents: "none" }} />
        </section>
    );
}
