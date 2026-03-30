"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function HeroMinimalCleanSection() {
    const starPositions = [
        { top: "18%", left: "14%", size: "34px", rotate: "-8deg", opacity: 0.82 },
        { top: "23%", right: "18%", size: "22px", rotate: "10deg", opacity: 0.62 },
        { bottom: "20%", left: "22%", size: "18px", rotate: "-6deg", opacity: 0.56 },
        { bottom: "16%", right: "16%", size: "46px", rotate: "0deg", opacity: 0.9 },
        { top: "34%", left: "9%", size: "16px", rotate: "14deg", opacity: 0.44 },
        { top: "40%", right: "11%", size: "14px", rotate: "-12deg", opacity: 0.4 },
    ];

    return (
        <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-bg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay)" }} />
            <div style={{ position: "absolute", inset: 0, background: "var(--hero-overlay-2)" }} />
            <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "18px 18px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "12%", left: "-10%", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(214, 124, 19, 0.12)", filter: "blur(80px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-8%", right: "-6%", width: "420px", height: "340px", borderRadius: "50%", background: "rgba(83, 49, 128, 0.16)", filter: "blur(84px)", pointerEvents: "none" }} />
            {starPositions.map((star, index) => (
                <div
                    key={`${star.top ?? "auto"}-${star.left ?? "auto"}-${index}`}
                    style={{
                        position: "absolute",
                        top: star.top,
                        right: star.right,
                        bottom: star.bottom,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        clipPath: "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",
                        background: "var(--hero-corner-star)",
                        opacity: star.opacity,
                        transform: `rotate(${star.rotate})`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            <div style={{ position: "relative", zIndex: 10, maxWidth: "1080px", margin: "0 auto", width: "100%", padding: "124px 32px 116px" }}>
                <div className="animate-fade-up" style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
                        <h1
                            className="font-display"
                            style={{ fontSize: "clamp(3.4rem,8vw,6.2rem)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em", color: "var(--hero-heading-main)", marginBottom: "28px", textShadow: "0 2px 0 rgba(0,0,0,0.18)" }}
                        >
                            <span style={{ color: "var(--hero-heading-main)" }}>For </span>
                            <span style={{ color: "var(--hero-heading-accent)" }}>people who</span>
                            <br />
                            <span style={{ color: "var(--hero-heading-accent)" }}>love</span>
                            <span style={{ color: "var(--hero-heading-main)" }}> coffee</span>
                        </h1>

                        <p style={{ fontSize: "clamp(1rem,1.7vw,1.12rem)", lineHeight: 1.72, color: "var(--hero-body-text)", maxWidth: "620px", margin: "0 auto 42px", fontWeight: 500 }}>
                            Elevate your day with a featured cup that feels smooth, warm, and easy to order. Today&apos;s highlighted drink comes straight from your store specials while keeping your existing home background colors.
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
                            <Link
                                href="/menu"
                                className="order-btn"
                                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 26px", borderRadius: "12px", border: "1px solid rgba(216,138,45,0.22)", color: "var(--primary-foreground)", fontSize: "0.96rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 32px rgba(216,138,45,0.28)", textDecoration: "none" }}
                            >
                                <ShoppingBag size={16} /> Order Now
                            </Link>
                            <Link
                                href="#todays-special"
                                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 24px", borderRadius: "12px", border: "1px solid var(--hero-secondary-border)", background: "var(--hero-secondary-bg)", color: "var(--hero-secondary-text)", fontSize: "0.96rem", fontWeight: 700, textDecoration: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
                            >
                                Today&apos;s Special <ArrowRight size={16} />
                            </Link>
                        </div>
                </div>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(to bottom, transparent, var(--background))", pointerEvents: "none" }} />
        </section>
    );
}
