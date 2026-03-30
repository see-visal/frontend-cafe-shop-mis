"use client";

import React from "react";
import { Leaf, Star, Clock, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Home page — Values / Our Story section.
 * Four value proposition cards with hover effects.
 */
export function ValuesSection() {
    const { t } = useI18n();

    const VALUES = [
        { icon: <Leaf size={20} />, title: t("values.sustainablySourced"), desc: t("values.sustainablySourcedDesc"), num: "01" },
        { icon: <Star size={20} />, title: t("values.baristaCertified"), desc: t("values.baristaCertifiedDesc"), num: "02" },
        { icon: <Clock size={20} />, title: t("values.madeToOrder"), desc: t("values.madeToOrderDesc"), num: "03" },
        { icon: <MapPin size={20} />, title: t("values.communityFirst"), desc: t("values.communityFirstDesc"), num: "04" },
    ];

    return (
        <section id="our-story" style={{ position: "relative", overflow: "hidden", background: "transparent", padding: "100px 24px" }}>
            {/* Backgrounds */}
            <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)" }} />
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(200,130,30,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>

                {/* Section header */}
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "100px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", padding: "6px 16px", marginBottom: "20px" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--g-muted-text)" }}>{t("values.badge")}</span>
                    </div>
                    <h2
                        className="font-display"
                        style={{ fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}
                    >
                        {t("values.heading1")} <span style={{ color: "var(--primary)" }}>&</span> Co. {t("values.heading2")}
                    </h2>
                    <p style={{ marginTop: "12px", maxWidth: "360px", margin: "12px auto 0", fontSize: "0.88rem", lineHeight: 1.75, color: "var(--g-muted-text)", fontWeight: 300 }}>
                        {t("values.subtext")}
                    </p>
                </div>

                {/* Values grid */}
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                    {VALUES.map((v) => (
                        <div
                            key={v.title}
                            style={{ position: "relative", borderRadius: "24px", border: "1px solid var(--g-card-border)", background: "var(--g-card-bg)", backdropFilter: "blur(20px)", padding: "28px", transition: "all 0.35s", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "var(--g-card-bg-hover)"; e.currentTarget.style.borderColor = "var(--g-card-border)"; }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "var(--g-card-bg)"; e.currentTarget.style.borderColor = "var(--g-card-border)"; }}
                        >
                            {/* Icon */}
                            <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "var(--g-soft-bg)", border: "1px solid var(--g-card-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", marginBottom: "20px" }}>
                                {v.icon}
                            </div>

                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em", marginBottom: "10px" }}>{v.title}</h3>
                            <p style={{ fontSize: "0.83rem", lineHeight: 1.7, color: "var(--g-muted-text)", fontWeight: 300 }}>{v.desc}</p>

                            {/* Watermark number */}
                            <div style={{ position: "absolute", bottom: "16px", right: "20px", fontSize: "3.5rem", fontWeight: 900, color: "rgba(0,0,0,0.04)", lineHeight: 1, userSelect: "none", fontFamily: "'Playfair Display', serif" }}>
                                {v.num}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
