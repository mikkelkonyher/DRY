// src/authUtils.js
export function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expiry;
}

export function checkToken() {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again.');
        // Redirect to login page or perform other logout actions
        window.location.href = '/login'; // Example redirect to login page
    }
}