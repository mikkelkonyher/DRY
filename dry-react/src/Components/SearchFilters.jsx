import React from 'react';
import PropTypes from 'prop-types';
import './SearchFilters.css';

function SearchFilters({ filters, categories, brands, models, locations, onFilterChange, onClearFilters }) {
    return (
        <div className="filters">
            <select name="type" value={filters.type} onChange={onFilterChange}>
                <option value="">Type</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
            <select name="brand" value={filters.brand} onChange={onFilterChange}>
                <option value="">Brand</option>
                {brands.map((brand) => (
                    <option key={brand} value={brand}>
                        {brand}
                    </option>
                ))}
            </select>
            <select name="model" value={filters.model} onChange={onFilterChange}>
                <option value="">Model</option>
                {models.map((model) => (
                    <option key={model} value={model}>
                        {model}
                    </option>
                ))}
            </select>
            <select name="location" value={filters.location} onChange={onFilterChange}>
                <option value="">Lokation</option>
                {locations.map((location) => (
                    <option key={location} value={location}>
                        {location}
                    </option>
                ))}
            </select>
            <select name="price" value={filters.price} onChange={onFilterChange}>
                <option value="">Pris</option>
                <option value="0-500">0-500 DKK</option>
                <option value="500-1000">500-1000 DKK</option>
                <option value="1000-5000">1000-5000 DKK</option>
                <option value="5000-10000">5000-10.000 DKK</option>
                <option value="10000-15000">10.000-15.000 DKK</option>
                <option value="15000-20000">15.000-20.000 DKK</option>
                <option value="20000-30000">20.000-30.000 DKK</option>
                <option value="30000-40000">30.000-40.000 DKK</option>
                <option value="40000-50000">40.000-50.000 DKK</option>
                <option value="50000+">50.000+ DKK</option>
            </select>
            <button className="clear-filters-button" onClick={() => {
                onClearFilters();
                window.location.reload();
            }}>
                Vis Alt
            </button>
        </div>
    );
}

SearchFilters.propTypes = {
    filters: PropTypes.object.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    brands: PropTypes.arrayOf(PropTypes.string).isRequired,
    models: PropTypes.arrayOf(PropTypes.string).isRequired,
    locations: PropTypes.arrayOf(PropTypes.string).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func.isRequired,
};

export default SearchFilters;