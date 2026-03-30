// ============================================================
// Frontend — Cart Slice
// Aligned with backend OrderItemRequest (supports special instructions)
// src/store/slices/cartSlice.ts
// ============================================================
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    category?: string;
    specialInstructions?: string;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem(state, action: PayloadAction<CartItem>) {
            const existing = state.items.find((i) => i.productId === action.payload.productId);
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        removeItem(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.productId !== action.payload);
        },
        updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
            const item = state.items.find((i) => i.productId === action.payload.productId);
            if (item) {
                if (action.payload.quantity <= 0) {
                    state.items = state.items.filter((i) => i.productId !== action.payload.productId);
                } else {
                    item.quantity = action.payload.quantity;
                }
            }
        },
        updateInstructions(state, action: PayloadAction<{ productId: string; instructions: string }>) {
            const item = state.items.find((i) => i.productId === action.payload.productId);
            if (!item) return;

            const normalized = action.payload.instructions.trim();
            item.specialInstructions = normalized ? normalized : undefined;
        },
        clearCart(state) {
            state.items = [];
        },
    },
});

export const { addItem, removeItem, updateQuantity, updateInstructions, clearCart } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
    state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
