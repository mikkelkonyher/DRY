import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './GetGuiBassGear.css';

function GetGuitBassGear() {
    const [guitBassGear, setGuitBassGear] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [locations, setLocations] = useState([]);
    const [showAllImages, setShowAllImages] = useState({});
    const [filters, setFilters] = useState({
        type: '', // Corrected filter type
        brand: '',
        model: '',
        location: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchGuiBassGears = async () => {
            try {
                const response = await fetch('https://localhost:7064/api/GuitBassGear');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Sort guitBassGear by Id in descending order
                const sortedData = data.sort((a, b) => b.id - a.id);
                setGuitBassGear(sortedData);

                const uniqueBrands = [...new Set(data.map(guiBassGear => guiBassGear.brand))];
                const uniqueModels = [...new Set(data.map(guiBassGear => guiBassGear.model))];
                const uniqueTypes = [...new Set(data.map(guiBassGear => guiBassGear.guitBassType))];
                const uniqueLocations = [...new Set(data.map(guiBassGear => guiBassGear.location))];

                setBrands(uniqueBrands);
                setModels(uniqueModels);
                setLocations(uniqueLocations);

                const userResponse = await fetch('https://localhost:7064/api/User');
                if (!userResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await userResponse.json();
                const userMap = userData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);
            } catch (error) {
                console.error('Error fetching guitBassGear or users:', error);
            }
        };

        fetchGuiBassGears();
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

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const filteredGuiBassGears = guitBassGear.filter((guitBassGear) => {
        const matchesFilters = (
            (filters.type === '' || guitBassGear?.guitBassType?.includes(filters.type)) &&
            (filters.brand === '' || guitBassGear?.brand?.includes(filters.brand)) &&
            (filters.model === '' || guitBassGear?.model?.includes(filters.model)) &&
            (filters.location === '' || guitBassGear?.location?.includes(filters.location))
        );

        const matchesSearchQuery = (
            guitBassGear?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitBassGear?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitBassGear?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guitBassGear?.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matchesFilters && matchesSearchQuery;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGuiBassGears.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredGuiBassGears.length / itemsPerPage);

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            if (direction === 'prev' && prevPage > 1) {
                return prevPage - 1;
            } else if (direction === 'next' && prevPage < totalPages) {
                return prevPage + 1;
            }
            return prevPage;
        });
    };

    return (
        <div>
            <div className="sell-button-container">
                <Link to="/SellGuiBassGear">
                    <button className="sell-button">Sælg Guit/bass udstyr</button>
                </Link>
            </div>
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
                    <option value="">Vælg Guitarkategori</option>
                    <option value="Elektrisk Guitar">Elektrisk Guitar</option>
                    <option value="Akustisk Guitar">Akustisk Guitar</option>
                    <option value="Semi-Hollow Guitar">Semi-Hollow Guitar</option>
                    <option value="Guitarforstærker">Guitarforstærker</option>
                    <option value="Effekt Pedal">Effekt Pedal</option>
                    <option value="Tilbehør til Guitar">Tilbehør til Guitar</option>
                    <option value="Elektrisk Bas">Elektrisk Bas</option>
                    <option value="Akustisk Bas">Akustisk Bas</option>
                    <option value="Kontrabas">Contrabas</option>
                    <option value="Basforstærker">Basforstærker</option>
                    <option value="Tilbehør til Bas">Tilbehør til Bas</option>
                    <option value="Andet">Andet</option>
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
                {currentItems.map((guitBassGear) => (
                    <div key={guitBassGear.id} className="guitar-card">
                        {showAllImages[guitBassGear.id] ? (
                            guitBassGear.imagePaths.map((imagePath, index) => (
                                <img key={index} src={imagePath} alt={`${guitBassGear.brand} ${guitBassGear.model}`}
                                     className="guitar-image" onClick={() => handleImageClick(imagePath)} />
                            ))
                        ) : (
                            <img src={guitBassGear.imagePaths[0]} alt={`${guitBassGear.brand} ${guitBassGear.model}`}
                                 className="guitar-image" onClick={() => handleImageClick(guitBassGear.imagePaths[0])} />
                        )}
                        <button className="toggle-images-button" onClick={() => toggleShowAllImages(guitBassGear.id)}>
                            {showAllImages[guitBassGear.id] ? 'Show Less' : 'Show All Images'}
                        </button>
                        <h3>{guitBassGear.brand} {guitBassGear.model}</h3>
                        <p>{guitBassGear.description}</p>
                        <p><strong>Pris: </strong>{guitBassGear.price} DKK</p>
                        <p><strong>Lokation:</strong> {guitBassGear.location}</p>
                        <p><strong>Stand:</strong> {guitBassGear.condition}</p>
                        <p><strong>År:</strong> {guitBassGear.year}</p>
                        <p><strong>Type: </strong>{guitBassGear.guitBassType}</p>
                        <p><strong>Sælger:</strong> {users[guitBassGear.userId]?.name || 'Ukendt'}</p>
                        <button onClick={() => alert(`Skriv til sælger: ${users[guitBassGear.userId]?.email || 'Ukendt'}`)}>
                            Skriv til sælger
                        </button>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                >
                    &larr;
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                >
                    &rarr;
                </button>
            </div>
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view" />
                </div>
            )}
        </div>
    );
}

export default GetGuitBassGear;