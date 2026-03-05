import React, { createContext, useContext, useState, useEffect } from 'react';
import productsData from '../data/products.json';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    priceRaw: number;
    image: string;
    quantity: number;
    weight?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    subtotal: number;
    appliedPromo: { code: string; discount: number } | null;
    applyPromo: (code: string) => { success: boolean; message: string };
    removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apelsinka_cart');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }
        }
        return [];
    });

    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('apelsinka_promo');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse promo', e);
                }
            }
        }
        return null;
    });

    useEffect(() => {
        localStorage.setItem('apelsinka_cart', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        if (appliedPromo) {
            localStorage.setItem('apelsinka_promo', JSON.stringify(appliedPromo));
        } else {
            localStorage.removeItem('apelsinka_promo');
        }
    }, [appliedPromo]);

    const addToCart = (product: any) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            // Parse price string like "1 799 ₽" to number
            const priceRaw = parseInt(product.price.replace(/[^0-9]/g, ''), 10);

            return [...prevItems, {
                id: product.id,
                name: product.name,
                price: priceRaw,
                priceRaw: priceRaw,
                image: product.image,
                quantity: 1,
                weight: product.weight
            }];
        });
    };

    const removeFromCart = (id: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setItems((prevItems) =>
            prevItems
                .map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setItems([]);
        setAppliedPromo(null);
    };

    const applyPromo = (code: string) => {
        const promo = (productsData as any).promoCodes?.find((p: any) => p.code.toUpperCase() === code.toUpperCase() && p.isActive !== false);

        if (promo) {
            setAppliedPromo({ code: promo.code, discount: promo.discount });
            return { success: true, message: `Промокод применен! Скидка ${promo.discount}%` };
        } else {
            return { success: false, message: 'Неверный или неактивный промокод' };
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = appliedPromo
        ? Math.round(subtotal * (1 - appliedPromo.discount / 100))
        : subtotal;

    return (
        <CartContext.Provider
            value={{
                items, addToCart, removeFromCart, updateQuantity, clearCart,
                totalItems, totalPrice, subtotal, appliedPromo, applyPromo, removePromo
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
