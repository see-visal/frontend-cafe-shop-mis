"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const [mounted, setMounted] = useState(false);
  const { theme = "dark" } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--g-panel-bg)",
          "--normal-border": "var(--g-card-border)",
          "--normal-text": "var(--foreground)",
          "--normal-description": "var(--foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl group-[.toaster]:shadow-[var(--g-card-shadow)]",
          description: "group-[.toast]:text-foreground/60",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-(--g-surface-bg) group-[.toast]:text-foreground/70",
        },
      }}
      {...props}
    />
  );
}
