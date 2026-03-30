"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import styles from "./Footer.module.css";

/**
 * Shared site Footer.
 * Used on any page that needs the bottom site footer.
 */
export function Footer() {
    const { t } = useI18n();
    const pathname = usePathname();
    const [currentYear, setCurrentYear] = useState<string>("");

    useEffect(() => {
        setCurrentYear(String(new Date().getFullYear()));
    }, []);

    // Keep hash links in-page on home, but route back to home from other pages.
    const sectionHref = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

    const footerLinks = [
        { label: t("footer.links.menu"), href: sectionHref("#menu") },
        { label: t("footer.links.about"), href: sectionHref("#our-story") },
        { label: t("footer.links.locations"), href: sectionHref("#locations") },
        { label: t("footer.links.careers"), href: "#" },
        { label: t("footer.links.orderNow"), href: "/menu" },
        { label: t("footer.links.contact"), href: "#" },
    ];

    const socialLinks = [
        { icon: Instagram, label: "Instagram", href: "#" },
        { icon: Twitter, label: "Twitter", href: "#" },
        { icon: Facebook, label: "Facebook", href: "#" },
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerAccent}>
                    <span className={styles.footerAccentDot} />
                    <p className={styles.footerAccentText}>SalSee Coffee</p>
                </div>

                <div className={styles.footerContent}>

                    {/* Brand */}
                    <div className={styles.brandSection}>
                        <div className={styles.brandHeader}>
                            <Logo size="sm" />
                            <span className={styles.brandTitle}>
                                SalSee
                            </span>
                        </div>
                        <p className={styles.brandTagline}>
                            {t("footer.tagline")}
                        </p>

                        <Link href="/menu" className={styles.orderNowButton}>
                            {t("footer.links.orderNow")}
                        </Link>

                        {/* Social icons */}
                        <div className={styles.socialContainer}>
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className={styles.socialIcon}
                                    aria-label={label}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links grid */}
                    <nav className={styles.linksGrid} aria-label="Footer links">
                        {footerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={styles.footerLink}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Bottom bar */}
                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © {currentYear} SalSee {t("footer.rights")}
                    </p>
                    <div className={styles.legalLinks}>
                        {[
                            { label: t("footer.privacy"), href: "#" },
                            { label: t("footer.terms"), href: "#" },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={styles.legalLink}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
