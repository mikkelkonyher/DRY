import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PostComment from "../../Components/PostComments.jsx";

function GearCard({ item, users, handleImageClick, handleCommentPosted }) {
    const [showAllImages, setShowAllImages] = useState(false);
    const [showComments, setShowComments] = useState(false);

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
            <p><strong>Type: </strong>{item.type}</p>
            <p><strong>Sælger:</strong> {users[item.userId]?.name || 'Ukendt'}</p>
            <p><strong>Oprettet:</strong> {new Date(item.listingDate).toLocaleDateString()}</p>
            <button onClick={() => alert(`Skriv til sælger: ${users[item.userId]?.email || 'Ukendt'}`)}>
                Skriv til sælger
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
    toggleShowAllImages: PropTypes.func.isRequired,
    toggleShowComments: PropTypes.func.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    handleCommentPosted: PropTypes.func.isRequired,
};

export default GearCard;