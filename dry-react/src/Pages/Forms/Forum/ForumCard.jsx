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
    const [likeCount, setLikeCount] = useState(item?.likeCount || 0);
    const [commentCount, setCommentCount] = useState(0);
    const [loadingLike, setLoadingLike] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!item || !userId) return;

        const fetchLikeStatus = async () => {
            try {
                const url = new URL(`${config.apiBaseUrl}/api/ForumLikes/${userId}`);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const likes = await response.json();
                const likeStatus = likes.some(like => like.forumId === item.id);
                setIsLiked(likeStatus);
            } catch (error) {
                console.error('Error fetching like status:', error);
            }
        };

        fetchLikeStatus();
    }, [item, userId]);

    useEffect(() => {
        if (!item) return;

        const fetchCommentCount = async () => {
            try {
                const countUrl = new URL(`${config.apiBaseUrl}/api/Forum/forum/${item.id}/count`);
                const response = await fetch(countUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                setCommentCount(data.commentCount);
            } catch (error) {
                console.error('Error fetching comment count:', error);
            }
        };

        fetchCommentCount();
    }, [item]);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!userId) {
            alert('Log ind for at like indlæg');
            return;
        }

        if (userId === item.userId) {
            alert('Du kan ikke like dit eget indlæg');
            return;
        }

        if (loadingLike) return;

        setLoadingLike(true);
        try {
            const url = new URL(`${config.apiBaseUrl}/api/ForumLikes`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('forumId', item.id);
            const method = isLiked ? 'DELETE' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');

            setIsLiked(!isLiked);
            setLikeCount(prevCount => (isLiked ? prevCount - 1 : prevCount + 1));
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoadingLike(false);
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
                <p className="info-text"><strong>Indlæg af: {item?.userName || 'Ukendt bruger'}</strong></p>
                <p className="info-text"><strong>Oprettet: {new Date(item?.createdAt).toLocaleString()}</strong></p>
                <p className="info-text"><strong>{commentCount} {commentCount === 1 ? 'kommentar' : 'kommentarer'}</strong></p>
                <div className="like-container">
                    <button
                        className="like-button"
                        onClick={handleLikeClick}
                        title={isLiked ? 'Fjern like' : 'Tilføj like'}
                        disabled={loadingLike}
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