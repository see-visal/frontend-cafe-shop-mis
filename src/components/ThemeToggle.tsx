"use client";

import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--g-surface-bg)" }} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : "rgba(180,140,80,0.24)"}`,
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.05))"
          : "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.62))",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.30s ease, border-color 0.30s ease, box-shadow 0.30s ease",
        boxShadow: isDark
          ? "0 8px 18px rgba(0,0,0,0.25)"
          : "0 8px 18px rgba(36,22,6,0.12)",
        flexShrink: 0,
        outline: "none",
        backdropFilter: "blur(14px)",
      }}
    >
      {isDark ? (
        <SunMedium size={17} style={{ color: "rgba(255,232,171,0.92)" }} />
      ) : (
        <MoonStar size={17} style={{ color: "rgba(120,90,180,0.92)" }} />
      )}
    </button>
  );
}
