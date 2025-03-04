import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './GetGearForm.css';
import SellIcon from '@mui/icons-material/Sell';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import GearCard from "./GearCard.jsx";
import TuneIcon from '@mui/icons-material/Tune';
import Cookies from 'js-cookie';

function GetGearForm({ gearType, apiEndpoint, gearTypeKey, categories }) {
    // State variables
    const navigate = useNavigate();
    const location = useLocation();

    // Get page number from URL or default to 1
    const queryParams = new URLSearchParams(location.search);
    const initialPage = Number(queryParams.get('page')) || 1;

    const [gear, setGear] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [noSearchResults] = useState(false);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 16;

    // Determine the path for selling gear
    const sellGearPath = gearType === "trommer"
        ? "/SellDrumsGear"
        : gearType === "studiegear"
            ? "/SellStudioGear"
            : gearType === "keys"
                ? "/SellKeysGear"
                : gearType === "strygere"
                    ? "/SellStringsGear"
                    : gearType === "blæseinstrumenter"
                        ? "/SellHornsGear"
                        : "/SellGuiBassGear";

    // Fetch gear data from API
    const fetchGear = async (search = false) => {
        try {
            const url = new URL(apiEndpoint);
            url.searchParams.append('pageNumber', currentPage);
            url.searchParams.append('pageSize', itemsPerPage);
            if (selectedCategory) {
                url.searchParams.append(gearTypeKey, selectedCategory);
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
            setGear(sortedData);
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
            console.error('Error fetching gear or users:', error);
        }
    };

    // Fetch gear data when dependencies change
    useEffect(() => {
        fetchGear();
    }, [apiEndpoint, currentPage, selectedCategory, userLocation, priceRange]);

    useEffect(() => {
        // Update the URL when page changes
        const params = new URLSearchParams(location.search);
        params.set('page', currentPage);
        navigate(`?${params.toString()}`, { replace: true });
    }, [currentPage, navigate]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
                if (!token) return;

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
        setCurrentPage(1);
        fetchGear(true);
    };

    // Filter gear based on selected category
    const filteredGear = selectedCategory
        ? gear.filter(item => item[gearTypeKey] === selectedCategory)
        : gear;

    return (
        <div>
            {/* Sell button */}
            <div className="sell-button-container">
                <Link to={sellGearPath}>
                    <button className="sell-button">
                        <SellIcon style={{ marginRight: '5px' }} />
                        Sælg {gearType}
                    </button>
                </Link>
            </div>
            {/* Filter button */}
            <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
                Filtre <TuneIcon style={{ marginLeft: '5px' }} />
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Søg efter brand, model etc."
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
                        <select name="location" value={userLocation} onChange={(e) => {
                            setUserLocation(e.target.value);
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
                            <option value="Færøerne">Færøerne</option>
                            <option value="Grønland">Grønland</option>
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
            {/* No search results */}
            {noSearchResults && <p>Fandt ingen match</p>}
            {/* Gear List */}
            <div className="gear-card-container">
                {filteredGear.map((item) => (
                    <GearCard key={item.id} item={item} users={users} handleImageClick={() => {}} userId={userId} />
                ))}
            </div>
            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} onPageChange={handlePageChange} />
        </div>
    );
}

GetGearForm.propTypes = {
    gearType: PropTypes.string.isRequired,
    apiEndpoint: PropTypes.string.isRequired,
    gearTypeKey: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
};

export default GetGearForm;