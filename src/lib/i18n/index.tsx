"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import en from "../../../messages/en.json";
import km from "../../../messages/km.json";

export type Locale = "en" | "km";

type Dict = Record<string, unknown>;

type I18nContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
    tDynamic: (value: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_STORAGE_KEY = "locale";

const messages: Record<Locale, Dict> = {
    en: en as Dict,
    km: km as Dict,
};

function getByPath(source: Dict, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, part) => {
        if (!acc || typeof acc !== "object") return undefined;
        return (acc as Dict)[part];
    }, source);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

function toDynamicKey(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/^\s+|\s+$/g, "");
}

interface I18nProviderProps {
    children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        const stored = typeof window !== "undefined"
            ? localStorage.getItem(LOCALE_STORAGE_KEY)
            : null;

        if (stored === "en" || stored === "km") {
            setLocaleState(stored);
        }
    }, []);

    const setLocale = useCallback((nextLocale: Locale) => {
        setLocaleState(nextLocale);
        if (typeof window !== "undefined") {
            localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        }
    }, []);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const t = useCallback((key: string, vars?: Record<string, string | number>) => {
        const value = getByPath(messages[locale], key);
        if (typeof value === "string") return interpolate(value, vars);

        const fallback = getByPath(messages.en, key);
        if (typeof fallback === "string") return interpolate(fallback, vars);

        return key;
    }, [locale]);

    const tDynamic = useCallback((value: string) => {
        if (!value) return value;

        const dynamicKey = toDynamicKey(value);
        const dynamicTable = getByPath(messages[locale], "dynamic");
        if (dynamicTable && typeof dynamicTable === "object") {
            const translated = (dynamicTable as Dict)[dynamicKey];
            if (typeof translated === "string") return translated;
        }

        const fallbackTable = getByPath(messages.en, "dynamic");
        if (fallbackTable && typeof fallbackTable === "object") {
            const translated = (fallbackTable as Dict)[dynamicKey];
            if (typeof translated === "string") return translated;
        }

        return value;
    }, [locale]);

    const contextValue = useMemo<I18nContextValue>(() => ({
        locale,
        setLocale,
        t,
        tDynamic,
    }), [locale, setLocale, t, tDynamic]);

    return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return context;
}
