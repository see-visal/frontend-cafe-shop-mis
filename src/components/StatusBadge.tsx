import { Badge } from "./ui/badge";
import type { OrderStatus } from "@/types";

const STATUS_MAP: Record<
    OrderStatus,
    { variant: "warning" | "info" | "success" | "muted" | "danger"; label: string }
> = {
    PENDING_PAYMENT: { variant: "warning",  label: "Pending Payment" },
    CONFIRMED:       { variant: "info",     label: "Confirmed" },
    PREPARING:       { variant: "warning",  label: "Preparing" },
    READY:           { variant: "success",  label: "Ready!" },
    SERVED:          { variant: "muted",    label: "Served" },
    CANCELLED:       { variant: "danger",   label: "Cancelled" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
    const info = STATUS_MAP[status] ?? { variant: "muted" as const, label: status };
    return <Badge variant={info.variant}>{info.label}</Badge>;
}
