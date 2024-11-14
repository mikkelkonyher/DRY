// src/Pages/Forms/GetGearForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './GetGearForm.css';
import SellIcon from '@mui/icons-material/Sell';
import config from "../../../config.jsx";
import Pagination from '../../Components/Pagination.jsx';
import GearCard from "./GearCard.jsx";

function GetGearForm({ gearType, apiEndpoint, gearData = [], gearTypeKey }) {
    const [gear, setGear] = useState(gearData);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [noSearchResults, setNoSearchResults] = useState(false);
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

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = gear.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(gear.length / itemsPerPage);

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

    const sellGearPath = gearType === "Trommeudstyr" ? "/SellDrumsGear" : "/SellGuiBassGear";

    return (
        <div>
            <div className="sell-button-container">
                <Link to={sellGearPath}>
                    <button className="sell-button">
                        <SellIcon style={{ marginRight: '5px' }} />
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
                    <img className="modal-content" src={selectedImage} alt="Large view" />
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
};

export default GetGearForm;