import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[80px] w-full rounded-xl border border-white/[0.12] bg-white/[0.07] px-3.5 py-2 text-sm text-foreground placeholder:text-white/35 transition-colors resize-none",
                "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        />
    ),
);
Textarea.displayName = "Textarea";
