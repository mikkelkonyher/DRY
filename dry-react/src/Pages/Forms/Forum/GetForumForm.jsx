import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import ForumCard from "./ForumCard.jsx";
import AddBoxIcon from '@mui/icons-material/AddBox';
import './GetForumForm.css'

function GetForumForm() {
    // Define API endpoint
    const apiEndpoint = `${config.apiBaseUrl}/api/Forum`;

    // State variables
    const [forums, setForums] = useState([]);
    const [users, setUsers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Fetch forum data from API
    const fetchForums = async () => {
        try {
            const url = new URL(apiEndpoint);
            url.searchParams.append('pageNumber', currentPage);
            url.searchParams.append('pageSize', itemsPerPage);

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
            setForums(sortedData);
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
            console.error('Error fetching forums or users:', error);
        }
    };

    useEffect(() => {
        fetchForums();
    }, [currentPage]);

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

    return (
        <div>
            {/* Sell button */}
            <div className="sell-button-container">
                <Link to="/CreateForum">
                    <button className="sell-button">
                        <AddBoxIcon style={{marginRight: '5px'}}/>
                        Opret nyt indlæg
                    </button>
                </Link>
            </div>
            {/* Forum list */}
            <div className="gear-list">
                {forums.map((item) => (
                    <ForumCard
                        key={item.id}
                        item={item}
                        users={users}
                        userId={userId}
                        className="forum-card"
                    />
                ))}
            </div>
            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export default GetForumForm;