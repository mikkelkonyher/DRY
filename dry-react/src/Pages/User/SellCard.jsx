import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PostComment from "../../Components/PostComments.jsx";

function SellCard({ item, handleImageClick, handleCommentPosted }) {
    const [showAllImages, setShowAllImages] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({ ...item, id: item.id });

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

    const handleUpdate = async () => {
        try {
            // Ensure the id is correctly set
            const itemToUpdate = { ...updatedItem, id: item.id };
            console.log('Updated item:', itemToUpdate); // Log the updated item to check its structure

            // Create FormData
            const formData = new FormData();
            formData.append('Id', itemToUpdate.id);
            formData.append('Brand', itemToUpdate.brand);
            formData.append('Model', itemToUpdate.model);
            formData.append('Year', itemToUpdate.year);
            formData.append('Description', itemToUpdate.description);
            formData.append('Location', itemToUpdate.location);
            formData.append('Condition', itemToUpdate.condition);
            formData.append('Price', itemToUpdate.price);

            const response = await fetch(`https://localhost:7064/api/MusicGear/update/${item.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update the item: ${errorText}`);
            }
            console.log('Item updated successfully');
            setIsEditing(false);
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    return (
        <div className="sell-card">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={updatedItem.brand}
                        placeholder="Mærke"
                        onChange={(e) => setUpdatedItem({ ...updatedItem, brand: e.target.value })}
                    />
                    <input
                        type="text"
                        value={updatedItem.model}
                        placeholder="Model"
                        onChange={(e) => setUpdatedItem({ ...updatedItem, model: e.target.value })}
                    />
                    <input
                        type="number"
                        value={updatedItem.year}
                        placeholder="År"
                        onChange={(e) => setUpdatedItem({ ...updatedItem, year: e.target.value })}
                    />
                    <textarea
                        value={updatedItem.description}
                        placeholder="Beskrivelse"
                        onChange={(e) => setUpdatedItem({ ...updatedItem, description: e.target.value })}
                    />
                    <select
                        className="nice-select"
                        value={updatedItem.location}
                        onChange={(e) => setUpdatedItem({ ...updatedItem, location: e.target.value })}
                    >
                        <option value="">Vælg placering</option>
                        <option value="København og omegn">København og omegn</option>
                        <option value="Aarhus">Aarhus</option>
                        <option value="Odense">Odense</option>
                        <option value="Aalborg">Aalborg</option>
                        <option value="Sjælland">Sjælland</option>
                        <option value="Jylland">Jylland</option>
                        <option value="Fyn">Fyn</option>
                        <option value="Bornholm">Bornholm</option>
                        <option value="Færøerne">Færøerne</option>
                        <option value="Grønland">Grønland</option>
                        <option value="Andet">Andet</option>
                    </select>
                    <select
                        className="nice-select"
                        value={updatedItem.condition}
                        onChange={(e) => setUpdatedItem({ ...updatedItem, condition: e.target.value })}
                    >
                        <option value="">Vælg tilstand</option>
                        <option value="Ny">Ny</option>
                        <option value="Næsten Ny">Næsten Ny</option>
                        <option value="God Stand">God Stand</option>
                        <option value="Brugt">Brugt</option>
                    </select>
                    <input
                        type="number"
                        value={updatedItem.price}
                        placeholder="Pris"
                        onChange={(e) => setUpdatedItem({ ...updatedItem, price: e.target.value })}
                    />
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            ) : (
                <>
                    <h3>{item.brand} {item.model}</h3>
                    {showAllImages ? (
                        item.imagePaths.map((imagePath, index) => (
                            <img key={index} src={imagePath} alt={`${item.brand} ${item.model}`}
                                 className="sell-gear-image" onClick={() => handleImageClick(imagePath)} />
                        ))
                    ) : (
                        <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`}
                             className="sell-gear-image" onClick={() => handleImageClick(item.imagePaths[0])} />
                    )}
                    <button className="toggle-images-button" onClick={() => setShowAllImages(!showAllImages)}>
                        {showAllImages ? 'Vis Mindre' : 'Vis Alle Billeder'}
                    </button>
                    <p><strong>Beskrivelse: </strong>{item.description}</p>
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
                                <PostComment gearId={item.id} onCommentPosted={() => handleCommentPosted(item.id)} />
                            </>
                        )}
                    </div>
                    <button className="delete-button" onClick={handleDelete}>
                        Slet
                    </button>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                </>
            )}
        </div>
    );
}

SellCard.propTypes = {
    item: PropTypes.object.isRequired,
    handleImageClick: PropTypes.func.isRequired,
    handleCommentPosted: PropTypes.func.isRequired,
};

export default SellCard;