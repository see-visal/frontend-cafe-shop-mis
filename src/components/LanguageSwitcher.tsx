"use client";

import Image from "next/image";
import { useI18n, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  /** Visual variant — "pill" for header, "menu" for dropdown rows */
  variant?: "pill" | "menu";
  className?: string;
}

const LANGS: { code: Locale; label: string; flagImg: string; native: string }[] = [
  { code: "en", label: "English", flagImg: "/english.svg", native: "EN" },
  { code: "km", label: "ខ្មែរ", flagImg: "/cambodia.svg", native: "ខ្មែរ" },
];

export function LanguageSwitcher({ variant = "pill", className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const currentLang = LANGS.find((lang) => lang.code === locale) ?? LANGS[0];
  const targetLang = LANGS.find((lang) => lang.code !== locale) ?? LANGS[0];
  const switchToAriaLabel = `Current language ${currentLang.label}. Switch to ${targetLang.label}`;
  const currentShortLabel = currentLang.code === "km" ? "KH" : "UK";

  if (variant === "pill") {
    return (
      <div className={className} aria-label="Language switcher">
        <button
          id="lang-toggle-btn"
          onClick={() => setLocale(targetLang.code)}
          aria-label={switchToAriaLabel}
          title={switchToAriaLabel}
          className="group flex items-center gap-2 rounded-full border border-white/35 bg-[linear-gradient(135deg,#c0721e_0%,#d4872d_55%,#e49c43_100%)] px-3 py-1.5 text-white shadow-[0_8px_22px_rgba(196,117,29,0.36)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(196,117,29,0.45)]"
        >
          <div className="overflow-hidden rounded-full border border-white/55 w-4 h-4 flex items-center justify-center shrink-0 ring-1 ring-white/25">
            <Image src={currentLang.flagImg} alt={currentLang.label} width={16} height={16} className="object-cover w-full h-full" />
          </div>
          <span aria-hidden="true" className="text-[11px] font-extrabold tracking-[0.12em] text-white/95">{currentShortLabel}</span>
        </button>
      </div>
    );
  }

  // "menu" variant — stacked rows for mobile drawer
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-label="Language switcher">
      <button
        id="lang-menu-toggle-btn"
        onClick={() => setLocale(targetLang.code)}
        aria-label={switchToAriaLabel}
        title={switchToAriaLabel}
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all duration-200 border border-amber-600/25 bg-amber-500/12 text-amber-700 hover:bg-amber-500/18 dark:border-amber-400/20 dark:bg-amber-400/12 dark:text-amber-200"
      >
        <div className="overflow-hidden rounded-full border border-stone-200/70 w-6 h-6 flex items-center justify-center shrink-0 shadow-sm">
          <Image src={currentLang.flagImg} alt={currentLang.label} width={24} height={24} className="object-cover w-full h-full" />
        </div>
        <span aria-hidden="true" className="text-sm font-extrabold tracking-wider">{currentShortLabel}</span>
      </button>
    </div>
  );
}
