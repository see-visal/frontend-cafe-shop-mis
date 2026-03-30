import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import cartReducer, { type CartItem } from "./slices/cartSlice";

const CART_STORAGE_KEY = "cartItems";

function loadCartItems(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
        cart: {
            items: loadCartItems(),
        },
    },
});

if (typeof window !== "undefined") {
    store.subscribe(() => {
        const state = store.getState();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart.items));
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
