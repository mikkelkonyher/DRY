import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PostComment from "../../Components/PostComments.jsx";

function SellCard({ item, handleImageClick, handleCommentPosted }) {
    const [showAllImages, setShowAllImages] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm('Er du sikker på at du vil slette produktet?');
        if (!confirmed) return;

        try {
            const response = await fetch(`https://localhost:7064/api/MusicGear/${item.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the item');
            }
            console.log('Item deleted successfully');
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="sell-card">
            <h3>{item.brand} {item.model}</h3>

            {showAllImages ? (
                item.imagePaths.map((imagePath, index) => (
                    <img key={index} src={imagePath} alt={`${item.brand} ${item.model}`}
                         className="gear-image" onClick={() => handleImageClick(imagePath)}/>
                ))
            ) : (
                <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`}
                     className="sell-gear-image" onClick={() => handleImageClick(item.imagePaths[0])}/>
            )}
            <button className="toggle-images-button" onClick={() => setShowAllImages(!showAllImages)}>
                {showAllImages ? 'Vis Mindre' : 'Vis Alle Billeder'}
            </button>

            <p>{item.description}</p>
            <p><strong>Pris: </strong>{item.price} DKK</p>
            <p><strong>Lokation:</strong> {item.location}</p>
            <p><strong>Stand:</strong> {item.condition}</p>
            <p><strong>År:</strong> {item.year}</p>

            <p><strong>Oprettet:</strong> {new Date(item.listingDate).toLocaleDateString()}</p>

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

            <button className="delete-button" onClick={handleDelete}>
                Slet
            </button>
        </div>
    );
}

SellCard.propTypes = {
    item: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    toggleShowAllImages: PropTypes.func.isRequired,
    toggleShowComments: PropTypes.func.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    handleCommentPosted: PropTypes.func.isRequired,
};

export default SellCard;