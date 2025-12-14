import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    // 1. Initialize State from Local Storage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('furniture_cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error parsing cart data", error);
            return [];
        }
    });

    // 2. Save to Local Storage
    useEffect(() => {
        localStorage.setItem('furniture_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- 👇 FIXED: CALCULATE TOTAL CORRECTLY ---
    // We use 'item.price' because that is what we saved in the cart object
    const cartTotal = cartItems.reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        return total + (itemPrice * itemQty);
    }, 0).toFixed(2);
    
    // Count Total Items
    const totalItems = cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);

    // Function: Add to Cart
    const addToCart = (product, variant = null) => {
        setCartItems(prevItems => {
            const cartId = variant 
                ? `${product.product_id}-${variant.variant_id}` 
                : `${product.product_id}-base`;

            const existingItem = prevItems.find(item => item.cartId === cartId);

            if (existingItem) {
                return prevItems.map(item => 
                    item.cartId === cartId 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                return [...prevItems, {
                    cartId,
                    id: product.product_id,
                    name: product.name,
                    image: product.image,
                    // We save the FINAL price here
                    price: parseFloat(product.base_price) + (variant ? parseFloat(variant.price_modifier) : 0),
                    quantity: 1,
                    variant_id: variant ? variant.variant_id : null,
                    variant_info: variant ? `${variant.color} / ${variant.size}` : null
                }];
            }
        });
    };

    const removeFromCart = (cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.cartId === cartId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

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