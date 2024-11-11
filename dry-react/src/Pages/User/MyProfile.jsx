import React, { useState, useEffect } from 'react';
import SellCard from "./SellCard.jsx";
import config from '../../../config.jsx';
import './MyProfile.css';

function MyProfile() {
    const [gear, setGear] = useState([]);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

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
        if (!userId) return;

        const fetchUserGear = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Fetch comments for each gear item
                const gearWithComments = await Promise.all(data.map(async (item) => {
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
                }));

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
                console.error('Error fetching user gear or users:', error);
            }
        };

        fetchUserGear();
    }, [userId]);

    const handleImageClick = (src) => {
        // Handle image click if needed
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

    const toggleShowAllImages = () => {
        // Implement the function to toggle showing all images
    };

    const toggleShowComments = () => {
        // Implement the function to toggle showing comments
    };

    return (
        <div className="my-profile">
            <h2>Min Profil</h2>
            <div className="gear-list">
                {gear.map((item) => (
                    <SellCard
                        key={item.id}
                        item={item}
                        users={users}
                        handleImageClick={handleImageClick}
                        handleCommentPosted={handleCommentPosted}
                        toggleShowAllImages={toggleShowAllImages}
                        toggleShowComments={toggleShowComments}
                    />
                ))}
            </div>
        </div>
    );
}

export default MyProfile;