import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './GetGearForm.css';
import SellIcon from '@mui/icons-material/Sell';
import config from "../../../config.jsx";
import Pagination from '../../Components/Pagination.jsx';
import GearCard from "./GearCard.jsx";

function GetGearForm({ gearType, apiEndpoint, gearData = [], gearTypeKey, categories }) {
    const [gear, setGear] = useState(gearData);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [noSearchResults, setNoSearchResults] = useState(false);
    const [userId, setUserId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchGear = async () => {
            try {
                const response = await fetch(apiEndpoint);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                const sortedData = data.sort((a, b) => b.id - a.id);

                const commentsPromises = sortedData.map(async (item) => {
                    try {
                        const commentsResponse = await fetch(`${config.apiBaseUrl}/api/Comment/api/MusicGear/${item.id}/comments`);
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

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`);
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
                console.error('Error fetching gear or users:', error);
            }
        };

        fetchGear();
    }, [apiEndpoint]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub;
                if (!email) throw new Error('Email not found in token');

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch users');

                const users = await userResponse.json();
                const user = users.find(user => user.email === email);
                if (!user) throw new Error('User not found');

                setUserId(user.id);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const fetchSearchResults = async () => {
        try {
            const url = new URL(`${apiEndpoint}/search`);
            url.searchParams.append('query', searchQuery);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            const commentsPromises = data.map(async (item) => {
                try {
                    const commentsResponse = await fetch(`${config.apiBaseUrl}/api/Comment/api/MusicGear/${item.id}/comments`);
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
            setNoSearchResults(gearWithComments.length === 0);
            setCurrentPage(1); // Reset pagination to page 1
        } catch (error) {
            console.error('Error fetching search results:', error);
            setNoSearchResults(true);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handlePriceRangeChange = (e) => {
        setSelectedPriceRange(e.target.value);
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleLocationChange = (e) => {
        setSelectedLocation(e.target.value);
        setCurrentPage(1); // Reset pagination to page 1
    };

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const filteredGear = gear.filter(item => {
        const matchesCategory = selectedCategory ? item[gearTypeKey] === selectedCategory : true;
        const matchesPrice = selectedPriceRange ? (
            selectedPriceRange === '50000+' ? item.price >= 50000 :
                item.price >= parseInt(selectedPriceRange.split('-')[0]) && item.price <= parseInt(selectedPriceRange.split('-')[1])
        ) : true;
        const matchesLocation = selectedLocation ? item.location === selectedLocation : true;
        return matchesCategory && matchesPrice && matchesLocation;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGear.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredGear.length / itemsPerPage);

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            let newPage = prevPage;
            if (direction === 'prev' && prevPage > 1) {
                newPage = prevPage - 1;
            } else if (direction === 'next' && prevPage < totalPages) {
                newPage = prevPage + 1;
            }
            return newPage;
        });
    };

    const handleCommentPosted = async (gearId) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/api/MusicGear/${gearId}/comments`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const commentsData = await response.json();
            setGear((prevGear) =>
                prevGear.map((item) =>
                    item.id === gearId ? { ...item, comments: commentsData } : item
                )
            );
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleToggleFavorite = async (gearId) => {
        try {
            if (!userId) throw new Error('User ID not found');

            // Check if the item is already a favorite
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
            const isFavorite = favorites.some(favorite => favorite.musicGearId === gearId);

            // Toggle favorite
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('musicGearId', gearId);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseBody = await response.text();
            const favoriteData = responseBody ? JSON.parse(responseBody) : {};
            console.log(isFavorite ? 'Favorite removed:' : 'Favorite added:', favoriteData);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const sellGearPath = gearType === "Trommeudstyr" ? "/SellDrumsGear" : "/SellGuiBassGear";

    return (
        <div>
            <div className="sell-button-container">
                <Link to={sellGearPath}>
                    <button className="sell-button">
                        <SellIcon style={{marginRight: '5px'}}/>
                        Sælg {gearType}
                    </button>
                </Link>
            </div>
            <div className="search-bar2">
                <input
                    type="text"
                    name="search"
                    className="search-bar2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Søg efter brand, model etc..."
                />
                <button className="search-button-small" onClick={fetchSearchResults}>Søg</button>
            </div>
            <div className="selector-container">
                <div className="selector">
                    <select value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="">Alle kategorier</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="selector">
                    <select value={selectedPriceRange} onChange={handlePriceRangeChange}>
                        <option value="">Alle priser</option>
                        <option value="0-1000">0-1000 kr.</option>
                        <option value="1000-5000">1000-5000 kr.</option>
                        <option value="5000-10000">5000-10.000 kr.</option>
                        <option value="10000-20000">10.000-20.000 kr.</option>
                        <option value="20000-50000">20.000-50.000 kr.</option>
                        <option value="50000+">50.000+ kr.</option>
                    </select>
                </div>
                <div className="selector">
                    <select value={selectedLocation} onChange={handleLocationChange}>
                        <option value="">Vælg placering</option>
                        <option value="København og omegn">København og omegn</option>
                        <option value="Aarhus">Aarhus</option>
                        <option value="Odense">Odense</option>
                        <option value="Aalborg">Aalborg</option>
                        <option value="Sjælland">Sjælland</option>
                        <option value="Jylland">Jylland</option>
                        <option value="Fyn">Fyn</option>
                        <option value="Bornholm">Bornholm</option>
                        <option value="Færøerne">Færøerne</option>
                        <option value="Grønland">Grønland</option>
                        <option value="Andet">Andet</option>
                    </select>
                </div>
            </div>
            {noSearchResults && <p>Fandt ingen match</p>}
            <div className="gear-list">
                {currentItems.map((item) => (
                    <GearCard
                        key={item.id}
                        item={item}
                        users={users}
                        handleImageClick={handleImageClick}
                        handleCommentPosted={handleCommentPosted}
                        gearTypeKey={gearTypeKey} // Pass gearTypeKey here
                        handleFavorite={handleToggleFavorite} // Pass handleToggleFavorite here
                        userId={userId}
                    />
                ))}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view"/>
                </div>
            )}
        </div>
    );
}

GetGearForm.propTypes = {
    gearType: PropTypes.string.isRequired,
    apiEndpoint: PropTypes.string.isRequired,
    gearData: PropTypes.array,
    gearTypeKey: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
};

export default GetGearForm;