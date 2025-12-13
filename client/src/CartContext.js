// client/src/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context (The "Box")
const CartContext = createContext();

// 2. Create the Provider (The component that wraps the app)
export const CartProvider = ({ children }) => {
    // Load cart from localStorage if it exists, otherwise start empty
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('furniture_cart');
        return localData ? JSON.parse(localData) : [];
    });

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('furniture_cart', JSON.stringify(cart));
    }, [cart]);

    // Function to add an item
    const addToCart = (product, variant) => {
        setCart(prevCart => {
            // Check if this specific item (product + variant) is already in cart
            const existingItem = prevCart.find(item => 
                item.product_id === product.product_id && 
                item.variant_id === variant?.variant_id
            );

            if (existingItem) {
                // If exists, just increase quantity
                return prevCart.map(item => 
                    (item.product_id === product.product_id && item.variant_id === variant?.variant_id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // If new, add to cart with quantity 1
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

    // Function to remove an item
    const removeFromCart = (productId, variantId) => {
        setCart(prevCart => prevCart.filter(item => 
            !(item.product_id === productId && item.variant_id === variantId)
        ));
    };

    // Calculate total items for the badge
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

// 3. Custom Hook to make using the context easy
export const useCart = () => useContext(CartContext);