import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './GetGearForm.css';

function GetGearForm({ gearType, apiEndpoint, categories, gearData = [], gearTypeKey }) {
    const [gear, setGear] = useState(gearData);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [locations, setLocations] = useState([]);
    const [showAllImages, setShowAllImages] = useState({});
    const [showComments, setShowComments] = useState({});
    const [filters, setFilters] = useState({
        type: '',
        brand: '',
        model: '',
        location: '',
        price: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const response = await fetch(apiEndpoint);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                const sortedData = data.sort((a, b) => b.id - a.id);
                setGear(sortedData);

                const uniqueBrands = [...new Set(data.map(item => item.brand))];
                const uniqueModels = [...new Set(data.map(item => item.model))];
                const uniqueLocations = [...new Set(data.map(item => item.location))];

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

                const commentsPromises = sortedData.map(async (item) => {
                    try {
                        const commentsResponse = await fetch(`https://localhost:7064/api/Comment/api/MusicGear/${item.id}/comments`);
                        if (!commentsResponse.ok) {
                            return { ...item, comments: [] };
                        }
                        const commentsData = await commentsResponse.json();
                        return { ...item, comments: commentsData };
                    } catch (error) {
                        console.error(error);
                        return { ...item, comments: [] };
                    }
                });

                const gearWithComments = await Promise.all(commentsPromises);
                setGear(gearWithComments);
            } catch (error) {
                console.error('Error fetching gear or users:', error);
            }
        };

        fetchGear();
    }, [apiEndpoint]);

    const toggleShowAllImages = (id) => {
        setShowAllImages((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const toggleShowComments = (id) => {
        setShowComments((prevState) => ({
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

    const clearFilters = () => {
        setFilters({
            type: '',
            brand: '',
            model: '',
            location: '',
            price: ''
        });
        setSearchQuery('');
    };

    const filteredGear = gear.filter((item) => {
        const matchesFilters = (
            (filters.type === '' || item[gearTypeKey]?.includes(filters.type)) &&
            (filters.brand === '' || item?.brand?.includes(filters.brand)) &&
            (filters.model === '' || item?.model?.includes(filters.model)) &&
            (filters.location === '' || item?.location?.includes(filters.location)) &&
            (filters.price === '' || (
                filters.price === '0-500' && item.price <= 500 ||
                filters.price === '500-1000' && item.price > 500 && item.price <= 1000 ||
                filters.price === '1000-5000' && item.price > 1000 && item.price <= 5000 ||
                filters.price === '5000-10000' && item.price > 5000 && item.price <= 10000 ||
                filters.price === '10000-15000' && item.price > 10000 && item.price <= 15000 ||
                filters.price === '15000-20000' && item.price > 15000 && item.price <= 20000 ||
                filters.price === '20000-30000' && item.price > 20000 && item.price <= 30000 ||
                filters.price === '30000-40000' && item.price > 30000 && item.price <= 40000 ||
                filters.price === '40000-50000' && item.price > 40000 && item.price <= 50000 ||
                filters.price === '50000+' && item.price > 50000
            ))
        );

        const searchKeywords = searchQuery.toLowerCase().split(' ');
        const matchesSearchQuery = searchKeywords.every(keyword =>
            item?.brand?.toLowerCase().includes(keyword) ||
            item?.model?.toLowerCase().includes(keyword) ||
            item?.description?.toLowerCase().includes(keyword) ||
            item?.location?.toLowerCase().includes(keyword)
        );

        return matchesFilters && matchesSearchQuery;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGear.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredGear.length / itemsPerPage);

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

    const sellGearPath = gearType === "Trommeudstyr" ? "/SellDrumsGear" : "/SellGuiBassGear";

    return (
        <div>
            <div className="sell-button-container">
                <Link to={sellGearPath}>
                    <button className="sell-button">Sælg {gearType}</button>
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
                    <option value="">Vælg {gearType} kategori</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
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
                <select
                    name="price"
                    value={filters.price}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Price</option>
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
                <button onClick={clearFilters}>Clear Filters</button>
            </div>
            <div className="gear-list">
                {currentItems.map((item) => (
                    <div key={item.id} className="gear-card">
                        {showAllImages[item.id] ? (
                            item.imagePaths.map((imagePath, index) => (
                                <img key={index} src={imagePath} alt={`${item.brand} ${item.model}`}
                                     className="gear-image" onClick={() => handleImageClick(imagePath)} />
                            ))
                        ) : (
                            <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`}
                                 className="gear-image" onClick={() => handleImageClick(item.imagePaths[0])} />
                        )}
                        <button className="toggle-images-button" onClick={() => toggleShowAllImages(item.id)}>
                            {showAllImages[item.id] ? 'Vis Mindre' : 'Vis Alle Billeder'}
                        </button>
                        <h3>{item.brand} {item.model}</h3>
                        <p>{item.description}</p>
                        <p><strong>Pris: </strong>{item.price} DKK</p>
                        <p><strong>Lokation:</strong> {item.location}</p>
                        <p><strong>Stand:</strong> {item.condition}</p>
                        <p><strong>År:</strong> {item.year}</p>
                        <p><strong>Type: </strong>{item[gearTypeKey]}</p>
                        <p><strong>Sælger:</strong> {users[item.userId]?.name || 'Ukendt'}</p>
                        <button onClick={() => alert(`Skriv til sælger: ${users[item.userId]?.email || 'Ukendt'}`)}>
                            Skriv til sælger
                        </button>
                        <div className="comments-section">
                            <button className="show-comments-button" onClick={() => toggleShowComments(item.id)}>
                                {showComments[item.id] ? 'Skjul kommentarer' : 'Se kommentarer'}
                            </button>
                            {showComments[item.id] && (
                                <>
                                    <h4>Kommentarer:</h4>
                                    {item.comments && item.comments.length > 0 ? (
                                        item.comments.map((comment) => (
                                            <div key={comment.id} className="comment">
                                                <p><strong>{comment.user?.name || 'Ukendt'}:</strong> {comment.text}</p>
                                                <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Ingen kommentarer.</p>
                                    )}
                                </>
                            )}
                        </div>
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

GetGearForm.propTypes = {
    gearType: PropTypes.string.isRequired,
    apiEndpoint: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    gearData: PropTypes.array,
    gearTypeKey: PropTypes.string.isRequired,
};

export default GetGearForm;