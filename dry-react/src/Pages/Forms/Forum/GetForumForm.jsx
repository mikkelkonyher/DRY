import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import config from "../../../../config.jsx";
import Pagination from '../../../Components/Pagination.jsx';
import ForumCard from "./ForumCard.jsx";
import AddBoxIcon from '@mui/icons-material/AddBox';
import './GetForumForm.css';
import Cookies from 'js-cookie';

function GetForumForm() {
    const apiEndpoint = `${config.apiBaseUrl}/api/Forum`;

    const navigate = useNavigate();
    const location = useLocation();

    // Get page number from URL or default to 1
    const queryParams = new URLSearchParams(location.search);
    const initialPage = Number(queryParams.get('page')) || 1;

    const [forums, setForums] = useState([]);
    const [users, setUsers] = useState({});
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [userId, setUserId] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [showLiked, setShowLiked] = useState(false);
    const [showCreated, setShowCreated] = useState(false);
    const itemsPerPage = 16;

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
        fetchForums();
    }, [currentPage, showLiked, showCreated, userId]);

    // Fetch user ID from token
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

                setUserId(userId); // Set user ID
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

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