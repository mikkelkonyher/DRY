import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Gear/GetGearForm.css';
import SellIcon from '@mui/icons-material/Sell';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import RehearsalRoomCard from "./RehearsalRoomCard.jsx";
import TuneIcon from '@mui/icons-material/Tune';
import Cookies from 'js-cookie';

function GetRehearsalRoom() {
    const apiEndpoint = `${config.apiBaseUrl}/api/RehearsalRoom`;
    const categories = ["Musikstudie", "Øvelokale", "andet"];

    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialPage = Number(queryParams.get('page')) || 1;
    const initialCategory = queryParams.get('category') || '';
    const initialLocation = queryParams.get('location') || '';
    const initialPriceRange = queryParams.get('priceRange') || '';
    const initialSearchQuery = queryParams.get('query') || '';

    const [rooms, setRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [noSearchResults, setNoSearchResults] = useState(false);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [userLocation, setUserLocation] = useState(initialLocation);
    const [priceRange, setPriceRange] = useState(initialPriceRange);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 16;

    const fetchRooms = async (search = false) => {
        try {
            const url = new URL(apiEndpoint);
            url.searchParams.append('pageNumber', currentPage);
            url.searchParams.append('pageSize', itemsPerPage);

            if (selectedCategory) {
                url.searchParams.append('query', selectedCategory);
            }
            if (userLocation) {
                url.searchParams.append('location', userLocation);
            }
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-').map(Number);
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

            console.log('API response:', data);

            if (!data.items) {
                throw new Error('items property is undefined');
            }

            const sortedData = data.items.sort((a, b) => b.id - a.id);
            setRooms(sortedData);
            setTotalItems(data.totalItems);
            setNoSearchResults(data.items.length === 0);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [currentPage, selectedCategory, userLocation, priceRange, searchQuery]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        if (selectedCategory) params.set('category', selectedCategory);
        if (userLocation) params.set('location', userLocation);
        if (priceRange) params.set('priceRange', priceRange);
        if (searchQuery) params.set('query', searchQuery);

        navigate(`?${params.toString()}`, { replace: true });
    }, [currentPage, selectedCategory, userLocation, priceRange, searchQuery, navigate]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    headers: {
                        'accept': '*/*',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                if (!userId) throw new Error('User ID not found');

                setUserId(userId);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchRooms(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setCurrentPage(1);
    };

    const handleToggleFavorite = async (roomId) => {
        try {
            if (!userId) throw new Error('User ID not found');

            const roomItem = rooms.find(item => item.id === roomId);
            if (!roomItem) throw new Error('Room item not found');

            if (userId === roomItem.userId) {
                alert('Du kan ikke tilføje egne produkter til favoritter');
                return;
            }

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

    return (
        <div>
            <div className="sell-button-container">
                <Link to="/CreateRehearsalRoom">
                    <button className="sell-button">
                        <SellIcon style={{ marginRight: '5px' }} />
                        Udlej øvelokale/musikstudie
                    </button>
                </Link>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
                Filtre <TuneIcon style={{ marginLeft: '5px' }} />
            </button>
            {showFilters && (
                <div className="selector-container">
                    <div className="search-bar2">
                        <input
                            type="text"
                            name="search"
                            className="search-bar2"
                            value={searchQuery}
                            onChange={handleFilterChange(setSearchQuery)}
                            placeholder="Søg efter adresse, størrelse, lokaletype etc..."
                        />
                        <button className="search-button-small" onClick={handleSearch}>Søg</button>
                    </div>
                    <div className="selector category-filter">
                        <select value={selectedCategory} onChange={handleFilterChange(setSelectedCategory)}>
                            <option value="">Alle kategorier</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="selector location-filter">
                        <select name="location" value={userLocation} onChange={handleFilterChange(setUserLocation)} required>
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
                        <select name="priceRange" value={priceRange} onChange={handleFilterChange(setPriceRange)} required>
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
            {noSearchResults && <p>Fandt ingen match</p>}
            <div className="gear-card-container">
                {rooms.map((item) => (
                    <RehearsalRoomCard
                        key={item.id}
                        item={item}
                        handleFavorite={handleToggleFavorite}
                        userId={userId}
                    />
                ))}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export default GetRehearsalRoom;