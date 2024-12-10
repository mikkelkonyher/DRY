import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import config from "../../../config.jsx";
import './RehearsalRoomCard.css';

function RehearsalRoomCard({ item, users, handleImageClick, userId }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();
    const user = users[item.userId];

    useEffect(() => {
        if (!userId) return;

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
                const favoriteStatus = favorites.some(favorite => favorite.rehearsalRoomId === item.id);
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
            alert('Du kan ikke tilføje dit eget lokale til favoritter');
            return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('rehearsalRoomId', item.id);

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

    const handleCardClick = () => {
        navigate(`/rehearsalroom/${item.id}`);
    };

    return (
        <div className="rehearsal-room-card" onClick={handleCardClick}>
            <h3>{item.name}</h3>
            <p><strong>Lokale type:</strong> {item.type}</p>


            <img
                src={item.imagePaths[0]}
                alt={item.name}
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(item.imagePaths[0]);
                }}
                className="rehearsal-room-image"
            />
            <div className="rehearsal-room-details left-align">

                <p><strong>Adresse:</strong> {item.address}</p>
                <p><strong>By:</strong> {item.location}</p>
                <p><strong>Pris:</strong> {item.price} kr. {item.paymentType} </p>
                <p><strong>Størrelse:</strong> {item.roomSize} m²</p>
                <p><strong>Favoritter:</strong> {item.favoriteCount}</p>
                {user && <p><strong>Udlejer:</strong> {user.name}</p>}
                <p><strong>Oprettet:</strong> {new Date(item.listingDate).toLocaleDateString()}</p>
                <button
                    className="favorite-button"
                    onClick={handleFavoriteClick}
                    title={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
                >
                    <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart}/>
                </button>
            </div>
        </div>
    );
}

RehearsalRoomCard.propTypes = {
    item: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    userId: PropTypes.number, // Make userId optional
};

export default RehearsalRoomCard;