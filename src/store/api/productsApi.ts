// ============================================================
// Frontend — Products & Categories API (RTK Query)
// Endpoints: GET /api/public/products, GET /api/public/products/{id},
//            GET /api/public/categories
// src/store/api/productsApi.ts
// ============================================================
import { baseApi } from "./baseApi";
import type { Product, Category, HomeShowcaseResponse, PageResponse } from "@/types";

export type { Product, Category, HomeShowcaseResponse, PageResponse };

export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMenu: builder.query<
            PageResponse<Product>,
            { page?: number; size?: number; categoryId?: number; search?: string }
        >({
            query: ({ page = 0, size = 12, categoryId, search } = {}) => ({
                url: "/api/public/products",
                params: {
                    page,
                    size,
                    ...(categoryId != null && { categoryId }),
                    ...(search ? { search } : {}),
                },
            }),
            providesTags: ["Product"],
        }),

        getProduct: builder.query<Product, string>({
            query: (id) => `/api/public/products/${id}`,
            providesTags: (_result, _err, id) => [{ type: "Product", id }],
        }),

        getCategories: builder.query<Category[], void>({
            query: () => "/api/public/categories",
            providesTags: ["Category"],
        }),

        getHomeShowcase: builder.query<HomeShowcaseResponse, void>({
            query: () => "/api/public/home-showcase",
            providesTags: ["Product"],
        }),
    }),
});

export const { useGetMenuQuery, useGetProductQuery, useGetCategoriesQuery, useGetHomeShowcaseQuery } = productsApi;
