import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import GearCard from "../Forms/Gear/GearCard.jsx"; // Adjust the import path as necessary
import Pagination from '../../Components/Pagination.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import config from "../../../config.jsx";
import Cookies from 'js-cookie';
import './SearchResults.css';

function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get search query and page number from URL or state
    const queryParams = new URLSearchParams(location.search);
    const searchQueryFromURL = queryParams.get('query') || '';
    const searchQuery = location.state?.searchQuery || searchQueryFromURL;
    const initialPage = Number(queryParams.get('page')) || 1;

    const [gear, setGear] = useState(location.state?.searchResults || []);
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalItems, setTotalItems] = useState(0);
    const [errorMessage, setErrorMessage] = useState(location.state?.errorMessage || '');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 16;

    const fetchGear = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${config.apiBaseUrl}/api/MusicGear/search?query=${encodeURIComponent(searchQuery)}&pageNumber=${pageNumber}&pageSize=${itemsPerPage}`
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setGear(data.items);
            setTotalItems(data.totalItems);
            setErrorMessage(data.items.length === 0 ? 'Fandt ingen match på søgning' : '');

            // Fetch users for gear cards
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
            setErrorMessage('Fandt ingen match på søgning.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            fetchGear(currentPage);
        }
    }, [searchQuery, currentPage]);

    useEffect(() => {
        // Update the URL when page changes
        const params = new URLSearchParams(location.search);
        params.set('page', currentPage);
        navigate(`?${params.toString()}`, { replace: true });
    }, [currentPage, navigate]);

    useEffect(() => {
        // Set the initial page number in the URL if not present
        if (!queryParams.get('page')) {
            queryParams.set('page', initialPage);
            navigate(`?${queryParams.toString()}`, { replace: true });
        }
    }, [initialPage, navigate, queryParams]);

    // Fetch user ID
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

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleToggleFavorite = async (gearId) => {
        try {
            if (!userId) throw new Error('User ID not found');

            const gearItem = gear.find((item) => item.id === gearId);
            if (!gearItem) throw new Error('Gear item not found');

            if (userId === gearItem.userId) {
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
            const isFavorite = favorites.some((favorite) => favorite.musicGearId === gearId);

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

    return (
        <Box className="search-results-container" sx={{ padding: '20px' }}>
            <Typography className="search-results-title" variant="h5" sx={{ marginBottom: '20px', marginTop: '20px', textAlign: 'center' }}>
                Søgeresultater:
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : errorMessage ? (
                <Typography className="error-message" variant="h6" sx={{ color: 'red' }}>
                    {errorMessage}
                </Typography>
            ) : (
                <Box className="gear-card-container">
                    {gear.length > 0 ? (
                        gear.map((item) => (
                            <GearCard
                                key={item.id}
                                item={item}
                                users={users}
                                handleImageClick={handleImageClick}
                                handleFavorite={handleToggleFavorite}
                                userId={userId}
                            />
                        ))
                    ) : (
                        <Typography className="no-results-message" variant="h6">
                            No results found.
                        </Typography>
                    )}
                </Box>
            )}
            <Pagination
                className="pagination"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view" />
                </div>
            )}
        </Box>
    );
}

SearchResults.propTypes = {
    searchResults: PropTypes.array,
};

export default SearchResults;