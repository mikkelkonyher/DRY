import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as regularThumbsUp } from '@fortawesome/free-regular-svg-icons';
import config from "../../../../config.jsx";
import './ForumCard.css';

function ForumCard({ item, userId }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item?.likeCount || 0); // Store like count in state
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId || !item) return;

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
    }, [item, userId]);

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
            setLikeCount(prevCount => (isLiked ? prevCount - 1 : prevCount + 1)); // Update like count dynamically
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleCardClick = () => {
        navigate(`/ForumDetails/${item.id}`);
    };

    return (
        <div className="forum-card" onClick={handleCardClick}>
            <div className="forum-card-content">
                <h3>{item?.subject}</h3>
                <p>{item?.body.substring(0, 100)}{item?.body.length > 100 ? '... Se mere' : ''}</p>
                <p className="info-text"><strong>Indlæg af: {item?.userName || 'Unknown User'}</strong></p>
                <p className="info-text"><strong>Oprettet: {new Date(item?.createdAt).toLocaleString()}</strong></p>
                <div className="like-container">
                    <button
                        className="like-button"
                        onClick={handleLikeClick}
                        title={isLiked ? 'Remove like' : 'Add like'}
                    >
                        <div className="like-content">
                            <FontAwesomeIcon icon={isLiked ? solidThumbsUp : regularThumbsUp} />
                            <span className="like-count">{likeCount}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

ForumCard.propTypes = {
    item: PropTypes.object.isRequired,
    userId: PropTypes.number,
};

export default ForumCard;