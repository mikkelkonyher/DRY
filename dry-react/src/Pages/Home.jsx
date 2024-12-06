import React, { useEffect, useState } from 'react'; // Importer React, useEffect og useState fra react
import './Home.css'; // Importer styling til Home
import config from '../../config.jsx'; // Importer config filen (altså bare hvilken port API'en kører på)

function Home() {
    const [musicGear, setMusicGear] = useState([]); // En tom liste til at gemme musikudstyr

    useEffect(() => { // useEffect hook til at hente musikudstyr fra API'en
        const fetchMusicGear = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear`); // Fetch musikudstyr fra API'en
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMusicGear(Array.isArray(data.items) ? data.items : []); // Gem musikudstyr i state
            } catch (error) {
                console.error('Error fetching music gear:', error);
            }
        };
        fetchMusicGear(); // Kald fetchMusicGear funktionen
    }, []);

    return (
        <div className="home-container">
            <div>
                <h1>Hej Troels</h1>
                <ul>
                    {musicGear.map((item) => ( // Map musikudstyr til en liste
                        <li key={item.id}>{item.brand} {item.model} {item.price}</li>

                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Home;