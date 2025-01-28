import React from 'react';
import './SkeletonLoader.css';

function SkeletonLoader() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-price"></div>
        </div>
    );
}

export default SkeletonLoader;