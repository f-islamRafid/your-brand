// client/src/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('furniture_cart');
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        localStorage.setItem('furniture_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, variant) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => 
                item.product_id === product.product_id && 
                item.variant_id === variant?.variant_id
            );

            if (existingItem) {
                return prevCart.map(item => 
                    (item.product_id === product.product_id && item.variant_id === variant?.variant_id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { 
                    ...product, 
                    variant_id: variant?.variant_id,
                    variant_name: variant ? `${variant.color} - ${variant.size}` : 'Standard',
                    price: variant ? (parseFloat(product.base_price) + parseFloat(variant.price_modifier)).toFixed(2) : product.base_price,
                    quantity: 1 
                }];
            }
        });
    };

    const removeFromCart = (productId, variantId) => {
        setCart(prevCart => prevCart.filter(item => 
            !(item.product_id === productId && item.variant_id === variantId)
        ));
    };

    // --- NEW FUNCTION ---
    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        // Add clearCart to the value object below
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);