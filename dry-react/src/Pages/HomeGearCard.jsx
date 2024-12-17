import React from 'react';
import PropTypes from 'prop-types';
import './HomeGearCard.css';
import { Link } from 'react-router-dom';

function HomeGearCard({ item }) {
    return (
        <Link to={`/gear/${item.id}`} className="homegear-card-link">
            <div className="homegear-card">
                {item.isNew && <div className="badge">New</div>}
                <div className="homegear-title">
                    <h3>{item.brand} {item.model}</h3>
                </div>
                <div className="homegear-price">
                    <h4><strong></strong>{item.price} DKK</h4>
                </div>
                {item.imagePaths && item.imagePaths.length > 0 ? (
                    <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`} className="homegear-image" />
                ) : (
                    <p>Ingen billeder tilgængelige</p>
                )}
            </div>
        </Link>
    );
}

HomeGearCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default HomeGearCard;