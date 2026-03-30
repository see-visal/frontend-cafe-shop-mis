import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            ref={ref}
            className={cn(
                "flex h-12 w-full rounded-2xl border transition-all duration-300 shadow-sm",
                "bg-stone-50/80 backdrop-blur-sm border-stone-200 px-4 py-3 text-sm",
                "text-stone-900 placeholder:text-stone-400",
                "focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:bg-white",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        />
    ),
);
Input.displayName = "Input";
