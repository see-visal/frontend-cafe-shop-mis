import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
};

export function Logo({ size = "md", className }: LogoProps) {
    const s = sizes[size];
    return (
        <div className={cn("relative flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-white shadow-sm border border-black/5 dark:border-white/10", s, className)}>
            <Image 
                src="/salsee.png" 
                alt="SalSee Logo"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-0.5"
                priority
            />
        </div>
    );
}
