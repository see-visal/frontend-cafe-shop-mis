"use client";

import { useState } from "react";

// Shared layout components (reusable across pages)
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/CartDrawer";

// Home-page specific section components
import { HomeStyles } from "@/components/home/HomeStyles";
import { HeroMinimalCleanSection } from "@/components/home/HeroMinimalCleanSection";
import { TodaysSpecialSection } from "@/components/home/TodaysSpecialSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { CTASection } from "@/components/home/CTASection";
import { QuickViewModal } from "@/components/home/QuickViewModal";

import type { FeaturedItem } from "@/components/home/homeData";

/**
 * Home page — thin orchestrator.
 * All sections live in their own focused components.
 * Shared components (Navbar, Footer) are imported from @/components/layout.
 */
export default function HomePage() {
    const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <div className="min-h-screen home-page" style={{ background: "var(--background)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

            {/* CSS keyframes & home-page utility classes */}
            <HomeStyles />

            {/* Film-grain overlay */}
            <div className="grain" />

            {/* ── Shared navigation ── */}
            <Navbar />

            {/* ── Page sections ── */}
            <HeroMinimalCleanSection />
            <TodaysSpecialSection onSelectItem={setSelectedItem} onViewBag={() => setCartOpen(true)} />
            <FeaturedSection onSelectItem={setSelectedItem} onViewBag={() => setCartOpen(true)} />
            <ValuesSection />
            <CTASection />
            <StatsSection />

            {/* ── Shared footer ── */}
            <Footer />

            {/* ── Quick-view modal (state lifted here so any section can trigger it) ── */}
            {selectedItem && (
                <QuickViewModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onViewBag={() => setCartOpen(true)}
                />
            )}

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
