import { cn, formatCurrency } from "@/lib/utils";

interface PriceProps {
    amount: number;
    size?: "sm" | "md" | "lg" | "xl";
    muted?: boolean;
    className?: string;
}

const sizeMap: Record<NonNullable<PriceProps["size"]>, string> = {
    sm: "text-xs font-semibold",
    md: "text-sm font-bold",
    lg: "text-lg font-extrabold",
    xl: "text-3xl font-black",
};

export function Price({ amount, size = "md", muted = false, className }: PriceProps) {
    return (
        <span className={cn(sizeMap[size], muted ? "text-muted-foreground" : "text-foreground", className)}>
            {formatCurrency(amount)}
        </span>
    );
}
