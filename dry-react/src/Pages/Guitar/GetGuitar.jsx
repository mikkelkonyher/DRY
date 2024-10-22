import React, { useEffect, useState } from 'react';
import './GetGuitar.css';

function GetGuitar() {
    const [guitars, setGuitars] = useState([]);

    useEffect(() => {
        const fetchGuitars = async () => {
            try {
                const response = await fetch('https://localhost:7064/api/Guitar');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGuitars(data);
            } catch (error) {
                console.error('Error fetching guitars:', error);
            }
        };

        fetchGuitars();
    }, []);

    return (
        <div className="guitar-list">
            {guitars.map((guitar) => (
                <div key={guitar.id} className="guitar-card">
                    <img src={`https://localhost:7064/${guitar.imagePaths[0]}`} alt={`${guitar.brand} ${guitar.model}`} className="guitar-image" />
                    <h3>{guitar.brand} {guitar.model}</h3>
                    <p>{guitar.description}</p>
                    <p>Price: {guitar.price}</p>
                    <p>Location: {guitar.location}</p>
                    <p>Condition: {guitar.condition}</p>
                    <p>Year: {guitar.year}</p>
                    <p>Type: {guitar.guitarType}</p>
                </div>
            ))}
        </div>
    );
}

export default GetGuitar;