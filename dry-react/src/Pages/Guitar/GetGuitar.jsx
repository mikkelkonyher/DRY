import React, { useEffect, useState } from 'react';
import './GetGuitar.css';

function GetGuitar() {
    const [guitars, setGuitars] = useState([]);
    const [showAllImages, setShowAllImages] = useState({});

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

    const toggleShowAllImages = (id) => {
        setShowAllImages((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    return (
        <div className="guitar-list">
            {guitars.map((guitar) => (
                <div key={guitar.id} className="guitar-card">
                    {showAllImages[guitar.id] ? (
                        guitar.imagePaths.map((imagePath, index) => (
                            <img key={index} src={imagePath} alt={`${guitar.brand} ${guitar.model}`}
                                 className="guitar-image"/>
                        ))
                    ) : (
                        <img src={guitar.imagePaths[0]} alt={`${guitar.brand} ${guitar.model}`}
                             className="guitar-image"/>
                    )}
                    <button onClick={() => toggleShowAllImages(guitar.id)}>
                        {showAllImages[guitar.id] ? 'Show Less' : 'Show All Images'}
                    </button>
                    <h3>{guitar.brand} {guitar.model}</h3>
                    <p>{guitar.description}</p>
                    <p><strong>Pris: {guitar.price} DKK</strong></p>
                    <p><strong>Lokation:</strong> {guitar.location}</p>
                    <p><strong>Stand:</strong> {guitar.condition}</p>
                    <p><strong>År:</strong> {guitar.year}</p>
                    <p><strong>Type: </strong>{guitar.guitarType}</p>
                </div>
            ))}
        </div>
    );
}

export default GetGuitar;