import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import config from "../../../config.jsx"; // Import the config object

function GearCard({ item, handleImageClick, userId }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the item is already a favorite when the component mounts
        const checkFavoriteStatus = async () => {
            try {
                const checkUrl = new URL(`${config.apiBaseUrl}/api/Favorites/${userId}`);
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!checkResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const favorites = await checkResponse.json();
                const favoriteStatus = favorites.some(favorite => favorite.musicGearId === item.id);
                setIsFavorite(favoriteStatus);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        checkFavoriteStatus();
    }, [item.id, userId]);

    const handleFavoriteClick = async () => {
        if (!userId) {
            alert('Login for at tilføje favoritter');
            return;
        }

        if (userId === item.userId) {
            alert('Du kan ikke tilføje dit eget produkt til favoritter');
            return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('musicGearId', item.id);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.imagePaths.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.imagePaths.length) % item.imagePaths.length);
    };

    const handleViewDetailsClick = () => {
        if (!userId) {
            alert('Login for at se produkt');
            return;
        }
        navigate(`/gear/${item.id}`);
    };

    return (
        <div className="gear-card">
            <h3>{item.brand} {item.model}</h3>
            <h4><strong>Pris: </strong>{item.price} kr. </h4>

            <div className="image-container">
                <button className="favorite-button" onClick={handleFavoriteClick}>
                    <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart}/>
                </button>
                <button className="nav-button left" onClick={handlePrevImage}>&lt;</button>
                <img src={item.imagePaths[currentImageIndex]} alt={`${item.brand} ${item.model}`}
                     className="gear-image" onClick={() => handleImageClick(item.imagePaths[currentImageIndex])}/>
                <button className="nav-button right" onClick={handleNextImage}>&gt;</button>
            </div>

            <button className="view-details-button" onClick={handleViewDetailsClick}>Vis produkt</button>
        </div>
    );
}

GearCard.propTypes = {
    item: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    handleFavorite: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired, // Add userId to prop types
};

export default GearCard;