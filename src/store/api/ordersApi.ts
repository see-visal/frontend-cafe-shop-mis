// ============================================================
// Frontend — Orders & Payments API (RTK Query)
// Endpoints: /api/customer/orders, /api/customer/payments
// src/store/api/ordersApi.ts
// ============================================================
import { baseApi } from "./baseApi";
import type {
    Order,
    PlaceOrderRequest,
    Payment,
    PaymentRequest,
    Receipt,
    PromoValidateRequest,
    PromoValidateResponse,
    RatingRequest,
    RatingResponse,
} from "@/types";

export type {
    Order,
    PlaceOrderRequest,
    Payment,
    PaymentRequest,
    Receipt,
    PromoValidateRequest,
    PromoValidateResponse,
    RatingRequest,
    RatingResponse,
};

// Re-export convenience aliases used in pages
export type OrderResponse    = Order;
export type PaymentResponse  = Payment;
export type ReceiptResponse  = Receipt;

export const ordersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /** Place a new order — userId is resolved from JWT on the backend */
        placeOrder: builder.mutation<Order, PlaceOrderRequest>({
            query: (body) => ({
                url: "/api/customer/orders",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order"],
        }),

        /** Get my order history (userId from JWT) */
        getMyOrders: builder.query<Order[], void>({
            query: () => "/api/customer/orders",
            providesTags: ["Order"],
        }),

        /** Track a single order by ID */
        getOrder: builder.query<Order, string>({
            query: (id) => `/api/customer/orders/${id}`,
            providesTags: (_result, _err, id) => [{ type: "Order", id }],
        }),

        /** Cancel a pending order */
        cancelOrder: builder.mutation<void, string>({
            query: (id) => ({ url: `/api/customer/orders/${id}`, method: "DELETE" }),
            invalidatesTags: ["Order"],
        }),

        /** Initiate payment for an order */
        pay: builder.mutation<Payment, PaymentRequest>({
            query: (body) => ({ url: "/api/customer/payments", method: "POST", body }),
            invalidatesTags: ["Order"],
        }),

        /** Get payment status for a specific order */
        getPaymentByOrder: builder.query<Payment, string>({
            query: (orderId) => `/api/customer/payments/order/${orderId}`,
            providesTags: (_result, _err, orderId) => [{ type: "Order", id: orderId }],
        }),

        /** Get receipt after successful payment */
        getReceipt: builder.query<Receipt, string>({
            query: (orderId) => `/api/customer/orders/${orderId}/receipt`,
        }),

        /** Validate promo code against current order subtotal */
        validatePromo: builder.mutation<PromoValidateResponse, PromoValidateRequest>({
            query: (body) => ({
                url: "/api/public/promos/validate",
                method: "POST",
                body,
            }),
        }),

        /** Submit post-delivery rating for an order */
        submitRating: builder.mutation<RatingResponse, { orderId: string; body: RatingRequest }>({
            query: ({ orderId, body }) => ({
                url: `/api/customer/orders/${orderId}/rating`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _err, { orderId }) => [{ type: "Order", id: orderId }],
        }),

        /** Generate Bakong QR code via backend */
        generateBakongQr: builder.mutation<any, any>({
            query: (body) => ({
                url: "/payment/generate-qr",
                method: "POST",
                body,
            }),
        }),

        /**
         * Check if a Bakong KHQR transaction has been paid.
         * Pass the MD5 hash returned by generateBakongQr.
         * Returns responseCode 0 + data when transaction is confirmed.
         */
        checkBakongTransaction: builder.mutation<any, { md5: string }>({
            query: (body) => ({
                url: "/payment/check-transaction",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    usePlaceOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderQuery,
    useCancelOrderMutation,
    usePayMutation,
    useGetPaymentByOrderQuery,
    useGetReceiptQuery,
    useValidatePromoMutation,
    useSubmitRatingMutation,
    useGenerateBakongQrMutation,
    useCheckBakongTransactionMutation,
} = ordersApi;
