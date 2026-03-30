// ============================================================
// Frontend — RTK Query Base API with automatic 401 token refresh
// src/store/api/baseApi.ts
// ============================================================
import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../slices/authSlice";
import type { AuthResponse } from "@/types";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

/**
 * Wraps rawBaseQuery: on 401, attempts a silent refresh then retries.
 * If refresh also fails, clears credentials and redirects to /login.
 */
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const refreshToken =
            typeof window !== "undefined"
                ? localStorage.getItem("refreshToken")
                : null;

        if (refreshToken) {
            const refreshResult = await rawBaseQuery(
                {
                    url: "/api/public/auth/refresh",
                    method: "POST",
                    body: { refreshToken },
                },
                api,
                extraOptions,
            );

            if (refreshResult.data) {
                const data = refreshResult.data as AuthResponse;
                api.dispatch(
                    setCredentials({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        user: data.user,
                    }),
                );
                // Retry original request with the new token
                result = await rawBaseQuery(args, api, extraOptions);
            } else {
                api.dispatch(clearCredentials());
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            }
        } else {
            api.dispatch(clearCredentials());
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Product", "Order", "User", "Category"],
    endpoints: () => ({}),
});
