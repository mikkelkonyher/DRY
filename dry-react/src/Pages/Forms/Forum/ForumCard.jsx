import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import config from "../../../../config.jsx";
import './ForumCard.css';


function ForumCard({ item, userId, users }) {
    const [isLiked, setIsLiked] = useState(false);
    useNavigate();
    useEffect(() => {
        if (!userId) return;

        const checkLikeStatus = async () => {
            try {
                const checkUrl = new URL(`${config.apiBaseUrl}/api/ForumLikes/${userId}`);
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!checkResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const likes = await checkResponse.json();
                const likeStatus = likes.some(like => like.forumId === item.id);
                setIsLiked(likeStatus);
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };

        checkLikeStatus();
    }, [item.id, userId]);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!userId) {
            alert('Login to like posts');
            return;
        }

        if (userId === item.userId) {
            alert('You cannot like your own post');
            return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/ForumLikes`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('forumId', item.id);
            const method = isLiked ? 'DELETE' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleCardClick = () => {
        window.open(`/ForumDetails/${item.id}`, '_blank');
    };

    const userName = users[item.userId]?.name || 'Unknown User';

    return (
        <div className="forum-card" onClick={handleCardClick}>
            <h3>{item.subject}</h3>
            <p>{item.body.substring(0, 100)}{item.body.length > 100 ? '... Se mere' : ''}</p>
            <p><strong>Indlæg af: {userName}</strong></p>
            <p><strong>Oprettet: {new Date(item.createdAt).toLocaleString()}</strong></p>
            <p><ThumbUpIcon/> {item.likeCount}</p>

            <div className="like-container">
                <button
                    className="like-button"
                    onClick={handleLikeClick}
                    title={isLiked ? 'Remove like' : 'Add like'}
                >
                    {isLiked ? <ThumbUpIcon/> : <ThumbUpOutlinedIcon/>}
                </button>
            </div>
        </div>
    );
}

ForumCard.propTypes = {
    item: PropTypes.object.isRequired,
    userId: PropTypes.number, // Make userId optional
    users: PropTypes.object.isRequired, // Add users prop
};

export default ForumCard;