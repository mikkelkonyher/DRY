import config from "../config.jsx";

// Function to check if the user is authenticated
export const checkToken = async () => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
            method: 'GET',
            credentials: 'include', // Ensures cookies are sent
        });

        if (!response.ok) {
            console.warn('User is not authenticated.');
            return null;
        }

        const data = await response.json();
        return data.UserId; // Returns user ID if authenticated
    } catch (error) {
        console.error('Error checking token:', error);
        return null;
    }
};