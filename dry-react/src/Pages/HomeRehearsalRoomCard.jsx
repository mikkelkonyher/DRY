import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './HomeGearCard.css'; // Reuse the same CSS file

function HomeRehearsalRoomCard({ item }) {
    return (
        <Link to={`/RehearsalRoomDetails/${item.id}`} className="homegear-card-link">
            <div className="homegear-card">
                {item.isNew && <div className="badge">New</div>}
                <div className="homegear-title">
                    <h3>{item.name}</h3>
                </div>
                <div className="homegear-price">
                    <h4>{item.price.toLocaleString('da-DK')} DKK {item.paymentType}</h4>
                </div>
                {item.imagePaths && item.imagePaths.length > 0 ? (
                    <img src={item.imagePaths[0]} alt={item.name} className="homegear-image" />
                ) : (
                    <p>Ingen billeder tilgængelige</p>
                )}
            </div>
        </Link>
    );
}

HomeRehearsalRoomCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default HomeRehearsalRoomCard;