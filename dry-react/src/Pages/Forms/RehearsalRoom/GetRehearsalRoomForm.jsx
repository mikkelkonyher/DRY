import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Gear/GetGearForm.css';
import SellIcon from '@mui/icons-material/Sell';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import RehearsalRoomCard from "./RehearsalRoomCard.jsx";
import TuneIcon from '@mui/icons-material/Tune';

function GetRehearsalRoom() {
    // Define API endpoint and categories directly
    const apiEndpoint = `${config.apiBaseUrl}/api/RehearsalRoom`;
    const categories = ["Musikstudie", "Øvelokale", "andet"];

    // State variables
    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [noSearchResults] = useState(false);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [showFilters, setShowFilters] = useState(false); // State variable for filter visibility
    const itemsPerPage = 10;

    // Fetch rehearsal room data from API
    const fetchRooms = async (search = false) => {
        try {
            const url = new URL(apiEndpoint);
            url.searchParams.append('pageNumber', currentPage);
            url.searchParams.append('pageSize', itemsPerPage);
            if (location) {
                url.searchParams.append('location', location); // Append location to the URL
            }
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-').map(Number); // Split the price range and convert to numbers
                if (minPrice) {
                    url.searchParams.append('minPrice', minPrice);
                }
                if (maxPrice) {
                    url.searchParams.append('maxPrice', maxPrice);
                }
            }
            if (search && searchQuery) {
                url.searchParams.append('query', searchQuery);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            console.log('API response:', data); // Log the response to debug

            if (!data.items) {
                throw new Error('items property is undefined');
            }

            const sortedData = data.items.sort((a, b) => b.id - a.id);
            setRooms(sortedData);
            setTotalItems(data.totalItems);

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
            console.error('Error fetching rooms or users:', error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [currentPage, location, priceRange]);

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Exit if no token is found

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

    // Scroll to top when currentPage changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Handle search button click
    const handleSearch = () => {
        setCurrentPage(1); // Set current page to 1 before fetching search results
        fetchRooms(true);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle image click to open modal
    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    // Close modal
    const closeModal = () => {
        setSelectedImage(null);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle page change
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

    // Handle toggle favorite
    const handleToggleFavorite = async (roomId) => {
        try {
            if (!userId) throw new Error('User ID not found');

            // Find the room item by roomId
            const roomItem = rooms.find(item => item.id === roomId);
            if (!roomItem) throw new Error('Room item not found');

            // Prevent favoriting own created cards
            if (userId === roomItem.userId) {
                alert('Du kan ikke tilføje egne produkter til favoritter');
                return;
            }

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
            const isFavorite = favorites.some(favorite => favorite.rehearsalRoomId === roomId);

            // Toggle favorite
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('rehearsalRoomId', roomId);

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

    // Filter rooms based on selected category
    const filteredRooms = selectedCategory
        ? rooms.filter(item => item.type === selectedCategory)
        : rooms;

    return (
        <div>
            {/* Sell button */}
            <div className="sell-button-container">
                <Link to="/CreateRehearsalRoom">
                    <button className="sell-button">
                        <SellIcon style={{marginRight: '5px'}}/>
                        Udlej Øvelokale/Musikstudie
                    </button>
                </Link>
            </div>
            {/* Filter button */}
            <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
                Filtre <TuneIcon style={{marginLeft: '5px'}}/>
            </button>
            {/* Filters */}
            {showFilters && (
                <div className="selector-container">
                    <div className="search-bar2">
                        <input
                            type="text"
                            name="search"
                            className="search-bar2"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Søg efter adresse, størrelse, lokaletype etc..."
                        />
                        <button className="search-button-small" onClick={handleSearch}>Søg</button>
                    </div>
                    <div className="selector category-filter">
                        <select value={selectedCategory} onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1); // Reset to page 1 when changing the filter
                        }}>
                            <option value="">Alle kategorier</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="selector location-filter">
                        <select name="location" value={location} onChange={(e) => {
                            setLocation(e.target.value);
                            setCurrentPage(1); // Reset to page 1 when changing the filter
                        }} required>
                            <option value="">Vælg placering</option>
                            <option value="København og omegn">København og omegn</option>
                            <option value="Aarhus">Aarhus</option>
                            <option value="Odense">Odense</option>
                            <option value="Aalborg">Aalborg</option>
                            <option value="Sjælland">Sjælland</option>
                            <option value="Jylland">Jylland</option>
                            <option value="Fyn">Fyn</option>
                            <option value="Bornholm">Bornholm</option>
                            <option value="Andet">Andet</option>
                        </select>
                    </div>
                    <div className="selector price-filter">
                        <select name="priceRange" value={priceRange} onChange={(e) => {
                            setPriceRange(e.target.value);
                            setCurrentPage(1); // Reset to page 1 when changing the filter
                        }} required>
                            <option value="">Vælg pris</option>
                            <option value="0-1000">0-1000 kr.</option>
                            <option value="1000-5000">1000-5000 kr.</option>
                            <option value="5000-10000">5000-10.000 kr.</option>
                            <option value="10000-20000">10.000-20.000 kr.</option>
                            <option value="20000-40000">20.000-40.000 kr.</option>
                            <option value="40000-50000">40.000-50.000 kr.</option>
                            <option value="50000-">50.000+ kr.</option>
                        </select>
                    </div>
                </div>
            )}
            {/* No search results message */}
            {noSearchResults && <p>Fandt ingen match</p>}
            {/* Room list */}
            <div className="gear-list">
                {filteredRooms.map((item) => (
                    <RehearsalRoomCard
                        key={item.id}
                        item={item}
                        users={users}
                        handleImageClick={handleImageClick}
                        handleFavorite={handleToggleFavorite} // Pass handleToggleFavorite here
                        userId={userId}
                    />
                ))}
            </div>
            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            {/* Image modal */}
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view"/>
                </div>
            )}
        </div>
    );
}

export default GetRehearsalRoom;