// ============================================================
// Frontend — Profile API (RTK Query)
// src/store/api/profileApi.ts
// ============================================================
import { baseApi } from "./baseApi";
import type { UserProfile, UpdateProfileRequest, NotificationPreferenceRequest } from "@/types";

export type { UserProfile, UpdateProfileRequest, NotificationPreferenceRequest };

export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<UserProfile, void>({
            query: () => "/api/customer/profile",
            providesTags: ["User"],
        }),

        updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
            query: (body) => ({ url: "/api/customer/profile", method: "PUT", body }),
            invalidatesTags: ["User"],
        }),

        updateNotificationPreference: builder.mutation<UserProfile, NotificationPreferenceRequest>({
            query: (body) => ({ url: "/api/customer/profile/notifications", method: "PUT", body }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUpdateNotificationPreferenceMutation,
} = profileApi;
