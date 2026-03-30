"use client";

import Link from "next/link";
import React from "react";
import { ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Home page — CTA Banner / Locations section.
 * Full-width warm gradient call-to-action with two buttons.
 */
export function CTASection() {
    const { t } = useI18n();

    return (
        <section id="locations" style={{ position: "relative", overflow: "hidden", padding: "100px 24px" }}>
            {/* Backgrounds */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--background) 0%, var(--background) 40%, var(--background) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top left, rgba(200,130,30,0.06) 0%, transparent 55%)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }} />

            <div style={{ position: "relative", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", padding: "6px 16px", marginBottom: "24px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--g-muted-text)" }}>{t("cta.badge")}</span>
                </div>

                <h2
                    className="font-display"
                    style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--foreground)", marginBottom: "20px", fontFamily: "'Playfair Display', serif" }}
                >
                    {t("cta.heading")}
                </h2>

                <p style={{ fontSize: "clamp(0.88rem,2vw,1rem)", lineHeight: 1.8, color: "var(--g-muted-text)", maxWidth: "440px", margin: "0 auto 40px", fontWeight: 300 }}>
                    {t("cta.subtext")}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
                    <Link
                        href="/menu"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 30px", borderRadius: "100px", background: "var(--foreground)", color: "var(--background)", fontSize: "0.9rem", fontWeight: 800, textDecoration: "none", transition: "all 0.3s", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", letterSpacing: "0.02em" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)"; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--foreground)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)"; }}
                    >
                        <ShoppingBag size={16} /> {t("cta.startOrder")}
                    </Link>
                    <a
                        href="#our-story"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 30px", borderRadius: "100px", border: "1px solid var(--g-card-border)", color: "var(--g-muted-text)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "all 0.25s" }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "var(--g-soft-bg)"; e.currentTarget.style.color = "var(--foreground)"; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--g-muted-text)"; }}
                    >
                        {t("cta.learnMore")}
                    </a>
                </div>
            </div>
        </section>
    );
}
