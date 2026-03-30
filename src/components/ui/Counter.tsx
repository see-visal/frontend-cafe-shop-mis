"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface CounterProps {
    end: number;
    suffix?: string;
    durationMs?: number;
}

export function Counter({ end, suffix = "", durationMs = 1000 }: CounterProps) {
    const [value, setValue] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const start = performance.now();
        let frameId = 0;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const next = Math.floor(end * progress);
            setValue(next);

            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [durationMs, end]);

    const formatted = useMemo(
        () => new Intl.NumberFormat("en-US").format(value),
        [value],
    );

    return <>{formatted}{suffix}</>;
}
