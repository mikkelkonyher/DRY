// src/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('AuthToken'));

    useEffect(() => {
        const handleAuthChange = () => {
            const token = Cookies.get('AuthToken');
            setIsAuthenticated(!!token);
        };

        handleAuthChange();

        const interval = setInterval(handleAuthChange, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};