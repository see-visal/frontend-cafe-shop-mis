"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/api/authApi";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./login.module.css";
import {
  Eye,
  EyeOff,
  Loader2,
  Coffee,
  Clock3,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Coffee,
    title: "Roastery Menu",
    description: "Seasonal beans, signature recipes, and custom milk options.",
  },
  {
    icon: Clock3,
    title: "Fast Pickup",
    description: "Skip queues with real-time prep updates and pickup alerts.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Protected account, payment history, and loyalty points in one place.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({
        username: form.username.trim(),
        password: form.password,
      }).unwrap();
      router.push("/menu");
    } catch {
      // error state is managed by RTK Query's `error` return — no re-throw needed
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ||
    "Incorrect username or password. Please try again.";

  return (
    <div className={styles.page}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.orbThree} />

      {/* Floating coffee beans */}
      {mounted && (
        <div className={styles.beans} aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`${styles.bean} ${styles[`bean${i + 1}` as keyof typeof styles]}`}>☕</div>
          ))}
        </div>
      )}

      <main className={styles.shell}>
        <aside className={`${styles.showcase} ${styles.reveal} ${styles.delayOne}`}>
          <Link href="/" className={styles.brand}>
            <Logo size="sm" />
            <span className={styles.brandName}>SalSee</span>
          </Link>

          <div className={styles.copyBlock}>
            <p className={styles.kicker}>
              <Sparkles size={12} />
              Members Lounge
            </p>
            <h1 className={styles.title}>Better Mornings with SalSee</h1>
            <p className={styles.subtitle}>
              Login to track orders, collect loyalty points, and jump back into your
              personalized coffee ritual.
            </p>
          </div>

          <div className={styles.metricsRow}>
            <div className={styles.metricBox}>
              <span className={styles.metricValue}>4.9</span>
              <span className={styles.metricLabel}>Average rating</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricValue}>12m</span>
              <span className={styles.metricLabel}>Fast pickup</span>
            </div>
          </div>

          <div className={styles.highlightList}>
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className={styles.highlightItem}>
                <div className={styles.iconBadge}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className={styles.highlightTitle}>{title}</h3>
                  <p className={styles.highlightDescription}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className={`${styles.formSection} ${styles.reveal} ${styles.delayTwo}`}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            Back home
          </Link>

          <div className={styles.card}>
            <header className={styles.cardHeader}>
              <p className={styles.cardEyebrow}>Secure account access</p>
              <h2 className={styles.cardTitle}>Welcome back</h2>
              <p className={styles.cardSubtitle}>Sign in and continue your order.</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>
                  Username
                </label>
                <div className={styles.inputShell}>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="your_username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.passwordTopRow}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <Link href="/forgot-password" className={styles.inlineAction}>
                    Forgot?
                  </Link>
                </div>

                <div className={styles.inputShell}>
                  <Input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={styles.inputField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className={styles.eyeButton}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <span className={styles.buttonContent}>
                    Continue
                    <ChevronRight size={15} />
                  </span>
                )}
              </Button>
            </form>

            <p className={styles.registerLine}>
              New to SalSee?{" "}
              <Link href="/register" className={styles.registerLink}>
                Create account
              </Link>
            </p>
          </div>
        
        </section>
      </main>
    </div>
  );
}
