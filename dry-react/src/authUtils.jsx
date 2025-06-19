import config from "../config.jsx";

// Funktion til at tjekke, om brugeren er autentificeret
export const checkToken = async () => {
    try {
        // Sender en GET-forespørgsel til serveren for at validere brugerens token
        const response = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
            method: 'GET',
            credentials: 'include', // Sikrer, at cookies sendes med forespørgslen
        });

        // Hvis serveren svarer med en fejlstatus, betragtes brugeren som ikke-autentificeret
        if (!response.ok) {
            console.warn('Brugeren er ikke autentificeret.');
            return null;
        }

        // Parser JSON-svaret og returnerer brugerens ID, hvis autentificeret
        const data = await response.json();
        return data.UserId; // Returnerer bruger-ID, hvis autentificeret
    } catch (error) {
        // Logger fejl, hvis der opstår problemer under forespørgslen
        console.error('Error checking token:', error); // Fejlmeddelelser forbliver på engelsk
        return null;
    }
};