import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PostComment from "../../Components/PostComments.jsx";
import config from "../../../config.jsx"; // Import the config object

function GearCard({ item, users, handleImageClick, handleCommentPosted, gearTypeKey, handleFavorite, userId }) {
    const [showAllImages, setShowAllImages] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Check if the item is already a favorite when the component mounts
        const checkFavoriteStatus = async () => {
            try {
                const checkUrl = new URL(`${config.apiBaseUrl}/api/Favorites/${userId}`);
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!checkResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const favorites = await checkResponse.json();
                const favoriteStatus = favorites.some(favorite => favorite.musicGearId === item.id);
                setIsFavorite(favoriteStatus);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        checkFavoriteStatus();
    }, [item.id, userId]);

    const handleFavoriteClick = async () => {
        try {
            await handleFavorite(item.id);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div className="gear-card">
            <h3>{item.brand} {item.model}</h3>

            {showAllImages ? (
                item.imagePaths.map((imagePath, index) => (
                    <img key={index} src={imagePath} alt={`${item.brand} ${item.model}`}
                         className="gear-image" onClick={() => handleImageClick(imagePath)}/>
                ))
            ) : (
                <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`}
                     className="gear-image" onClick={() => handleImageClick(item.imagePaths[0])}/>
            )}
            <button className="toggle-images-button" onClick={() => setShowAllImages(!showAllImages)}>
                {showAllImages ? 'Vis Mindre' : 'Vis Alle Billeder'}
            </button>

            <p>{item.description}</p>
            <p><strong>Pris: </strong>{item.price} DKK</p>
            <p><strong>Lokation:</strong> {item.location}</p>
            <p><strong>Stand:</strong> {item.condition}</p>
            <p><strong>År:</strong> {item.year}</p>
            <p><strong>Type: </strong>{item[gearTypeKey]}</p>
            <p><strong>Sælger:</strong> {users[item.userId]?.name || 'Ukendt'}</p>
            <p><strong>Oprettet:</strong> {new Date(item.listingDate).toLocaleDateString()}</p>
            <button onClick={() => alert(`Skriv til sælger: ${users[item.userId]?.email || 'Ukendt'}`)}>
                Skriv til sælger
            </button>
            <button onClick={handleFavoriteClick}>
                {isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
            </button>
            <div className="comments-section">
                <button className="show-comments-button" onClick={() => setShowComments(!showComments)}>
                    {showComments ? 'Skjul kommentarer' : 'Se kommentarer'}
                </button>
                {showComments && (
                    <>
                        <h4>Kommentarer:</h4>
                        {item.comments && item.comments.length > 0 ? (
                            item.comments
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
                        <PostComment gearId={item.id} onCommentPosted={() => handleCommentPosted(item.id)}/>
                    </>
                )}
            </div>
        </div>
    );
}

GearCard.propTypes = {
    item: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    handleCommentPosted: PropTypes.func.isRequired,
    gearTypeKey: PropTypes.string.isRequired,
    handleFavorite: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired, // Add userId to prop types
};

export default GearCard;