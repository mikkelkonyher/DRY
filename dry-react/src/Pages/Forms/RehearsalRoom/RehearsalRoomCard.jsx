import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import config from "../../../../config.jsx";
import './RehearsalRoomCard.css';

function RehearsalRoomCard({ item, handleImageClick, userId }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const checkFavoriteStatus = async () => {
            try {
                const checkUrl = new URL(`${config.apiBaseUrl}/api/RehearsalRoomFavorites/${userId}`);
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!checkResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const favorites = await checkResponse.json();
                const favoriteStatus = favorites.some(favorite => favorite.rehearsalRoomid === item.id);
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

        try {
            const url = new URL(`${config.apiBaseUrl}/api/RehearsalRoomFavorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('rehearsalRoomId', item.id);
            const method = isFavorite ? 'DELETE' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleCardClick = () => {
        window.open(`/RehearsalRoomDetails/${item.id}`, '_blank');
    };

    return (
        <div className="rehearsal-room-card" onClick={handleCardClick}>
            <h3>{item.name}</h3>
            <p><strong>{item.type}, {item.location}</strong> </p>

            <div className="image-container">
                <button
                    className="favorite-button"
                    onClick={handleFavoriteClick}
                    title={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
                >
                    <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart}/>
                </button>
                <img
                    src={item.imagePaths[0]}
                    alt={item.name}
                    onClick={(e) => { e.stopPropagation(); handleImageClick(item.imagePaths[0]); }}
                    className="rehearsal-room-image"
                />
            </div>
            <div className="rehearsal-room-details left-align">
                {/* Add other details here */}
            </div>
        </div>
    );
}

RehearsalRoomCard.propTypes = {
    item: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    userId: PropTypes.number, // Make userId optional
};

export default RehearsalRoomCard;