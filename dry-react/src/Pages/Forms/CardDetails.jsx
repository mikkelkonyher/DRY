import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import PostComment from "../../Components/PostComments.jsx";
import config from "../../../config.jsx";

function CardDetails() {
    const { id } = useParams();
    const [gearItem, setGearItem] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
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
        const fetchGearItem = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/${id}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setGearItem(data);

                const commentsResponse = await fetch(`${config.apiBaseUrl}/api/Comment/api/MusicGear/${id}/comments`);
                if (!commentsResponse.ok) throw new Error('Network response was not ok');
                const commentsData = await commentsResponse.json();
                setGearItem(prevItem => ({ ...prevItem, comments: commentsData }));

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`);
                if (!userResponse.ok) throw new Error('Network response was not ok');
                const userData = await userResponse.json();
                const userMap = userData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);

                if (userId) {
                    const checkUrl = new URL(`${config.apiBaseUrl}/api/Favorites/${userId}`);
                    const checkResponse = await fetch(checkUrl, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!checkResponse.ok) throw new Error('Network response was not ok');
                    const favorites = await checkResponse.json();
                    const favoriteStatus = favorites.some(favorite => favorite.musicGearId === data.id);
                    setIsFavorite(favoriteStatus);
                }
            } catch (error) {
                console.error('Error fetching gear item:', error);
            }
        };

        fetchGearItem();
    }, [id, userId]);

    const handleFavoriteClick = async () => {
        if (!userId) {
            alert('Login for at tilføje favoritter');
            return;
        }

        if (userId === gearItem.userId) {
            alert('Du kan ikke tilføje dit eget produkt til favoritter');
            return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('musicGearId', id);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gearItem.imagePaths.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + gearItem.imagePaths.length) % gearItem.imagePaths.length);
    };

    const handleCommentPosted = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/api/MusicGear/${id}/comments`);
            if (!response.ok) throw new Error('Network response was not ok');
            const commentsData = await response.json();
            setGearItem(prevItem => ({ ...prevItem, comments: commentsData }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    if (!gearItem) return <div>Loading...</div>;

    return (
        <div className="gear-card">
            <h3>{gearItem.brand} {gearItem.model}</h3>
            <h4><strong>Pris: </strong>{gearItem.price} kr. </h4>

            <div className="image-container">
                <button className="favorite-button" onClick={handleFavoriteClick}>
                    <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart} />
                </button>
                <button className="nav-button left" onClick={handlePrevImage}>&lt;</button>
                <img src={gearItem.imagePaths[currentImageIndex]} alt={`${gearItem.brand} ${gearItem.model}`}
                     className="gear-image" />
                <button className="nav-button right" onClick={handleNextImage}>&gt;</button>
            </div>

            <div className="more-info-container">
                <p>{gearItem.description}</p>
                <p><strong>Lokation:</strong> {gearItem.location}</p>
                <p><strong>Stand:</strong> {gearItem.condition}</p>
                <p><strong>År:</strong> {gearItem.year}</p>
                <p><strong>Sælger:</strong> {users[gearItem.userId]?.name || 'Ukendt'}</p>
                <p><strong>Oprettet:</strong> {new Date(gearItem.listingDate).toLocaleDateString()}</p>
            </div>

            <button onClick={() => alert(`Skriv til sælger: ${users[gearItem.userId]?.email || 'Ukendt'}`)}>
                Skriv til sælger
            </button>
            <div className="comments-section">
                <button className="show-comments-button" onClick={() => setShowComments(!showComments)}>
                    {showComments ? 'Skjul kommentarer' : 'Kommenter'}
                </button>
                {showComments && (
                    <>
                        <h4>Kommentarer:</h4>
                        {gearItem.comments && gearItem.comments.length > 0 ? (
                            gearItem.comments
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p><strong>{comment.user?.name || 'Ukendt'}:</strong> {comment.text}</p>
                                        <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                    </div>
                                ))
                        ) : (
                            <p>Ingen kommentarer.</p>
                        )}
                        <PostComment gearId={gearItem.id} onCommentPosted={handleCommentPosted} />
                    </>
                )}
            </div>
        </div>
    );
}

CardDetails.propTypes = {
    userId: PropTypes.number,
};

export default CardDetails;