import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import PostComment from "../../../Components/PostComments.jsx";
import MessageToRehearsalRoom from "../../MessageSystem/MessageToRehearsalRoom.jsx";
import config from "../../../../config.jsx";
import '../Gear/CardDetails.css';
import Cookies from 'js-cookie';

function RehearsalRoomDetails() {
    const { id } = useParams();
    const [roomItem, setRoomItem] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

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
        const fetchRoomItem = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom/${id}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setRoomItem(data.items[0]);

                const commentsResponse = await fetch(`${config.apiBaseUrl}/api/Comment/api/RehearsalRoom/${id}/comments`);
                if (!commentsResponse.ok) throw new Error('Network response was not ok');
                const commentsData = await commentsResponse.json();
                setRoomItem(prevItem => ({ ...prevItem, comments: commentsData }));

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`);
                if (!userResponse.ok) throw new Error('Network response was not ok');
                const userData = await userResponse.json();
                const userMap = userData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);

                if (userId) {
                    const checkUrl = new URL(`${config.apiBaseUrl}/api/RehearsalRoomFavorites/${userId}`);
                    const checkResponse = await fetch(checkUrl, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!checkResponse.ok) throw new Error('Network response was not ok');
                    const favorites = await checkResponse.json();
                    const favoriteStatus = favorites.some(favorite => favorite.rehearsalRoomid === data.items[0].id);
                    setIsFavorite(favoriteStatus);
                }
            } catch (error) {
                console.error('Error fetching room item:', error);
            }
        };

        fetchRoomItem();
    }, [id, userId]);

    const handleFavoriteClick = async () => {
        if (!userId) {
            alert('Login for at tilføje favoritter');
            return;
        }

        if (userId === roomItem.userId) {
            alert('Du kan ikke tilføje dit eget produkt til favoritter');
            return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/RehearsalRoomFavorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('rehearsalRoomId', id);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(!isFavorite);
            setRoomItem(prevItem => ({
                ...prevItem,
                favoriteCount: isFavorite ? prevItem.favoriteCount - 1 : prevItem.favoriteCount + 1
            }));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % roomItem.imagePaths.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + roomItem.imagePaths.length) % roomItem.imagePaths.length);
    };

    const handleImageClick = (imagePath) => {
        setSelectedImage(imagePath);
        setIsModalOpen(true);
    };

    const handleCommentPosted = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/api/RehearsalRoom/${id}/comments`);
            if (!response.ok) throw new Error('Network response was not ok');
            const commentsData = await response.json();
            setRoomItem(prevItem => ({ ...prevItem, comments: commentsData }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const isConfirmed = window.confirm("Er du sikker på at du vil slette denne kommentar?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Cookies.get('AuthToken')}` },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setRoomItem(prevItem => ({
                ...prevItem,
                comments: prevItem.comments.filter(comment => comment.id !== commentId)
            }));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (!roomItem) return <div>Loading...</div>;

    return (
        <div className="gear-cardDetails">
            {/* Room item details */}
            <h4>{roomItem.name}</h4>
            <h5><strong>Pris: </strong>{roomItem.price.toLocaleString('da-DK')} kr. {roomItem.paymentType}</h5>

            {/* Favorite button */}
            <button
                className="favorite-button-cardDetails"
                onClick={handleFavoriteClick}
                title={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
            >
                <FontAwesomeIcon icon={isFavorite ? solidHeart : regularHeart} />
            </button>

            {/* Image carousel */}
            <div className="image-carousel-container">
                <button className="nav-button-cardDetails nav-button-left-cardDetails" onClick={handlePrevImage}>&lt;</button>
                <div className="image-container-cardDetails">
                    <img src={roomItem.imagePaths[currentImageIndex]} alt={roomItem.name}
                         className="gear-image-CardDetails" onClick={() => handleImageClick(roomItem.imagePaths[currentImageIndex])} />
                </div>
                <button className="nav-button-cardDetails nav-button-right-cardDetails" onClick={handleNextImage}>&gt;</button>
            </div>

            <div className="more-info-container">
                <p>{roomItem.description}</p>

                <p><strong>Lokation:</strong> {roomItem.location}</p>
                <p><strong>Adresse:</strong> {roomItem.address}</p>
                <p><strong>Udlejer:</strong> {users[roomItem.userId]?.name || 'Ukendt'}</p>
                <p><strong>Størrelse:</strong> {roomItem.roomSize} m²</p>
                <p><strong>Oprettet:</strong> {new Date(roomItem.listingDate).toLocaleDateString()}</p>
                <p><strong>🤍</strong> {roomItem.favoriteCount}</p>
            </div>

            <button onClick={() => setIsMessageModalOpen(true)}>
                Skriv til udlejer
            </button>

            {isMessageModalOpen && (
                <div className="modal" onClick={() => setIsMessageModalOpen(false)}>
                    <span className="close" onClick={() => setIsMessageModalOpen(false)}>&times;</span>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <MessageToRehearsalRoom
                            senderId={userId}
                            receiverId={roomItem.userId}
                            subject={roomItem.name}
                        />
                    </div>
                </div>
            )}

            <div className="comments-section">
                <button className="show-comments-button" onClick={() => setShowComments(!showComments)}>
                    {showComments ? 'Skjul kommentarer' : 'Kommenter'}
                </button>
                {showComments && (
                    <>
                        {roomItem.comments && roomItem.comments.length > 0 ? (
                            roomItem.comments
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p><strong>{comment.user?.name || 'Ukendt'}:</strong> {comment.text}</p>
                                        <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                        {comment.userId === userId && (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button className="deleteCommentButton" onClick={() => handleDeleteComment(comment.id)}>Slet kommentar</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <p>Ingen kommentarer.</p>
                        )}
                        <PostComment rehearsalRoomId={roomItem.id} userId={userId} onCommentPosted={handleCommentPosted} />
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="modal" onClick={() => setIsModalOpen(false)}>
                    <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view" />
                </div>
            )}
        </div>
    );
}

RehearsalRoomDetails.propTypes = {
    userId: PropTypes.number,
};

export default RehearsalRoomDetails;