import React, { createContext, useState, useEffect } from 'react';
import config from "../config.jsx";


// Create a context to store the authentication status
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies are sent with the request
                });


                setIsAuthenticated(response.ok); // If response is 200, user is authenticated
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            }
        };


        checkAuthStatus();


        const interval = setInterval(checkAuthStatus, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);


    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
