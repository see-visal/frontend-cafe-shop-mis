"use client";

import { updateQuantity as updateQty } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Plus, Minus, ShoppingCart, Star, Eye, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import { getCategoryStyle } from "./categoryStyle";
import { useI18n } from "@/lib/i18n";
import { Price } from "@/components/ui/Price";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
  onSelect: () => void;
  onViewCart: () => void;
}

export function ProductCard({ product, onAdd, onSelect, onViewCart }: ProductCardProps) {
  const cartItems = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const inCart = cartItems.find((i) => i.productId === product.id);
  const { gradient, emoji } = getCategoryStyle(product.category, product.id);
  const { t, tDynamic } = useI18n();
  const imageSrc = resolveStorageUrl(product.imageUrl) || "";

  return (
    <div
      className="group gm-panel gm-layered flex flex-col rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_52px_rgba(0,0,0,0.16)] cursor-pointer"
      onClick={onSelect}
      role="button"
      aria-label={`View details for ${product.name}`}
    >
      <div
        className={`relative flex h-48 items-center justify-center bg-linear-to-br ${gradient} overflow-hidden`}
      >
        {/* Real image loaded from public file */}
        {product.imageUrl && (
          <div 
            className="relative w-36 h-36 rounded-full p-1.5 transition-transform duration-700 group-hover:scale-110 z-10 animate-fade-in"
            style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(14px)", boxShadow: "0 14px 40px rgba(0,0,0,0.18), inset 0 2px 10px rgba(255,255,255,0.4)" }}
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              unoptimized={isRemoteStorageUrl(imageSrc)}
              className="object-cover rounded-full"
              sizes="144px"
            />
          </div>
        )}

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Emoji fallback */}
        {!product.imageUrl && (
          <span
            className="text-7xl select-none transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative z-10"
            role="img"
            aria-hidden="true"
          >
            {emoji}
          </span>
        )}

        {/* Category chip */}
        {product.category && (
          <span className="absolute left-3 top-3 g-surface flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide text-foreground shadow-sm">
            {emoji}&nbsp;{tDynamic(product.category)}
          </span>
        )}

        {/* Sold-out overlay */}
        {!product.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-md">
            <span className="rounded-full border border-white/30 bg-white/70 dark:bg-black/70 px-5 py-2 text-xs font-black tracking-widest text-foreground uppercase shadow-lg backdrop-blur-xl">
              {t("product.soldOut")}
            </span>
          </div>
        )}

        {/* Popular badge — appears on hover */}
        {product.active && (
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 px-3 py-1.5 text-[10px] font-bold text-primary">
              <Star size={10} fill="currentColor" />
              {t("product.popular")}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="gm-layer flex flex-1 flex-col gap-3 bg-white/92 px-5 pt-4 pb-5 dark:bg-[rgba(17,12,8,0.82)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold leading-snug tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {tDynamic(product.name)}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-foreground/68 dark:text-muted-foreground">
              {tDynamic(product.description)}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-foreground/5 my-1" />

        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          <Price amount={product.price} size="md" />
          {inCart && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              <CheckCircle2 size={12} />
              {inCart.quantity} {t("product.inBag")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-(--g-card-border) bg-(--g-surface-bg) px-4 py-2.5 text-xs font-extrabold text-foreground transition-all duration-300 hover:bg-(--g-surface-hover)"
          >
            <Eye size={14} />
            {t("product.viewDetails")}
          </button>

          {inCart ? (
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 p-1 backdrop-blur-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(updateQty({ productId: product.id, quantity: inCart.quantity - 1 }));
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/20 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-6 text-center text-sm font-black text-primary">
                {inCart.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.active) onAdd();
              }}
              disabled={!product.active}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-300 active:scale-95 ${product.active
                  ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                }`}
              aria-label="Add to cart"
            >
              <ShoppingCart size={14} />
              {t("product.add")}
            </button>
          )}
        </div>

        {inCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewCart();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-xs font-extrabold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart size={14} />
            {t("product.viewBag")}
          </button>
        )}
        {!product.active && (
          <p className="text-[11px] font-medium text-foreground/62 dark:text-muted-foreground">
            {t("product.soldOut")}
          </p>
        )}
      </div>
    </div>
  );
}
