"use client";

import React from "react";
import { Counter } from "@/components/ui/Counter";
import { useI18n } from "@/lib/i18n";

/**
 * Home page — Stats strip section.
 * Animated number counters for key social proof metrics.
 */
export function StatsSection() {
    const { t } = useI18n();

    const STATS = [
        { value: 50000, suffix: "+", label: t("stats.happyCustomers"), sub: t("stats.counting") },
        { value: 12, suffix: "", label: t("stats.roastOrigins"), sub: t("stats.globallySourced") },
        { value: 3, suffix: "", label: t("stats.locations"), sub: t("stats.inTheCity") },
        { value: 98, suffix: "%", label: t("stats.satisfaction"), sub: t("stats.verifiedReviews") },
    ];

    return (
        <section style={{ background: "var(--background)", padding: "60px 24px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div className="divider-line" style={{ marginBottom: "48px" }} />

                <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "var(--g-card-border)", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--g-card-border)" }}
                    className="md:grid-cols-4"
                >
                    {STATS.map((s) => (
                        <div
                            key={s.label}
                            style={{ background: "var(--background)", padding: "36px 24px", textAlign: "center", transition: "background 0.3s" }}
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "var(--background)"; }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "var(--background)"; }}
                        >
                            <div style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                                <Counter end={s.value} suffix={s.suffix} />
                            </div>
                            <p style={{ marginTop: "8px", fontSize: "0.8rem", fontWeight: 600, color: "var(--g-muted-text)", letterSpacing: "0.04em" }}>{s.label}</p>
                            <p style={{ marginTop: "3px", fontSize: "0.7rem", color: "var(--g-muted-text)" }}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="divider-line" style={{ marginTop: "48px" }} />
            </div>
        </section>
    );
}
