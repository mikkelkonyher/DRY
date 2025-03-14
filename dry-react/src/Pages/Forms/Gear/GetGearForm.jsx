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
    const navigate = useNavigate();
    const location = useLocation();

    // Get query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const initialPage = Number(queryParams.get('page')) || 1;
    const initialCategory = queryParams.get('category') || '';
    const initialLocation = queryParams.get('location') || '';
    const initialPriceRange = queryParams.get('priceRange') || '';
    const initialSearchQuery = queryParams.get('query') || '';

    // State variables
    const [gear, setGear] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [noSearchResults] = useState(false);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [userLocation, setUserLocation] = useState(initialLocation);
    const [priceRange, setPriceRange] = useState(initialPriceRange);
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

            // Add filters to the URL if they are set
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
        } catch (error) {
            console.error('Error fetching gear:', error);
        }
    };

    // Fetch gear data when dependencies change
    useEffect(() => {
        fetchGear();
    }, [apiEndpoint, currentPage, selectedCategory, userLocation, priceRange, searchQuery]);

    // Update the URL when filters or page change
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        if (selectedCategory) params.set('category', selectedCategory);
        if (userLocation) params.set('location', userLocation);
        if (priceRange) params.set('priceRange', priceRange);
        if (searchQuery) params.set('query', searchQuery);

        navigate(`?${params.toString()}`, { replace: true });
    }, [currentPage, selectedCategory, userLocation, priceRange, searchQuery, navigate]);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include', // This sends cookies with the request
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                setUserId(userId);
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

    // Handle filter change
    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setCurrentPage(1);
    };

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
                            onChange={handleFilterChange(setSearchQuery)}
                            placeholder="Søg efter brand, model etc."
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
                            <option value="Færøerne">Færøerne</option>
                            <option value="Grønland">Grønland</option>
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
            {/* No search results */}
            {noSearchResults && <p>Fandt ingen match</p>}
            {/* Gear List */}
            <div className="gear-card-container">
                {filteredGear.map((item) => (
                    <GearCard key={item.id} item={item} handleImageClick={() => {}} userId={userId} />
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