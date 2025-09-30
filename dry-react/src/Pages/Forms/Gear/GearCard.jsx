import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import config from "../../../../config.jsx";
import './GearCard.css';

function GearCard({ item, handleImageClick, userId }) {
    const [currentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const checkFavoriteStatus = async () => {
            try {
                const checkUrl = new URL(`${config.apiBaseUrl}/api/Favorites/${userId}`);
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
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

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        if (!userId) {
            alert('Login for at tilføje favoritter');
            return;
        }

        if (userId === item.userId) {
            alert('Du kan ikke tilføje dit eget produkt til favoritter');
            return;
        }

        if (loadingFavorite) return; // Prevent double click

        setLoadingFavorite(true);
        try {
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('musicGearId', item.id);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setLoadingFavorite(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/gear/${item.id}`);
    };

    const handleImageClickWrapper = (imagePath) => {
        handleImageClick(imagePath);
        handleCardClick();
    };

    return (
        <div className="gear-card" onClick={handleCardClick}>
            <h4>{item.brand} {item.model}</h4>
            <h5><strong>Pris: </strong>{item.price.toLocaleString('da-DK')} kr. </h5>

            <button
                className="favorite-button-getgear"
                onClick={handleFavoriteClick}
                title={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
                disabled={loadingFavorite}
            >
                <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart}/>
            </button>

            <div className="image-container">
                <img src={item.imagePaths[currentImageIndex]} alt={`${item.brand} ${item.model}`}
                     className="gear-image fixed-size" onClick={(e) => { e.stopPropagation(); handleImageClickWrapper(item.imagePaths[currentImageIndex]); }}/>
            </div>
        </div>
    );
}

GearCard.propTypes = {
    item: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    userId: PropTypes.number,
};

export default GearCard;