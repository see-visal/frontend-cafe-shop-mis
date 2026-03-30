// ============================================================
// Frontend — Auth API (RTK Query)
// src/store/api/authApi.ts
// ============================================================
import { baseApi } from "./baseApi";
import { setCredentials, clearCredentials } from "@/store/slices/authSlice";
import type { AuthResponse, UserInfo } from "@/types";

export type { AuthResponse, UserInfo };

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    phoneNumber?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    otp: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (body) => ({ url: "/api/public/auth/login", method: "POST", body }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setCredentials({
                    accessToken:  data.accessToken,
                    refreshToken: data.refreshToken,
                    user:         data.user,
                }));
            },
        }),

        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (body) => ({ url: "/api/public/auth/register", method: "POST", body }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setCredentials({
                    accessToken:  data.accessToken,
                    refreshToken: data.refreshToken,
                    user:         data.user,
                }));
            },
        }),

        refresh: builder.mutation<AuthResponse, { refreshToken: string }>({
            query: (body) => ({ url: "/api/public/auth/refresh", method: "POST", body }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setCredentials({
                    accessToken:  data.accessToken,
                    refreshToken: data.refreshToken,
                    user:         data.user,
                }));
            },
        }),

        logout: builder.mutation<void, void>({
            queryFn: () => ({ data: undefined }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(clearCredentials());
                dispatch(baseApi.util.resetApiState());
            },
        }),

        forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
            query: (body) => ({ url: "/api/public/auth/forgot-password", method: "POST", body }),
        }),

        resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
            query: (body) => ({ url: "/api/public/auth/reset-password", method: "POST", body }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = authApi;
