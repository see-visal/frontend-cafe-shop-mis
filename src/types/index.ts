// ============================================================
// Frontend — Shared TypeScript types
// Aligned with backend DTOs
// src/types/index.ts
// ============================================================

export type OrderStatus =
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "CANCELLED";

export type OrderType = "DINE_IN" | "TAKEAWAY";

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Matches backend AuthResponse.UserInfo */
export interface UserInfo {
    uuid: string;
    username: string;
    email: string;
    givenName: string;
    familyName: string;
    roles: string[];
}

/** Matches backend AuthResponse */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserInfo;
}

// ── Products & Categories ─────────────────────────────────────────────────────

/** Matches backend CategoryResponse */
export interface Category {
    id: number;
    name: string;
    icon: string | null;
}

/** Matches backend ProductResponse */
export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    /** Category name (string), not ID */
    category: string | null;
    imageUrl: string | null;
    active: boolean;
    showOnHomepage: boolean;
    todaySpecial: boolean;
    homePriority: number | null;
}

export interface HomeShowcaseResponse {
    todaySpecials: Product[];
    featuredProducts: Product[];
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** Matches backend OrderItemResponse */
export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productImageUrl?: string | null;
    quantity: number;
    unitPrice: number;
}

/** Matches backend OrderResponse */
export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    orderType: OrderType;
    tableNumber: number | null;
    totalPrice: number;
    paymentRef: string | null;
    notes: string | null;
    baristaId: string | null;
    estimatedMinutes: number | null;
    items: OrderItem[];
    createdAt: string;
    servedAt: string | null;
    clientSecret: string | null;
    pickupToken: string | null;
    discountAmount: number | null;
    promoCode: string | null;
}

/** Matches backend OrderItemRequest */
export interface OrderItemRequest {
    productId: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
}

/** Matches backend OrderRequest (userId is resolved from JWT on backend) */
export interface PlaceOrderRequest {
    orderType: OrderType;
    tableNumber?: number;
    items: OrderItemRequest[];
    notes?: string;
    promoCode?: string;
    discountAmount?: number;
}

// ── Payments ──────────────────────────────────────────────────────────────────

/** Matches backend PaymentRequest */
export interface PaymentRequest {
    orderId: string;
    paymentMethod: string;
    amount: number;
    transactionRef?: string;
}

/** Matches backend PaymentResponse */
export interface Payment {
    id: string;
    orderId: string;
    paymentMethod: string;
    status: string;
    amount: number;
    transactionRef: string | null;
    paidAt: string | null;
    createdAt: string;
}

/** Matches backend ReceiptResponse.ReceiptItemResponse */
export interface ReceiptItem {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

/** Matches backend ReceiptResponse */
export interface Receipt {
    orderId: string;
    paymentId: string;
    orderType: string;
    tableNumber: number | null;
    items: ReceiptItem[];
    subtotal: number;
    totalPaid: number;
    paymentMethod: string;
    paidAt: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────

/** Matches backend UserProfileResponse */
export interface UserProfile {
    uuid: string;
    username: string;
    email: string;
    familyName: string;
    givenName: string;
    phoneNumber: string | null;
    gender: string | null;
    dob: string | null;
    profileImage: string | null;
    coverImage: string | null;
    roles: string[];
    loyaltyPoints: number | null;
    notificationPreference: "IN_APP" | "TELEGRAM" | string | null;
}

/** Matches backend UpdateProfileRequest */
export interface UpdateProfileRequest {
    familyName?: string;
    givenName?: string;
    phoneNumber?: string;
    gender?: string;
    dob?: string | null;
    profileImage?: string;
    coverImage?: string;
}

export interface PromoValidateRequest {
    code: string;
    orderTotal: number;
}

export interface PromoValidateResponse {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    message: string;
}

export interface RatingRequest {
    productId: string;
    stars: number;
    comment?: string;
}

export interface RatingResponse {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    stars: number;
    comment: string | null;
    createdAt: string;
}

export interface NotificationPreferenceRequest {
    preference: "IN_APP" | "TELEGRAM";
    telegramChatId?: string;
}
