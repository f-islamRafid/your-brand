import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ token, children }) => {
    
    // Function to check if the token is a valid, unexpired JWT
    const isTokenValid = (token) => {
        if (!token || token === "true") return false;

        try {
            // JWTs have 3 parts separated by dots. We need the middle part (payload).
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if current time is past the expiration time (exp)
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (e) {
            // If decoding fails, the token is invalid
            return false;
        }
    };

    if (!isTokenValid(token)) {
        // If invalid or expired, clear the junk and redirect
        localStorage.removeItem('admin_token');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;