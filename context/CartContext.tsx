"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

export interface CartItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    base_price?: number;
    image: string;
    quantity: number;
    variant?: {
        id?: string | number;
        size?: string;
        color?: string;
        [key: string]: any;
    };
    bulk_discount_rules?: { min_qty: number; discount_amount: number }[];
    [key: string]: any;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number, variantId?: string | number) => void;
    updateQuantity: (id: number, quantity: number, variantId?: string | number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartSubtotal: number;
    cartDiscount: number;
    cartCount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    getDiscountedPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: CartItem) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) => item.id === newItem.id && item.variant?.id === newItem.variant?.id
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += newItem.quantity;
                return newCart;
            } else {
                return [...prevCart, newItem];
            }
        });
        setIsCartOpen(true);

        // Meta Pixel: Track AddToCart
        fpixel.event('AddToCart', {
            content_ids: [newItem.id.toString()],
            content_name: newItem.name,
            content_type: 'product',
            contents: [{ id: newItem.id.toString(), quantity: newItem.quantity }],
            value: Number(newItem.price || 0) * newItem.quantity,
            currency: 'BDT'
        });
    };

    const removeFromCart = (id: number, variantId?: string | number) => {
        setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.variant?.id === variantId)));
    };

    const updateQuantity = (id: number, quantity: number, variantId?: string | number) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id && item.variant?.id === variantId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const getDiscountedPrice = (item: CartItem) => {
        const basePrice = item.price || 0;
        const cumulativeQty = cart
            .filter((i) => i.id === item.id)
            .reduce((sum, i) => sum + i.quantity, 0);

        let bulkDiscountPerItem = 0;
        if (item.bulk_discount_rules && Array.isArray(item.bulk_discount_rules)) {
            for (const rule of item.bulk_discount_rules) {
                const minQty = Number(rule.min_qty) || 0;
                const discAmt = Number(rule.discount_amount) || 0;
                if (minQty > 0 && cumulativeQty >= minQty) {
                    bulkDiscountPerItem = Math.max(bulkDiscountPerItem, discAmt);
                }
            }
        }
        return Math.max(0, basePrice - bulkDiscountPerItem);
    };

    const cartTotal = cart.reduce((total, item) => {
        const finalPrice = getDiscountedPrice(item);
        return total + finalPrice * item.quantity;
    }, 0);

    const cartSubtotal = cart.reduce((total, item) => {
        return total + (item.price || 0) * item.quantity;
    }, 0);

    const cartDiscount = Math.max(0, cartSubtotal - cartTotal);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartSubtotal,
                cartDiscount,
                cartCount,
                isCartOpen,
                toggleCart,
                getDiscountedPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
