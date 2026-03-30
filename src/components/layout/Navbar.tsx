"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const { t } = useI18n();

    const NAV_LINKS = [
        { label: t("nav.home"), href: "#home" },
        { label: t("nav.menu"), href: "#menu" },
        { label: t("nav.ourStory"), href: "#our-story" },
        { label: t("nav.locations"), href: "#locations" },
    ];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const fn = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
        if (typeof mq.addEventListener === "function") {
            mq.addEventListener("change", fn);
            return () => mq.removeEventListener("change", fn);
        }

        mq.addListener(fn);
        return () => mq.removeListener(fn);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [menuOpen]);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [menuOpen]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@400;500;600&display=swap');

                .nb-shell {
                    width: min(1200px, calc(100% - 24px));
                    margin: 10px auto 0;
                    padding: 0 18px;
                    height: 66px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    border-radius: 999px;
                    border: 1px solid var(--nb-shell-border, rgba(180, 140, 80, 0.22));
                    background: var(--nb-shell-bg, rgba(255, 255, 255, 0.68));
                    box-shadow: var(--nb-shell-shadow, 0 8px 28px rgba(36, 22, 6, 0.12));
                    backdrop-filter: blur(22px) saturate(165%);
                    transition: background 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
                }

                .nb-scrolled .nb-shell {
                    background: var(--nb-scrolled-bg);
                    border-color: var(--nb-scrolled-border);
                    box-shadow: 0 10px 34px rgba(0,0,0,0.16);
                }

                /* ── Brand ── */
                .nb-brand {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.38rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: var(--nb-brand-color);
                    line-height: 1;
                    text-shadow: 0 1px 0 rgba(255,255,255,0.35);
                }
                .nb-brand em {
                    font-style: italic;
                    color: #d97706;
                }

                /* ── Nav links ── */
                .nb-link {
                    position: relative;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--nb-link-color);
                    text-decoration: none;
                    padding-bottom: 3px;
                    transition: color 0.22s ease;
                    white-space: nowrap;
                }
                .nb-link::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 0;
                    height: 1.5px;
                    background: linear-gradient(90deg, #d97706, #fbbf24);
                    border-radius: 2px;
                    transition: width 0.30s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nb-link:hover { color: var(--nb-link-hover); }
                .nb-link:hover::after { width: 100%; }
                .nb-link:focus-visible { color: var(--nb-link-hover); }

                .nb-control-stack {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .dark .nb-control-stack {
                }

                .nb-action-stack {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* ── CTA button ── */
                .nb-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 11px 28px;
                    border-radius: 100px;
                    border: 1px solid rgba(255,255,255,0.38);
                    background: linear-gradient(135deg, #bd6a14 0%, #d48126 52%, #e9a74f 100%);
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.24s ease, box-shadow 0.24s ease;
                    box-shadow: 0 10px 24px rgba(196,117,29,0.35);
                    flex-shrink: 0;
                }
                .nb-cta::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(120deg, rgba(255,255,255,0.22) 0%, transparent 55%);
                    opacity: 0;
                    transition: opacity 0.22s;
                }
                .nb-cta:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(196,117,29,0.46); }
                .nb-cta:hover::before { opacity: 1; }
                .nb-cta:active { transform: translateY(0); box-shadow: 0 8px 20px rgba(196,117,29,0.32); }

                /* ── Ghost login button ── */
                .nb-login {
                    padding: 8px 18px;
                    border-radius: 100px;
                    border: 1px solid var(--nb-login-border);
                    color: var(--nb-login-color);
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.76rem;
                    font-weight: 600;
                    text-decoration: none;
                    white-space: nowrap;
                    transition: all 0.22s ease;
                }
                .nb-login:hover {
                    border-color: var(--nb-login-hover-border);
                    color: var(--nb-login-hover-color);
                    background: var(--nb-login-hover-bg);
                }

                /* ── Hamburger ── */
                .nb-ham {
                    background: var(--nb-ham-bg);
                    border: 1px solid var(--nb-ham-border);
                    color: var(--nb-ham-color);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 10px;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.22s ease;
                }
                .nb-ham[data-open="true"] {
                    background: var(--nb-ham-active-bg);
                    border-color: var(--nb-ham-active-border);
                    color: var(--nb-ham-active-color);
                }
                .nb-ham:hover {
                    background: var(--nb-ham-active-bg);
                    border-color: var(--nb-ham-active-border);
                    color: var(--nb-ham-active-color);
                }

                /* ── Mobile link rows ── */
                .nb-mlink {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    border-radius: 11px;
                    color: var(--nb-mlink-color);
                    text-decoration: none;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 500;
                    letter-spacing: 0.03em;
                    border: 1px solid transparent;
                    transition: all 0.20s ease;
                }
                .nb-mlink:hover {
                    background: var(--nb-mlink-hover-bg);
                    border-color: var(--nb-mlink-hover-border);
                    color: var(--nb-mlink-hover-color);
                }
                .nb-chevron { opacity: 0.25; transition: opacity 0.20s, color 0.20s; }
                .nb-mlink:hover .nb-chevron { opacity: 0.80; color: #d97706; }

                /* ── Drawer enter animation ── */
                @keyframes nb-slide-down {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .nb-drawer { animation: nb-slide-down 0.24s cubic-bezier(0.16,1,0.3,1) both; }

                /* ── Scrolled: amber shimmer at bottom edge ── */
                .nb-scrolled::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 38%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.50) 40%, rgba(251,191,36,0.50) 60%, transparent 100%);
                    pointer-events: none;
                }
            `}</style>

            <nav
                className={scrolled ? "nb-scrolled" : ""}
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                    transition: "transform 0.28s ease",
                }}
            >
                <div className="nb-shell">

                    {/* ── Brand ── */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
                        <Logo size="sm" />
                        <span className="nb-brand">
                            SalSee
                        </span>
                    </Link>

                    {/* ── Desktop nav links (centered) ── */}
                    <div
                        className="hidden lg:flex"
                        style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: "32px" }}
                    >
                        {NAV_LINKS.map((item) => (
                            <a key={item.label} href={item.href} className="nb-link">
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* ── Desktop right controls ── */}
                    <div
                        className="hidden lg:flex"
                        style={{ alignItems: "center", gap: "10px", flexShrink: 0 }}
                    >
                        <div className="nb-control-stack">
                            {mounted && <LanguageSwitcher variant="pill" />}
                            {mounted && <ThemeToggle />}
                        </div>

                        {!mounted ? (
                            <div style={{ width: "340px", height: "40px", borderRadius: "100px", background: "rgba(255,255,255,0.2)" }} />
                        ) : isAuthenticated ? (
                            <div className="nb-action-stack">
                                <Link href="/menu" className="nb-cta">
                                    <ShoppingBag size={13} /> {t("nav.orderNow")}
                                </Link>
                                <UserMenu />
                            </div>
                        ) : (
                            <div className="nb-action-stack">
                                <Link href="/login" className="nb-login">{t("nav.login")}</Link>
                                <Link href="/register" className="nb-cta">
                                    Create Account
                                </Link>
                                <Link href="/menu" className="nb-login">
                                    <ShoppingBag size={13} /> {t("nav.orderNow")}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav-drawer"
                        data-open={menuOpen ? "true" : "false"}
                        className="nb-ham flex lg:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* ── Mobile drawer ── */}
                {menuOpen && (
                    <div
                        id="mobile-nav-drawer"
                        className="nb-drawer lg:hidden"
                        style={{
                            width: "min(1200px, calc(100% - 24px))",
                            margin: "10px auto 0",
                            borderRadius: "22px",
                            background: "var(--nb-drawer-bg)",
                            backdropFilter: "blur(28px)",
                            borderTop: "1px solid var(--nb-drawer-border)",
                            boxShadow: "0 20px 42px rgba(0,0,0,0.18)",
                            padding: "12px 14px 18px",
                        }}
                    >
                        {/* Nav links */}
                        <div style={{ marginBottom: "10px" }}>
                            {NAV_LINKS.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="nb-mlink"
                                >
                                    {item.label}
                                    <ChevronRight size={14} className="nb-chevron" />
                                </a>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--nb-section-border)", paddingTop: "12px" }}>
                            {!mounted || !isAuthenticated ? (
                                <Link
                                    href="/register"
                                    className="nb-cta"
                                    style={{ borderRadius: "12px", padding: "13px 16px", fontSize: "0.875rem", justifyContent: "center" }}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Create Account
                                </Link>
                            ) : null}
                            <Link
                                href="/menu"
                                className={mounted && isAuthenticated ? "nb-cta" : "nb-login"}
                                style={{ borderRadius: "12px", padding: "13px 16px", fontSize: "0.875rem", justifyContent: "center" }}
                                onClick={() => setMenuOpen(false)}
                            >
                                <ShoppingBag size={15} /> {t("nav.orderNow")}
                            </Link>

                            {mounted && isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: "block",
                                        padding: "13px 16px",
                                        borderRadius: "12px",
                                        border: "1px solid var(--nb-login-border)",
                                        color: "var(--nb-login-color)",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        fontFamily: "'Outfit', sans-serif",
                                        textDecoration: "none",
                                        textAlign: "center",
                                        transition: "all 0.20s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--nb-login-hover-border)"; e.currentTarget.style.color = "var(--nb-login-hover-color)"; e.currentTarget.style.background = "var(--nb-login-hover-bg)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--nb-login-border)"; e.currentTarget.style.color = "var(--nb-login-color)"; e.currentTarget.style.background = "transparent"; }}
                                >
                                    {t("nav.login")}
                                </Link>
                            )}

                            <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {mounted && <LanguageSwitcher variant="menu" />}
                                {mounted && <ThemeToggle />}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
