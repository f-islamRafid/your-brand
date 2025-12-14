import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    // 1. Initialize State from Local Storage (Load saved cart)
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('furniture_cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error parsing cart data", error);
            return [];
        }
    });

    // 2. Save to Local Storage whenever cart changes
    useEffect(() => {
        localStorage.setItem('furniture_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Calculate Total Price
    const cartTotal = cartItems.reduce((total, item) => total + (item.base_price * item.quantity) + (item.price_modifier || 0) * item.quantity, 0).toFixed(2);
    
    // Count Total Items
    const totalItems = cartItems.reduce((count, item) => count + item.quantity, 0);

    // Function: Add to Cart
    const addToCart = (product, variant = null) => {
        setCartItems(prevItems => {
            // Create a unique ID for the cart item (Product ID + Variant ID)
            const cartId = variant 
                ? `${product.product_id}-${variant.variant_id}` 
                : `${product.product_id}-base`;

            const existingItem = prevItems.find(item => item.cartId === cartId);

            if (existingItem) {
                // If item exists, just increase quantity
                return prevItems.map(item => 
                    item.cartId === cartId 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                // Add new item
                return [...prevItems, {
                    cartId,
                    id: product.product_id,
                    name: product.name,
                    image: product.image, // Assuming image path logic is handled in display
                    price: parseFloat(product.base_price) + (variant ? parseFloat(variant.price_modifier) : 0),
                    quantity: 1,
                    variant_id: variant ? variant.variant_id : null,
                    variant_info: variant ? `${variant.color} / ${variant.size}` : null
                }];
            }
        });
    };

    // Function: Remove from Cart
    const removeFromCart = (cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    // Function: Update Quantity
    const updateQuantity = (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.cartId === cartId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Function: Clear Cart (After payment)
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('furniture_cart');
    };

    const value = {
        cartItems,
        cartTotal,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}