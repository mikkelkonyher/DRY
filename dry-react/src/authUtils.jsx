// src/authUtils.js
import Cookies from 'js-cookie';

// Function to check token validity
export const checkToken = () => {
    const token = Cookies.get('AuthToken');
    if (!token) {
        console.warn('No AuthToken found. User might not be authenticated.');
    }
};