import React, { useEffect, useState } from 'react';
import './GetGuitar.css';

function GetGuitar() {
    const [guitars, setGuitars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [types, setTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [showAllImages, setShowAllImages] = useState({});
    const [filters, setFilters] = useState({
        type: '',
        brand: '',
        model: '',
        location: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchGuitars = async () => {
            try {
                const response = await fetch('https://localhost:7064/api/Guitar');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGuitars(data);

                // Extract unique values from the fetched guitar data
                const uniqueBrands = [...new Set(data.map(guitar => guitar.brand))];
                const uniqueModels = [...new Set(data.map(guitar => guitar.model))];
                const uniqueTypes = [...new Set(data.map(guitar => guitar.guitarType))];
                const uniqueLocations = [...new Set(data.map(guitar => guitar.location))];

                setBrands(uniqueBrands);
                setModels(uniqueModels);
                setTypes(uniqueTypes);
                setLocations(uniqueLocations);
            } catch (error) {
                console.error('Error fetching guitars:', error);
            }
        };

        fetchGuitars();
    }, []);

    const toggleShowAllImages = (id) => {
        setShowAllImages((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredGuitars = guitars.filter((guitar) => {
        const matchesFilters = (
            (filters.type === '' || guitar.guitarType.includes(filters.type)) &&
            (filters.brand === '' || guitar.brand.includes(filters.brand)) &&
            (filters.model === '' || guitar.model.includes(filters.model)) &&
            (filters.location === '' || guitar.location.includes(filters.location))
        );

        const matchesSearchQuery = (
            guitar.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitar.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitar.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matchesFilters && matchesSearchQuery;
    });

    return (
        <div>
            <div className="filters">
                <input
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                />
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Type</option>
                    {types.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Brand</option>
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
                <select
                    name="model"
                    value={filters.model}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Model</option>
                    {models.map((model) => (
                        <option key={model} value={model}>
                            {model}
                        </option>
                    ))}
                </select>
                <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Location</option>
                    {locations.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
            </div>
            <div className="guitar-list">
                {filteredGuitars.map((guitar) => (
                    <div key={guitar.id} className="guitar-card">
                        {showAllImages[guitar.id] ? (
                            guitar.imagePaths.map((imagePath, index) => (
                                <img key={index} src={imagePath} alt={`${guitar.brand} ${guitar.model}`}
                                     className="guitar-image"/>
                            ))
                        ) : (
                            <img src={guitar.imagePaths[0]} alt={`${guitar.brand} ${guitar.model}`}
                                 className="guitar-image"/>
                        )}
                        <button onClick={() => toggleShowAllImages(guitar.id)}>
                            {showAllImages[guitar.id] ? 'Show Less' : 'Show All Images'}
                        </button>
                        <h3>{guitar.brand} {guitar.model}</h3>
                        <p>{guitar.description}</p>
                        <p><strong>Pris: </strong>{guitar.price} DKK</p>
                        <p><strong>Lokation:</strong> {guitar.location}</p>
                        <p><strong>Stand:</strong> {guitar.condition}</p>
                        <p><strong>År:</strong> {guitar.year}</p>
                        <p><strong>Type: </strong>{guitar.guitarType}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GetGuitar;