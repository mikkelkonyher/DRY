import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import GearCard from "../Forms/GearCard.jsx"; // Adjust the import path as necessary
import Pagination from '../../Components/Pagination.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import config from "../../../config.jsx";
import './SearchResults.css';

function SearchResults() {
    const location = useLocation();
    const [gear, setGear] = useState(location.state?.searchResults || []);
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [errorMessage, setErrorMessage] = useState(location.state?.errorMessage || '');
    const itemsPerPage = 10;

    const fetchGear = async (pageNumber = 1) => {
        try {
            const searchQuery = location.state?.searchQuery || '';
            const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/search?query=${searchQuery}&pageNumber=${pageNumber}&pageSize=${itemsPerPage}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setGear(data.items);
            setTotalItems(data.totalItems);
            setErrorMessage(data.items.length === 0 ? 'No results found.' : '');

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
        }
    };

    useEffect(() => {
        if (location.state?.searchQuery) {
            fetchGear(currentPage);
        }
    }, [location.state, currentPage]);

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

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

    return (
        <Box className="search-results-container" sx={{ padding: '20px' }}>
            <Typography className="search-results-title" variant="h5" sx={{ marginBottom: '20px', marginTop: '20px' }}>
                Søge resultater:
            </Typography>
            {errorMessage ? (
                <Typography className="error-message" variant="h6" sx={{ color: 'red' }}>
                    {errorMessage}
                </Typography>
            ) : (
                <Box className="search-results-list" sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {gear.length > 0 ? (
                        gear.map((item) => (
                            <GearCard
                                key={item.id}
                                item={item}
                                users={users}
                                handleImageClick={handleImageClick}
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