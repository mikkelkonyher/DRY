import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import config from '../../../config.jsx';
import './SellCard.css';

function SellRehearsalRoom({ room, userId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedRoom, setUpdatedRoom] = useState({ ...room, id: room.id });
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isFavorite, setIsFavorite] = useState(room.isFavorite || false);
    const navigate = useNavigate();

    // Handle favorite click
    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        if (!userId) {
            alert('Login to remove from favorites');
            return;
        }

        if (isFavorite) {
            const confirmed = window.confirm('Are you sure you want to remove this room from favorites?');
            if (!confirmed) return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/RehearsalRoomFavorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('rehearsalRoomId', room.id);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(false);
            window.location.reload(); // Reload the page to reflect the change
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    // Handle delete room
    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmed = window.confirm('Er du sikker på at du vil slette lokalet?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom/${room.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the room');
            }
            console.log('Room deleted successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    // Handle update room
    const handleUpdate = async (e) => {
        e.stopPropagation();
        try {
            const roomToUpdate = { ...updatedRoom, id: room.id };
            console.log('Updated room:', roomToUpdate);

            const formData = new FormData();
            formData.append('Id', roomToUpdate.id);
            formData.append('Name', roomToUpdate.name);
            formData.append('Address', roomToUpdate.address);
            formData.append('Location', roomToUpdate.location);
            formData.append('Description', roomToUpdate.description);
            formData.append('PaymentType', roomToUpdate.paymentType);
            formData.append('Price', roomToUpdate.price);
            formData.append('RoomSize', roomToUpdate.roomSize);
            formData.append('Type', roomToUpdate.type);

            newImages.forEach((image) => {
                formData.append('imageFiles', image);
            });

            imagesToDelete.forEach((image) => {
                formData.append('imagesToDelete', image);
            });

            const response = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom/update/${room.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update the room: ${errorText}`);
            }
            console.log('Room updated successfully');
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating room:', error);
        }
    };

    // Handle new images change
    const handleNewImagesChange = (e) => {
        e.stopPropagation();
        setNewImages([...e.target.files]);
    };

    // Handle image delete
    const handleImageDelete = (image, e) => {
        e.stopPropagation();
        setImagesToDelete([...imagesToDelete, image]);
        setUpdatedRoom({
            ...updatedRoom,
            imagePaths: updatedRoom.imagePaths.filter((img) => img !== image),
        });
    };

    // Handle image click
    const handleImageClick = (src, e) => {
        e.stopPropagation();
        setSelectedImage(src);
    };

    // Close modal
    const closeModal = () => {
        setSelectedImage(null);
    };

    // Handle card click
    const handleCardClick = () => {
        if (!isEditing) {
            navigate(`/RehearsalRoomDetails/${room.id}`);
        }
    };

    // Handle cancel
    const handleCancel = (e) => {
        e.stopPropagation();
        setIsEditing(false);
        navigate('/myprofile');
    };

    return (
        <div className="sell-card" onClick={handleCardClick}>
            {isEditing ? (
                <>
                    {/* Editing form */}
                    <input
                        type="text"
                        value={updatedRoom.name}
                        placeholder="Name"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, name: e.target.value })}
                    />
                    <input
                        type="text"
                        value={updatedRoom.address}
                        placeholder="Address"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, address: e.target.value })}
                    />
                    <input
                        type="text"
                        value={updatedRoom.location}
                        placeholder="Location"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, location: e.target.value })}
                    />
                    <textarea
                        value={updatedRoom.description}
                        placeholder="Description"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, description: e.target.value })}
                    />
                    <input
                        type="text"
                        value={updatedRoom.paymentType}
                        placeholder="Payment Type"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, paymentType: e.target.value })}
                    />
                    <input
                        type="number"
                        value={updatedRoom.price}
                        placeholder="Price"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, price: e.target.value })}
                    />
                    <input
                        type="number"
                        value={updatedRoom.roomSize}
                        placeholder="Room Size"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, roomSize: e.target.value })}
                    />
                    <input
                        type="text"
                        value={updatedRoom.type}
                        placeholder="Type"
                        onChange={(e) => setUpdatedRoom({ ...updatedRoom, type: e.target.value })}
                    />
                    <input
                        type="file"
                        multiple
                        onChange={handleNewImagesChange}
                    />
                    <div className="image-list">
                        {updatedRoom.imagePaths.map((imagePath, index) => (
                            <div key={index} className="image-item">
                                <img src={imagePath} alt={`${room.name}`} className="sell-gear-image" />
                                <button onClick={(e) => handleImageDelete(imagePath, e)}>Slet</button>
                            </div>
                        ))}
                    </div>
                    <button className="saveButton" onClick={handleUpdate}>Gem</button>
                    <button className="cancelButton" onClick={handleCancel}>Annuller</button>
                </>
            ) : (
                <>
                    {/* Display room details */}
                    <h3>{room.name}</h3>
                    <h4><strong>Pris: </strong>{room.price.toLocaleString('da-DK')} kr. </h4>
                    <div className="image-container-sellcard">
                        {room.imagePaths && room.imagePaths.length > 0 ? (
                            <img src={room.imagePaths[0]} alt={`${room.name}`}
                                 className="sell-gear-image" onClick={(e) => handleImageClick(room.imagePaths[0], e)} />
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>
                    {room.userId === userId ? (
                        <>
                            <button className="delete-button" onClick={(e) => handleDelete(e)}>
                                Slet
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>Rediger</button>
                        </>
                    ) : (
                        <>
                            {isFavorite && (
                                <button className="remove-favorite-button" onClick={(e) => handleFavoriteClick(e)}>
                                    Fjern fra favoritter
                                </button>
                            )}
                        </>
                    )}
                </>
            )}
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <span className="close">&times;</span>
                    <img className="modal-content" src={selectedImage} alt="Large view" />
                </div>
            )}
        </div>
    );
}

SellRehearsalRoom.propTypes = {
    room: PropTypes.object.isRequired,
    userId: PropTypes.number.isRequired,
};

export default SellRehearsalRoom;