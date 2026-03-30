"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useGetMenuQuery, useGetCategoriesQuery } from "@/store/api/productsApi";
import { addItem, selectCartCount, selectCartTotal } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Price } from "@/components/ui/Price";
import { AuthNav } from "@/components/UserMenu";
import { Logo } from "@/components/Logo";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/menu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import {
  Coffee,
  ShoppingBag,
  PackageCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  X,
} from "lucide-react";
import type { Product } from "@/types";

// Code-split heavy modal — excluded from initial JS bundle
const ProductDetailModal = dynamic(
  () => import("@/components/menu/ProductDetailModal").then((m) => m.ProductDetailModal),
  { ssr: false },
);

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, tDynamic } = useI18n();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Reset to page 0 whenever a filter changes
  useEffect(() => { setPage(0); }, [search, selectedCategory]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProduct]);

  const { data: products, isLoading } = useGetMenuQuery(
    {
      page,
      size: 12,
      categoryId: selectedCategory,
      search: search.trim() || undefined,
    },
    {
      // Keep menu aligned with admin-side product changes.
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 30000,
    },
  );
  const { data: categories } = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // If admin removes products while user is on a later page, move to the last valid page.
  useEffect(() => {
    if (!products) return;
    const maxPage = Math.max(0, products.totalPages - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [products, page]);

  const filtered = products?.content;

  function handleAdd(product: Product) {
    dispatch(addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl ?? undefined,
      category: product.category ?? undefined,
    }));
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory(undefined);
    setPage(0);
  }

  const hasFilters = !!search || selectedCategory !== undefined;
  const safeCartCount = mounted ? cartCount : 0;
  const safeCartTotal = mounted ? cartTotal : 0;

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-300">

      {/* ── Sticky Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 gm-panel border-b border-(--g-card-border) transition-colors duration-300">

        {/* Row 1: Brand / Search / User / Cart */}
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">

          <Link href="/" className="flex shrink-0 items-center gap-2 group">
            <Logo size="sm" />
            <span className="text-sm font-black tracking-widest text-foreground uppercase hidden sm:block group-hover:text-primary transition-colors">
              SalSee
            </span>
          </Link>

          {/* Search bar — desktop */}
          <div className="relative hidden sm:block flex-1 max-w-sm">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("menu.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="g-input-field h-10 w-full rounded-full pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-amber-900/40 transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("menu.clearSearch")}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Language switcher */}
            {mounted && <LanguageSwitcher variant="pill" />}

            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="g-surface flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                aria-label={t("menu.toggleDark")}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {mounted ? (!isAuthenticated ? <AuthNav /> : null) : (
              <div className="h-8 w-24 rounded-full bg-muted dark:bg-card animate-pulse" />
            )}

            <Link
              href="/orders"
              aria-label="Track Orders"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-(--g-card-border) bg-(--g-surface-bg) text-foreground transition-all duration-200 hover:bg-(--g-surface-hover) hover:border-primary/35 md:hidden"
            >
              <PackageCheck size={16} className="text-primary" />
            </Link>

            <Link
              href="/orders"
              className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full border border-(--g-card-border) bg-(--g-surface-bg) text-xs font-bold text-foreground hover:bg-(--g-surface-hover) hover:border-primary/35 transition-all duration-200"
            >
              <PackageCheck size={14} className="text-primary" />
              Track Orders
            </Link>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`${t("menu.openCart")}, ${safeCartCount} items`}
              className="relative flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all duration-200 shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] active:scale-95"
            >
              <ShoppingBag size={14} />
              {safeCartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-black">
                  {safeCartCount}
                </span>
              )}
              {safeCartTotal > 0 && (
                <Price amount={safeCartTotal} size="sm" className="hidden md:inline-flex text-white [&>span]:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Mobile search */}
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("menu.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="g-input-field h-10 w-full rounded-full pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-amber-900/40 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Category pills */}
        <div className="border-t border-border/80 dark:border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={clearFilters}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${selectedCategory === undefined && !search
                    ? "bg-primary text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                    : "bg-(--g-surface-bg) text-foreground/78 hover:bg-(--g-surface-hover) hover:text-foreground"
                  }`}
              >
                {t("menu.allCategory")}
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${selectedCategory === cat.id
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                      : "bg-(--g-surface-bg) text-foreground/78 hover:bg-(--g-surface-hover) hover:text-foreground"
                    }`}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {tDynamic(cat.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner (only on fresh load) ────────────────────── */}
      {!hasFilters && page === 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
          <div
            className="gm-panel relative overflow-hidden rounded-3xl flex items-center px-8 py-10"
            style={{ minHeight: "160px", background: "linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 55%, var(--aurora-3) 100%)" }}
          >
            {/* Noise */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute right-0 top-0 h-64 w-64 opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", transform: "translate(20%, -30%)" }}
            />
            <div className="absolute bottom-0 left-1/4 h-32 w-64 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)", transform: "translateY(30%)" }}
            />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{t("menu.craftedWithPassion")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight tracking-tight">{t("menu.heroHeading")}</h1>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-foreground/70 dark:text-foreground/72">
                {t("menu.heroSubtext")}
              </p>
              {products && !isLoading && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs font-bold text-amber-700 shadow-sm dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                  <Coffee size={12} />
                  {products.totalElements} {t("menu.itemsAvailable")}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-(--g-card-border) bg-white/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm transition-all duration-200 hover:border-primary/35 hover:bg-white dark:bg-white/10 dark:hover:bg-white/14"
                >
                  <PackageCheck size={14} className="text-primary" />
                  Track Orders
                </Link>
                {safeCartCount > 0 && (
                  <button
                    onClick={() => setCartOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(245,158,11,0.28)] transition-all duration-200 hover:bg-primary/90"
                  >
                    <ShoppingBag size={14} />
                    {t("menu.viewBag")}
                  </button>
                )}
              </div>
            </div>
            <div className="relative z-10 hidden sm:flex text-7xl opacity-80 select-none">
              <span style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}>☕</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Product Grid ────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">

        {/* Filter header */}
        {hasFilters && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">
                {search
                  ? `${t("menu.resultsFor")} "${search}"`
                  : (() => {
                      const categoryName = categories?.find((c) => c.id === selectedCategory)?.name;
                      return categoryName ? tDynamic(categoryName) : t("menu.category");
                    })()}
              </h2>
              {products && !isLoading && (
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                  {products.totalElements} {products.totalElements !== 1 ? t("menu.itemsFound") : t("menu.itemFound")}
                </p>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-primary hover:text-primary dark:hover:text-amber-300 transition-colors"
            >
              {t("menu.clear")} <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Skeleton loaders */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-(--g-card-border) bg-(--g-card-bg) shadow-[0_2px_16px_rgba(0,0,0,0.20)]">
                <div className="h-48 animate-pulse bg-linear-to-br from-white/6 to-white/3" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-muted dark:bg-card" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted dark:bg-card" />
                  <div className="h-px w-full bg-background dark:bg-card/50 my-1" />
                  <div className="flex justify-between items-center pt-0.5">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted dark:bg-card" />
                    <div className="h-8 w-16 animate-pulse rounded-full bg-primary/10 dark:bg-amber-900/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : !filtered?.length ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-5 py-32 text-muted-foreground">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-muted dark:bg-card">
              <Coffee size={40} className="text-muted-foreground dark:text-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-foreground dark:text-muted-foreground">{t("menu.noItemsFound")}</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
                {search ? `${t("menu.noResultsFor")} "${search}"` : t("menu.nothingInCategory")}
              </p>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-1 rounded-full bg-primary text-white hover:bg-primary/90 px-6 py-2.5 text-sm font-bold transition-all shadow-[0_4px_16px_rgba(245,158,11,0.4)] active:scale-95"
              >
                {t("menu.clearFilters")}
              </button>
            )}
          </div>

        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAdd(product)}
                  onSelect={() => setSelectedProduct(product)}
                  onViewCart={() => setCartOpen(true)}
                />
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground dark:text-muted-foreground font-medium">
              {t("menu.showing")} {filtered.length} {t("menu.of")} {products?.totalElements ?? filtered.length} {(products?.totalElements ?? filtered.length) !== 1 ? t("menu.items") : t("menu.item")}
            </p>
          </>
        )}

        {/* ── Pagination ── */}
        {products && products.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-(--g-card-border) bg-(--g-surface-bg) text-xs font-bold text-foreground/70 hover:bg-(--g-surface-hover) hover:border-white/18 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={13} /> {t("menu.prev")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(products.totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${page === i
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                      : "bg-(--g-surface-bg) border border-(--g-card-border) text-foreground/55 hover:bg-(--g-surface-hover)"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              {products.totalPages > 5 && <span className="px-1 text-muted-foreground text-xs">…</span>}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= products.totalPages - 1}
              className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-(--g-card-border) bg-(--g-surface-bg) text-xs font-bold text-foreground/70 hover:bg-(--g-surface-hover) hover:border-white/18 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {t("menu.next")} <ChevronRight size={13} />
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* ── Sticky Cart FAB (mobile) ─────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 inset-x-4 z-30 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center justify-between w-full rounded-2xl px-5 py-4 text-white font-bold shadow-[0_8px_32px_rgba(0,0,0,0.25)] active:scale-[0.98] transition-transform bg-primary bg-opacity-100"
          >
            <span className="flex items-center gap-2.5 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-black">
                {cartCount}
              </span>
              {t("menu.viewBag")}
            </span>
            <Price amount={cartTotal} size="md" className="text-white [&>span]:text-white" />
          </button>
        </div>
      )}

      {/* ── Cart Drawer ─────────────────────────────────────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Product Detail Modal ─────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => handleAdd(selectedProduct)}
        />
      )}
    </div>
  );
}
