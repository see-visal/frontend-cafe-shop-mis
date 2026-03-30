"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useGetHomeShowcaseQuery } from "@/store/api/productsApi";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";
import { HERO_CARDS_DATA, type FeaturedItem } from "./homeData";

interface HeroMinimalReferenceSectionProps {
    onSelectItem: (item: FeaturedItem) => void;
}

export function HeroMinimalReferenceSection({ onSelectItem }: HeroMinimalReferenceSectionProps) {
    const { t } = useI18n();
    const dispatch = useAppDispatch();

    const { data: homeShowcase } = useGetHomeShowcaseQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const showcaseSpecial = homeShowcase?.todaySpecials?.[0] ?? homeShowcase?.featuredProducts?.[0];

    const activeItem: FeaturedItem = showcaseSpecial
        ? {
            id: showcaseSpecial.id,
            emoji: HERO_CARDS_DATA[0]?.emoji ?? "☕",
            imageUrl: resolveStorageUrl(showcaseSpecial.imageUrl) || HERO_CARDS_DATA[0]?.imageUrl,
            nameKey: "",
            descKey: "",
            tagKey: "",
            gradient: "",
            accent: "#d97706",
            accentLight: "rgba(245,158,11,0.18)",
            accentText: "#92400e",
            price: `$${Number(showcaseSpecial.price).toFixed(2)}`,
            name: showcaseSpecial.name,
            desc: showcaseSpecial.description || t("featuredMenu.subtext"),
            tag: showcaseSpecial.todaySpecial ? t("hero.todaySpecial") : (showcaseSpecial.category || t("hero.todaySpecial")),
        }
        : {
            id: HERO_CARDS_DATA[0].id,
            emoji: HERO_CARDS_DATA[0].emoji,
            imageUrl: HERO_CARDS_DATA[0].imageUrl,
            nameKey: HERO_CARDS_DATA[0].nameKey,
            descKey: HERO_CARDS_DATA[0].descKey,
            tagKey: "",
            gradient: "",
            accent: "#d97706",
            accentLight: "rgba(245,158,11,0.18)",
            accentText: "#92400e",
            price: HERO_CARDS_DATA[0].price,
            name: t(HERO_CARDS_DATA[0].nameKey),
            desc: t(HERO_CARDS_DATA[0].descKey),
            tag: t("hero.todaySpecial"),
        };

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

    const beanPositions = [
        { left: "12%", top: "24%", rotate: "-12deg", size: "2.1rem" },
        { left: "38%", top: "10%", rotate: "12deg", size: "2.2rem" },
        { left: "67%", top: "5%", rotate: "-8deg", size: "2rem" },
        { left: "84%", top: "19%", rotate: "12deg", size: "2.1rem" },
        { left: "16%", top: "70%", rotate: "-11deg", size: "2rem" },
        { left: "80%", top: "72%", rotate: "8deg", size: "2.1rem" },
    ];

    return (
        <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-bg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay-2)" }} />
            <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "18px 18px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "12%", left: "-10%", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(214, 124, 19, 0.12)", filter: "blur(80px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-8%", right: "-6%", width: "420px", height: "340px", borderRadius: "50%", background: "rgba(83, 49, 128, 0.16)", filter: "blur(84px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "116px 32px 100px" }}>
                <div style={{ display: "grid", gap: "40px", alignItems: "center" }} className="grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="animate-fade-up" style={{ maxWidth: "560px" }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.56)", marginBottom: "18px" }}>
                            {activeItem.tag}
                        </p>

                        <h1
                            className="font-display"
                            style={{ fontSize: "clamp(3.6rem,8vw,6.3rem)", fontWeight: 900, lineHeight: 0.93, letterSpacing: "-0.055em", color: "#f8f1eb", marginBottom: "28px", textShadow: "0 2px 0 rgba(0,0,0,0.28)" }}
                        >
                            <span style={{ display: "block" }}>For</span>
                            <span style={{ display: "block" }}>
                                people<span style={{ color: "#d88a2d" }}>who</span>
                            </span>
                            <span style={{ display: "block" }}>
                                <span style={{ color: "#d88a2d" }}>love</span> coffee
                            </span>
                        </h1>

                        <p style={{ fontSize: "clamp(1rem,1.7vw,1.12rem)", lineHeight: 1.72, color: "rgba(244,236,229,0.76)", maxWidth: "520px", marginBottom: "42px", fontWeight: 500 }}>
                            Elevate your day with a featured cup that feels smooth, warm, and easy to order. Today&apos;s highlighted drink comes straight from your store specials while keeping your existing home background colors.
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                            <button
                                type="button"
                                className="order-btn"
                                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 26px", borderRadius: "12px", border: "1px solid rgba(216,138,45,0.22)", color: "var(--primary-foreground)", fontSize: "0.96rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 32px rgba(216,138,45,0.28)" }}
                                onClick={() => handleAddToCart(activeItem)}
                            >
                                <ShoppingBag size={16} /> Order Now
                            </button>
                            <Link
                                href="/menu"
                                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.10)", color: "#f7f0ea", fontSize: "0.96rem", fontWeight: 700, textDecoration: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                            >
                                Browse Our Menu <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="animate-fade-in delay-200" style={{ position: "relative", minHeight: "620px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {beanPositions.map((bean, idx) => (
                            <span
                                key={`${bean.left}-${bean.top}`}
                                className="emoji-float"
                                style={{
                                    position: "absolute",
                                    left: bean.left,
                                    top: bean.top,
                                    fontSize: bean.size,
                                    filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.2))",
                                    transform: `rotate(${bean.rotate})`,
                                    animationDelay: `${idx * 0.5}s`,
                                    zIndex: 3,
                                }}
                            >
                                ðŸ«˜
                            </span>
                        ))}

                        <button
                            type="button"
                            onClick={() => onSelectItem(activeItem)}
                            aria-label={`Open details for ${activeItem.name}`}
                            style={{ position: "relative", width: "100%", maxWidth: "560px", minHeight: "560px", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                            <div style={{ position: "absolute", inset: "7% 12%", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.08) 0%, rgba(217,119,6,0) 72%)", filter: "blur(16px)" }} />
                            <div style={{ position: "absolute", left: "50%", bottom: "7%", transform: "translateX(-50%)", width: "76%", height: "38%", borderRadius: "50%", background: "radial-gradient(circle, rgba(77,18,20,0.96) 0%, rgba(77,18,20,0.96) 54%, rgba(248,231,204,0.94) 55%, rgba(248,231,204,0.94) 74%, rgba(248,231,204,0) 75%)" }} />

                            <div style={{ position: "absolute", left: "50%", top: "14%", transform: "translateX(-50%)", width: "42%", height: "66px", borderRadius: "26px 26px 14px 14px", background: "linear-gradient(90deg, #241814 0%, #12100f 50%, #302120 100%)", boxShadow: "0 14px 30px rgba(0,0,0,0.24)", zIndex: 4 }} />
                            <div style={{ position: "absolute", left: "50%", top: "23%", transform: "translateX(-50%)", width: "52%", height: "22px", borderRadius: "12px", background: "linear-gradient(90deg, #1a1311 0%, #070707 50%, #241916 100%)", zIndex: 3 }} />

                            <div style={{ position: "absolute", left: "50%", top: "24%", transform: "translateX(-50%)", width: "36%", height: "58%", background: "linear-gradient(90deg, #95652e 0%, #c79d60 36%, #e4c489 50%, #c9995c 68%, #8c5f2c 100%)", clipPath: "polygon(16% 0%, 84% 0%, 72% 100%, 28% 100%)", boxShadow: "0 24px 44px rgba(0,0,0,0.18)", zIndex: 2, overflow: "hidden" }}>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 20%, rgba(26,16,10,0.16) 100%)" }} />
                            </div>

                            <div style={{ position: "absolute", left: "50%", top: "59%", transform: "translate(-50%, -50%)", width: "25%", aspectRatio: "1 / 1", borderRadius: "50%", background: "linear-gradient(180deg, rgba(41,30,24,0.98) 0%, rgba(58,43,34,0.96) 100%)", border: "9px solid #bd7f35", boxShadow: "inset 0 0 0 2px rgba(37,24,16,0.7), 0 12px 24px rgba(0,0,0,0.16)", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ position: "absolute", inset: "9px", borderRadius: "50%", border: "4px dotted rgba(20,12,8,0.82)" }} />
                                <div style={{ textAlign: "center", padding: "0 10px" }}>
                                    <div style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.16em", color: "#fff6ec", textTransform: "uppercase", marginBottom: "6px" }}>
                                        {activeItem.tag}
                                    </div>
                                    <div style={{ height: "1px", background: "rgba(255,255,255,0.35)", marginBottom: "6px" }} />
                                    <div style={{ fontSize: "1rem", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", color: "#fff6ec", fontFamily: "'Playfair Display', serif" }}>
                                        {activeItem.name}
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: "absolute", left: "50%", top: "34%", transform: "translateX(-50%)", width: "32%", aspectRatio: "1 / 1", zIndex: 6 }}>
                                {activeItem.imageUrl ? (
                                    <Image
                                        src={activeItem.imageUrl}
                                        alt={activeItem.name}
                                        fill
                                        unoptimized={isRemoteStorageUrl(activeItem.imageUrl)}
                                        className="object-contain"
                                        sizes="280px"
                                    />
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: "5.5rem" }}>
                                        {activeItem.emoji}
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(to bottom, transparent, var(--background))", pointerEvents: "none" }} />
        </section>
    );
}
