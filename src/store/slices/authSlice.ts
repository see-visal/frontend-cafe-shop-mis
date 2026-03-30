// ============================================================
// Frontend — Auth Slice (JWT state + persistence)
// src/store/slices/authSlice.ts
// ============================================================
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserInfo } from "@/types";

export type { UserInfo };

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    accessToken:
        typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null,
    refreshToken:
        typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null,
    user:
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("user") ?? "null")
            : null,
    isAuthenticated: false,
};
initialState.isAuthenticated = !!initialState.accessToken;

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials(
            state,
            action: PayloadAction<{
                accessToken: string;
                refreshToken: string;
                user: UserInfo;
            }>
        ) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", action.payload.accessToken);
                localStorage.setItem("refreshToken", action.payload.refreshToken);
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            }
        },
        clearCredentials(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            }
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
