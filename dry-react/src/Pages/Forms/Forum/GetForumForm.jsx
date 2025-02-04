import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import ForumCard from "./ForumCard.jsx";
import AddBoxIcon from '@mui/icons-material/AddBox';
import './GetForumForm.css';
import Cookies from 'js-cookie';

function GetForumForm() {
    const apiEndpoint = `${config.apiBaseUrl}/api/Forum`;

    const [forums, setForums] = useState([]);
    const [users, setUsers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [showLiked, setShowLiked] = useState(false);
    const [showCreated, setShowCreated] = useState(false);
    const itemsPerPage = 10;

    const fetchForums = async () => {
        try {
            let url;
            if (showLiked && userId) {
                url = new URL(`${config.apiBaseUrl}/api/Forum/liked/${userId}`);
            } else if (showCreated && userId) {
                url = new URL(`${config.apiBaseUrl}/api/Forum/user/${userId}`);
            } else {
                url = new URL(apiEndpoint);
                url.searchParams.append('pageNumber', currentPage);
                url.searchParams.append('pageSize', itemsPerPage);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            console.log('API response:', data); // Log the response to debug

            if (showLiked || showCreated) {
                setForums(data);
            } else {
                if (!data.items) {
                    throw new Error('items property is undefined');
                }
                setForums(data.items);
                setTotalItems(data.totalItems);
            }

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
        if (userId !== null) {
            fetchForums();
        }
    }, [currentPage, showLiked, showCreated, userId]);

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div>
            <div className="sell-button-container">
                <Link to="/CreateForum">
                    <button className="sell-button">
                        <AddBoxIcon style={{marginRight: '5px'}}/>
                        Opret nyt indlæg
                    </button>
                </Link>
            </div>

            <div className="filter-container">
                <label>
                    <input
                        type="checkbox"
                        checked={showLiked}
                        onChange={() => setShowLiked(!showLiked)}
                    />
                    Vis indlæg, du synes godt om
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showCreated}
                        onChange={() => setShowCreated(!showCreated)}
                    />
                    Vis indlæg, du har oprettet
                </label>
            </div>

            <div className="gear-list">
                {forums.length > 0 ? (
                    forums.map((item) => (
                        <ForumCard
                            key={item.id}
                            item={item}
                            users={users}
                            userId={userId}
                            className="forum-card"
                        />
                    ))
                ) : (
                    <p>No forums found.</p>
                )}
            </div>

            <div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default GetForumForm;