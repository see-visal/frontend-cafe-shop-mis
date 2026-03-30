import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/40 dark:text-amber-300",
        success: "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/40 dark:text-emerald-300",
        info:    "bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-900/30 dark:border-sky-700/40 dark:text-sky-300",
        warning: "bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700/40 dark:text-orange-300",
        danger:  "bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-700/40 dark:text-red-300",
        outline: "border border-stone-200 bg-transparent text-stone-500 dark:border-stone-700 dark:text-stone-400",
        muted:   "bg-stone-50 border border-stone-200 text-stone-400 dark:bg-stone-800/50 dark:border-stone-700/40 dark:text-stone-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };