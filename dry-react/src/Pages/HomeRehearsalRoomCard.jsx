import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './HomeRehearsalRoomCard.css';

function HomeRehearsalRoomCard({ item }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/RehearsalRoomDetails/${item.id}`);
    };

    return (
        <div className="Homerehearsal-room-card" onClick={handleCardClick}>
            {item.imagePaths && item.imagePaths.length > 0 ? (
                <img className="Homerehearsal-room-image" src={item.imagePaths[0]} alt={item.name} />
            ) : (
                <p>Ingen billeder tilgængelige</p>
            )}
            <div className="Homerehearsal-room-title">
                <h3>{item.name}</h3>
            </div>
            <div className="Homerehearsal-room-price">
                <h4>{item.price} DKK {item.paymentType}</h4>
            </div>
        </div>
    );
}

HomeRehearsalRoomCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default HomeRehearsalRoomCard;