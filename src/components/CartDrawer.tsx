"use client";

import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectCartItems, selectCartTotal, selectCartCount,
    removeItem, updateQuantity, updateInstructions,
} from "@/store/slices/cartSlice";
import { useI18n } from "@/lib/i18n";
import { X, ShoppingBag, Minus, Plus, Trash2, MessageSquare, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/ui/Price";
import { isRemoteStorageUrl, resolveStorageUrl } from "@/lib/storage";

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const count = useAppSelector(selectCartCount);
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const { t } = useI18n();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-(--g-panel-bg) backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out border-l ${open ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{ borderColor: "var(--g-card-border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border dark:border-border/80 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" />
                        <h2 className="text-base font-black text-foreground dark:text-stone-100">{t("cart.title")}</h2>
                        {count > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm text-[10px] font-black">
                                {count}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted dark:bg-card text-muted-foreground dark:text-muted-foreground hover:bg-muted/80 dark:hover:bg-stone-700 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-background dark:bg-card border border-border dark:border-border/60">
                                <ShoppingBag size={32} className="text-muted-foreground dark:text-foreground" />
                            </div>
                            <div>
                                <p className="font-black text-foreground dark:text-muted-foreground text-lg">{t("cart.empty")}</p>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{t("cart.emptySubtext")}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 text-sm font-bold px-6 py-2.5 transition-all"
                            >
                                {t("cart.browsMenu")}
                            </button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const imageSrc = resolveStorageUrl(item.imageUrl);
                            const showImage = imageSrc && !imageErrors[item.productId];

                            return (
                            <div key={item.productId} className="rounded-2xl border border-border dark:border-border/80 bg-white dark:bg-card/60 p-4 shadow-sm dark:shadow-none">
                                {/* Item row */}
                                <div className="flex gap-3">
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-amber-900/30 overflow-hidden border border-amber-100/50 dark:border-amber-800/30">
                                        {showImage ? (
                                            <Image
                                                src={imageSrc}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                                unoptimized={isRemoteStorageUrl(imageSrc)}
                                                onError={() => setImageErrors((current) => ({ ...current, [item.productId]: true }))}
                                            />
                                        ) : (
                                            <span className="text-2xl">☕</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-bold text-foreground dark:text-stone-100 truncate">{item.name}</p>
                                        <Price amount={item.price} size="sm" muted className="opacity-70" />
                                    </div>

                                    <button
                                        onClick={() => dispatch(removeItem(item.productId))}
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground dark:text-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {/* Qty + price row */}
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border dark:border-border/60 bg-white dark:bg-card text-foreground dark:text-muted-foreground hover:border-primary/50 hover:text-primary dark:hover:text-primary transition-colors"
                                        >
                                            <Minus size={11} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-black text-foreground dark:text-stone-100">{item.quantity}</span>
                                        <button
                                            onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border dark:border-border/60 bg-white dark:bg-card text-foreground dark:text-muted-foreground hover:border-primary/50 hover:text-primary dark:hover:text-primary transition-colors"
                                        >
                                            <Plus size={11} />
                                        </button>
                                    </div>
                                    <Price amount={item.price * item.quantity} size="md" />
                                </div>

                                {/* Special instructions */}
                                <div className="mt-2">
                                    {editingId === item.productId ? (
                                        <div className="mt-2">
                                            <textarea
                                                placeholder="e.g. no sugar, extra shot, oat milk…"
                                                defaultValue={item.specialInstructions ?? ""}
                                                onBlur={(e) => {
                                                    dispatch(updateInstructions({ productId: item.productId, instructions: e.target.value }));
                                                    setEditingId(null);
                                                }}
                                                autoFocus
                                                rows={2}
                                                className="w-full resize-none rounded-xl border border-border dark:border-border/60 bg-background dark:bg-card px-3 py-2 text-xs text-foreground dark:text-stone-200 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-amber-100 dark:focus:ring-amber-900/40 outline-none transition"
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingId(item.productId)}
                                            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors mt-1"
                                        >
                                            <MessageSquare size={11} />
                                            {item.specialInstructions ? `"${item.specialInstructions}"` : "Add note"}
                                        </button>
                                    )}
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-(--g-card-border) px-5 py-5 space-y-3 bg-(--g-panel-bg)">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">{t("cart.subtotal")}</span>
                            <Price amount={total} size="lg" muted />
                        </div>
                        <Link
                            href={isAuthenticated ? "/checkout" : "/login"}
                            onClick={onClose}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white uppercase tracking-widest transition-all active:scale-[0.98]"
                            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                        >
                            {t("cart.checkout")}
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
