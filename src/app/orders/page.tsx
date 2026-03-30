"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useGetMyOrdersQuery, useCancelOrderMutation } from "@/store/api/ordersApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  ShoppingBag, Clock, RefreshCw, XCircle, Loader2,
  Eye, MapPin, Package, ArrowRight,
} from "lucide-react";
import type { OrderStatus } from "@/types";

function useTimeAgo() {
  const { t } = useI18n();
  return (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t("orders.justNow");
    if (m < 60) return t("orders.minsAgo", { m });
    const h = Math.floor(m / 60);
    if (h < 24) return t("orders.hrsAgo", { h });
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
  };
}

// Left bar color + glow per status
const STATUS_BAR: Record<string, string> = {
  SERVED: "bg-emerald-500",
  READY: "bg-teal-400",
  PREPARING: "bg-sky-500",
  CONFIRMED: "bg-primary text-primary-foreground shadow-sm",
  PENDING_PAYMENT: "bg-orange-400",
  CANCELLED: "bg-red-500",
};

const STATUS_GLOW: Record<string, string> = {
  SERVED: "hover:shadow-[0_12px_40px_rgba(16,185,129,.12)]",
  READY: "hover:shadow-[0_12px_40px_rgba(45,212,191,.12)]",
  PREPARING: "hover:shadow-[0_12px_40px_rgba(14,165,233,.12)]",
  CONFIRMED: "hover:shadow-[0_12px_40px_rgba(245,158,11,.12)]",
  PENDING_PAYMENT: "hover:shadow-[0_12px_40px_rgba(251,146,60,.12)]",
  CANCELLED: "hover:shadow-[0_12px_40px_rgba(239,68,68,.08)]",
};

// Statuses that need live polling
const ACTIVE_STATUSES = new Set(["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "READY"]);

export default function OrdersPage() {
  const isAuthenticated = useAuthGuard();
  const { t } = useI18n();
  const timeAgo = useTimeAgo();

  // Dynamic polling: 8 s while there are active orders, 0 (paused) once all done
  const [pollingInterval, setPollingInterval] = useState(8000);
  const { data: orders, isLoading, isFetching, refetch } = useGetMyOrdersQuery(undefined, {
    pollingInterval,
  });
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  // Adjust polling rate based on current order statuses
  useEffect(() => {
    if (!orders) return;
    const hasActive = orders.some((o) => ACTIVE_STATUSES.has(o.status));
    setPollingInterval(hasActive ? 8000 : 0);
  }, [orders]);

  const isLive = pollingInterval > 0;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen text-stone-900 font-sans" style={{ background: "var(--background)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Mono:wght@400&family=Outfit:wght@300;400;500;600&display=swap');
        .font-serif { font-family:'Cormorant Garamond',serif; }
        .font-mono2 { font-family:'DM Mono',monospace; }
        .font-body  { font-family:'Outfit',sans-serif; }

        @keyframes grain { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-4%,-8%)} 60%{transform:translate(8%,6%)} }
        .grain { position:fixed;inset:-200%;width:400%;height:400%;pointer-events:none;z-index:60;opacity:.018;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:grain 1s steps(1) infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }

        .order-card { transition:transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
        .order-card:hover { transform:translateY(-3px); border-color:rgba(0,0,0,.10) !important; box-shadow:0 8px 32px rgba(0,0,0,0.08); }

        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin .9s linear infinite; }
      `}</style>

      <div className="grain" />

      {/* Header — re-use AppHeader but pass dark-themed right slot */}
      <AppHeader
        backHref="/menu"
        backLabel={t("nav.menu")}
        title={t("auth.orders")}
        right={
          <div className="flex items-center gap-2">
            {/* Live indicator — shown when polling is active */}
            {isLive && (
              <span className="flex items-center gap-1.5 font-body text-[10px] text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-body text-[11px] font-semibold text-stone-500 transition hover:border-amber-300 hover:text-primary disabled:opacity-40"
            >
              <RefreshCw size={11} className={isFetching ? "animate-spin" : ""} /> {t("orders.refresh")}
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-36">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
              <Loader2 size={24} className="spin text-primary/70" />
            </div>
            <p className="font-body text-sm text-stone-400">{t("orders.loading")}</p>
          </div>

          /* ── Empty state ── */
        ) : !orders?.length ? (
          <div className="flex flex-col items-center gap-6 py-36 text-center fade-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-50 border border-stone-200">
              <ShoppingBag size={34} className="text-stone-300" />
            </div>
            <div>
              <p className="font-serif text-3xl italic text-stone-500">{t("orders.empty")}</p>
              <p className="mt-1.5 font-body text-sm text-stone-400">{t("orders.emptySubtext")}</p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-body text-sm font-semibold text-white uppercase tracking-[.2em] transition"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                backgroundSize: "200% 100%",
              }}
            >
              {t("hero.browseMenu")} <ArrowRight size={13} />
            </Link>
          </div>

          /* ── Order list ── */
        ) : (
          <div className="space-y-3 fade-up">
            {orders.map((order) => {
              const canCancel = order.status === "PENDING_PAYMENT" || order.status === "CONFIRMED";
              const bar = STATUS_BAR[order.status] ?? "bg-white/20";
              const glow = STATUS_GLOW[order.status] ?? "";
              const isActive = ACTIVE_STATUSES.has(order.status);

              return (
                <div
                  key={order.id}
                  className={`order-card ${glow} relative overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl`}
                  style={{ background: "var(--g-card-bg)", borderColor: "var(--g-card-border)" }}
                >
                  {/* Left status bar */}
                  <div className={`absolute inset-y-0 left-0 w-0.75 ${bar}`} />

                  {/* Live pulse dot — visible on active orders */}
                  {isActive && (
                    <span className="absolute top-3.5 right-3.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}

                  <div className="pl-5 pr-4 py-4 sm:py-5">

                    {/* Top row: ID + type + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono2 text-[10px] tracking-[.25em] text-stone-400 uppercase">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 border border-stone-200 px-2.5 py-0.5 font-body text-[11px] font-medium text-stone-500">
                            {order.orderType === "DINE_IN" ? (
                              <><MapPin size={10} className="text-primary/70" />{t("orders.dineIn")} · {t("orders.table")} {order.tableNumber}</>
                            ) : (
                              <><Package size={10} className="text-primary/70" />{t("orders.takeaway")}</>
                            )}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={order.status as OrderStatus} />
                    </div>

                    {/* Items */}
                    <div className="mt-4 space-y-2 border-t border-stone-200/60 pt-3.5">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-body text-[13px] text-stone-600">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-stone-100 border border-stone-200 font-mono2 text-[9px] text-stone-400">
                              {item.quantity}
                            </span>
                            {item.productName}
                          </span>
                          <span className="font-body text-[12.5px] font-semibold text-stone-400">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="font-body text-[11.5px] text-stone-400">
                          {order.items.length - 3 > 1 ? t("orders.moreItems", { count: order.items.length - 3 }) : t("orders.moreItem", { count: order.items.length - 3 })}
                        </p>
                      )}
                    </div>

                    {/* Footer: time + total + actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/60 pt-3.5">
                      <div className="flex items-center gap-1.5 font-mono2 text-[10px] text-stone-400">
                        <Clock size={10} />
                        {timeAgo(order.createdAt)}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Total */}
                        <span className="font-body text-base font-bold text-primary">
                          {formatCurrency(order.totalPrice)}
                        </span>

                        {/* Cancel */}
                        {canCancel && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-body text-[11px] font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-40"
                          >
                            <XCircle size={11} /> {t("common.cancel")}
                          </button>
                        )}

                        {/* Details */}
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-body text-[11px] font-semibold text-stone-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-primary"
                        >
                          <Eye size={11} /> {t("orders.details")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}