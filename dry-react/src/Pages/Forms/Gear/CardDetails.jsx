import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import PostComment from "../../../Components/PostComments.jsx";
import MessageToCard from "../../MessageSystem/MessageToCard.jsx";
import config from "../../../../config.jsx";
import './CardDetails.css';
import Cookies from 'js-cookie';

function CardDetails() {
    const { id } = useParams();
    const [gearItem, setGearItem] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1])); // Decode token payload
                const email = payload.sub; // Extract email from payload
                if (!email) throw new Error('Email not found in token');

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, {
                    headers: {
                        'accept': 'application/json',// Specify JSON response
                        'Authorization': `Bearer ${token}`// Add token to headers
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch users');

                const users = await userResponse.json();
                const user = users.find(user => user.email === email); // Find user by email
                if (!user) throw new Error('User not found');

                setUserId(user.id); // Set user ID
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    // Fetch gear item and related data
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

    // Handle favorite button click
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

    // Handle image navigation
    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gearItem.imagePaths.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + gearItem.imagePaths.length) % gearItem.imagePaths.length);
    };

    // Handle image click to open modal
    const handleImageClick = (imagePath) => {
        setSelectedImage(imagePath);
        setIsModalOpen(true);
    };

    // Handle comment posted
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

// Handle comment deletion
    const handleDeleteComment = async (commentId) => {
        const isConfirmed = window.confirm("Er du sikker på at du vil slette denne kommentar?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Cookies.get('AuthToken')}` },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setGearItem(prevItem => ({
                ...prevItem,
                comments: prevItem.comments.filter(comment => comment.id !== commentId)
            }));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (!gearItem) return <div>Loading...</div>;

    return (
        <div className="gear-carddetails">
            {/* Gear item details */}
            <h4>{gearItem.brand} {gearItem.model}</h4>
            <h5><strong>Pris: </strong>{gearItem.price} kr. </h5>

            {/* Image carousel */}
            <div className="image-container">
                <button
                    className="favorite-button"
                    onClick={handleFavoriteClick}
                    title={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
                >
                    <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart} />
                </button>
                <button className="nav-button left" onClick={handlePrevImage}>&lt;</button>
                <img src={gearItem.imagePaths[currentImageIndex]} alt={`${gearItem.brand} ${gearItem.model}`}
                     className="gear-image" onClick={() => handleImageClick(gearItem.imagePaths[currentImageIndex])} />
                <button className="nav-button right" onClick={handleNextImage}>&gt;</button>
            </div>

            {/* More info */}
            <div className="more-info-container">
                <p>{gearItem.description}</p>
                <p><strong>Lokation:</strong> {gearItem.location}</p>
                <p><strong>Stand:</strong> {gearItem.condition}</p>
                <p><strong>År:</strong> {gearItem.year}</p>
                <p><strong>Sælger:</strong> {users[gearItem.userId]?.name || 'Ukendt'}</p>
                <p><strong>Oprettet:</strong> {new Date(gearItem.listingDate).toLocaleDateString()}</p>
                <p><strong>🤍</strong> {gearItem.favoriteCount}</p>
            </div>

            {/* Contact seller */}
            <button onClick={() => setIsMessageModalOpen(true)}>
                Skriv til sælger
            </button>

            {/* Message modal */}
            {isMessageModalOpen && (
                <div className="modal" onClick={() => setIsMessageModalOpen(false)}>
                    <span className="close" onClick={() => setIsMessageModalOpen(false)}>&times;</span>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <MessageToCard
                            senderId={userId}
                            receiverId={gearItem.userId}
                            brand={gearItem.brand}
                            model={gearItem.model}
                        />
                    </div>
                </div>
            )}

            {/* Comments section */}
            <div className="comments-section">
                <button className="show-comments-button" onClick={() => setShowComments(!showComments)}>
                    {showComments ? 'Skjul kommentarer' : 'Kommenter'}
                </button>
                {showComments && (
                    <>
                        {gearItem.comments && gearItem.comments.length > 0 ? (
                            gearItem.comments
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p><strong>{comment.user?.name || 'Ukendt'}:</strong> {comment.text}</p>
                                        <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                        {comment.userId === userId && (
                                            <button onClick={() => handleDeleteComment(comment.id)}>Slet kommentar</button>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <p>Ingen kommentarer.</p>
                        )}
                        <PostComment musicGearId={gearItem.id} onCommentPosted={handleCommentPosted} />
                    </>
                )}
            </div>

            {/* Image modal */}
            {isModalOpen && (
                <div className="modal" onClick={() => setIsModalOpen(false)}>
                    <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view" />
                </div>
            )}
        </div>
    );
}

CardDetails.propTypes = {
    userId: PropTypes.number,
};

export default CardDetails;