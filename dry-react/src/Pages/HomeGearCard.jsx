import React from 'react';
import PropTypes from 'prop-types';
import './HomeGearCard.css';

function HomeGearCard({ item }) {
    return (
        <div className="homegear-card">
            <h3>{item.brand} {item.model}</h3>
            <h4><strong>Price: </strong>{item.price} kr.</h4>
            {item.imagePaths && item.imagePaths.length > 0 ? (
                <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`} className="homegear-image" />
            ) : (
                <p>No images available</p>
            )}
        </div>
    );
}

HomeGearCard.propTypes = {
    item: PropTypes.object.isRequired,
};

export default HomeGearCard;