import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[.75rem]",
    "font-sans text-sm font-semibold tracking-[.12em] uppercase",
    "transition-all duration-250 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40 select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — amber gradient (matches login/register CTA)
        default: [
          "text-white",
          "bg-primary",
          "[background-size:200%_100%] [background-position:0%_0%]",
          "shadow-[0_4px_20px_rgba(200,118,42,.20)]",
          "hover:[background-position:100%_0%] hover:-translate-y-[1px] hover:shadow-[0_10px_28px_rgba(200,118,42,.28)]",
          "active:translate-y-0",
        ].join(" "),

        // Secondary — subtle dark surface
        secondary: [
          "bg-white/[.06] border border-white/[.10] text-white/70",
          "hover:bg-white/[.10] hover:text-white/90",
        ].join(" "),

        // Outline — thin border only
        outline: [
          "border border-white/[.12] bg-transparent text-white/60",
          "hover:border-amber-700/50 hover:text-white/85 hover:bg-white/[.04]",
        ].join(" "),

        // Ghost — no border
        ghost: [
          "bg-transparent text-white/50",
          "hover:bg-white/[.05] hover:text-white/80",
        ].join(" "),

        // Danger
        danger: [
          "bg-red-900/40 border border-red-700/40 text-red-400",
          "hover:bg-red-900/60 hover:text-red-300",
        ].join(" "),

        // Link style
        link: "text-primary underline-offset-4 hover:underline hover:text-primary p-0 h-auto normal-case tracking-normal",
      },

      size: {
        sm:   "h-8 px-3 text-[10px] rounded-lg",
        md:   "h-10 px-4 text-[11px]",
        lg:   "h-12 px-6 text-[12px] rounded-[.875rem]",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };