"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateQuantity as updateQty } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, Minus, X, ShoppingBag, Leaf, Thermometer,
  ArrowRight, CheckCircle,
} from "lucide-react";
import type { Product } from "@/types";
import { getCategoryStyle } from "./categoryStyle";
import { useI18n } from "@/lib/i18n";
import { Price } from "@/components/ui/Price";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAdd: () => void;
}

export function ProductDetailModal({ product, onClose, onAdd }: ProductDetailModalProps) {
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const inCart = cartItems.find((i) => i.productId === product.id);
  const { gradient, emoji } = getCategoryStyle(product.category, product.id);
  const { t, tDynamic } = useI18n();
  const imageSrc = resolveStorageUrl(product.imageUrl) || "";

  // Track if we just added (for the "pop" animation on the counter)
  const [addedPop, setAddedPop] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAddedPop(true);
    setTimeout(() => setAddedPop(false), 350);
  };

  const handleIncrement = () => {
    if (inCart) {
      dispatch(updateQty({ productId: product.id, quantity: inCart.quantity + 1 }));
      setAddedPop(true);
      setTimeout(() => setAddedPop(false), 350);
    }
  };

  const handleDecrement = () => {
    if (inCart) {
      dispatch(updateQty({ productId: product.id, quantity: inCart.quantity - 1 }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/75 backdrop-blur-sm animate-fade-in-fast"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centered card on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center animate-slide-up md:inset-0 md:items-center md:p-6">
        <div
          className="w-full max-h-[92vh] flex flex-col rounded-t-[2.5rem] bg-white/60 dark:bg-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.15)] ring-1 ring-white/40 dark:ring-white/10 backdrop-blur-3xl md:max-w-md md:rounded-[2.5rem] overflow-hidden backdrop-saturate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-0.5 md:hidden">
            <div className="h-1 w-10 rounded-full bg-muted/80" />
          </div>

          {/* ── Hero image ── */}
          <div
            className={`relative shrink-0 flex h-56 items-center justify-center bg-linear-to-br ${gradient} overflow-hidden`}
          >
            {/* Real image loaded from public file */}
            {product.imageUrl && (
              <div 
                className="relative w-40 h-40 rounded-full p-2 z-10 animate-fade-in"
                style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.22), inset 0 2px 12px rgba(255,255,255,0.4)" }}
              >
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                      unoptimized={isRemoteStorageUrl(imageSrc)}
                  className="object-cover rounded-full"
                  sizes="160px"
                />
              </div>
            )}

            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none z-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Bottom gradient scrim */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />

            {!product.imageUrl && (
              <span
                className="text-[5.5rem] select-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)] relative z-10"
                role="img"
                aria-hidden="true"
              >
                {emoji}
              </span>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-xl text-foreground hover:bg-white/40 hover:scale-105 transition-all outline-none border border-white/40 shadow-sm"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Sold-out overlay */}
            {!product.active && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md">
                <span className="rounded-full border border-white/30 bg-white/80 dark:bg-black/80 shadow-xl backdrop-blur-3xl px-6 py-2.5 text-sm font-black tracking-widest text-foreground uppercase">
                  {t("product.soldOut")}
                </span>
              </div>
            )}

            {/* In-cart badge on the hero */}
            {inCart && (
              <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-foreground/90 backdrop-blur-xl px-4 py-2 text-xs font-black text-background shadow-lg border border-background/20 animate-fade-in-fast hover:scale-105 transition-transform">
                <CheckCircle size={14} />
                {inCart.quantity} {t("product.inBag")}
              </div>
            )}
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
            {/* Category chip */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 border border-foreground/10 px-3 py-1.5 text-xs font-bold tracking-wide text-foreground shadow-sm">
                {emoji}&nbsp;{tDynamic(product.category)}
              </span>
            )}

            {/* Name + description */}
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground leading-tight">
              {tDynamic(product.name)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.description ? tDynamic(product.description) : t("product.defaultDescription")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                <Thermometer size={10} /> {t("product.madeToOrder")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                <Leaf size={10} /> {t("product.freshlyPrepared")}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-foreground/5" />

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-4">
              <div>
              <Price amount={product.price} size="xl" />
              </div>

              {/* ── Morphing CTA (pichpisey.shop style) ── */}
              {inCart ? (
                /* Quantity selector that morphs from the Add button */
                <div
                  className={`flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 p-1.5 transition-all duration-300 shadow-inner ${addedPop ? "scale-105 ring-4 ring-primary/10" : "scale-100"}`}
                >
                  <button
                    onClick={handleDecrement}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-black/50 text-primary hover:bg-white/80 active:scale-95 transition-all shadow-sm border border-black/5 dark:border-white/5"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    className={`min-w-8 text-center text-xl font-black text-primary transition-transform duration-200 ${addedPop ? "scale-125" : "scale-100"}`}
                  >
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={!product.active}
                  className="flex items-center justify-center gap-3 px-8 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed font-black text-[15px] transition-all duration-300 active:scale-95"
                  style={{ height: "56px" }}
                >
                  <ShoppingBag size={18} />
                  {t("product.addToBag")}
                </button>
              )}
            </div>

            {/* ── View Bag shortcut (shows after adding, pichpisey.shop pattern) ── */}
            {inCart && (
              <Link
                href="/checkout"
                onClick={onClose}
                className="mt-6 flex w-full items-center justify-between rounded-3xl border border-foreground/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl px-6 py-4 text-sm font-bold text-foreground shadow-lg hover:shadow-xl hover:bg-white/90 dark:hover:bg-black/60 hover:-translate-y-1 transition-all duration-300 group animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ShoppingBag size={16} />
                  </div>
                  <span className="font-bold text-base tracking-tight">{t("product.viewBag")}</span>
                  <span className="rounded-full bg-foreground text-background px-2.5 py-0.5 text-[11px] font-black">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground group-hover:gap-2.5 transition-all">
                  <span className="font-black text-lg">{formatCurrency(cartItems.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                  <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
