import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import config from '../../../config.jsx';
import './SellCard.css';

function SellCard({ item, userId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({ ...item, id: item.id });
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

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

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        if (!userId) {
            alert('Login for at tilføje favoritter');
            return;
        }

        if (userId === item.userId) {
            alert('Du kan ikke tilføje dit eget produkt til favoritter');
            return;
        }

        if (isFavorite) {
            const confirmed = window.confirm('Er du sikker på at du vil fjerne dette produkt fra favoritter?');
            if (!confirmed) return;
        }

        try {
            const url = new URL(`${config.apiBaseUrl}/api/Favorites`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('musicGearId', item.id);

            const response = await fetch(url, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setIsFavorite(!isFavorite);
            window.location.reload(); // Reload the page to reflect the change
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmed = window.confirm('Er du sikker på at du vil slette produktet?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/${item.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the item');
            }
            console.log('Item deleted successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleUpdate = async (e) => {
        e.stopPropagation();
        try {
            const itemToUpdate = { ...updatedItem, id: item.id };
            console.log('Updated item:', itemToUpdate);

            const formData = new FormData();
            formData.append('Id', itemToUpdate.id);
            formData.append('Brand', itemToUpdate.brand);
            formData.append('Model', itemToUpdate.model);
            formData.append('Year', itemToUpdate.year);
            formData.append('Description', itemToUpdate.description);
            formData.append('Location', itemToUpdate.location);
            formData.append('Condition', itemToUpdate.condition);
            formData.append('Price', itemToUpdate.price);

            newImages.forEach((image) => {
                formData.append('imageFiles', image);
            });

            imagesToDelete.forEach((image) => {
                formData.append('imagesToDelete', image);
            });

            const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/update/${item.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update the item: ${errorText}`);
            }
            console.log('Item updated successfully');
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleNewImagesChange = (e) => {
        e.stopPropagation();
        setNewImages([...e.target.files]);
    };

    const handleImageDelete = (image, e) => {
        e.stopPropagation();
        setImagesToDelete([...imagesToDelete, image]);
        setUpdatedItem({
            ...updatedItem,
            imagePaths: updatedItem.imagePaths.filter((img) => img !== image),
        });
    };

    const handleImageClick = (src, e) => {
        e.stopPropagation();
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const handleCardClick = () => {
        if (!isEditing) {
            window.open(`/gear/${item.id}`, '_blank');
        }
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsEditing(false);
        navigate('/myprofile');
    };

    return (
        <div className="sell-card" onClick={handleCardClick}>
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
                    <input
                        type="file"
                        multiple
                        onChange={handleNewImagesChange}
                    />
                    <div className="image-list">
                        {updatedItem.imagePaths.map((imagePath, index) => (
                            <div key={index} className="image-item">
                                <img src={imagePath} alt={`${item.brand} ${item.model}`} className="sell-gear-image" />
                                <button onClick={(e) => handleImageDelete(imagePath, e)}>Slet billede</button>
                            </div>
                        ))}
                    </div>
                    <button className="saveButton" onClick={handleUpdate}>Gem</button>
                    <button className="cancelButton" onClick={handleCancel}>Annuller</button>
                </>
            ) : (
                <>
                    <h3>{item.brand} {item.model}</h3>
                    <h4><strong>Pris: </strong>{item.price} kr. </h4>
                    <div className="image-container">
                        {item.imagePaths && item.imagePaths.length > 0 ? (
                            <img src={item.imagePaths[0]} alt={`${item.brand} ${item.model}`}
                                 className="sell-gear-image" onClick={(e) => handleImageClick(item.imagePaths[0], e)} />
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>
                    {item.userId === userId ? (
                        <>
                            <button className="delete-button" onClick={(e) => handleDelete(e)}>
                                Slet
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>Rediger</button>
                        </>
                    ) : (
                        <button className="favorite-button" onClick={(e) => handleFavoriteClick(e)}>

                        </button>
                    )}
                    {isFavorite && (
                        <button className="remove-favorite-button" onClick={(e) => handleFavoriteClick(e)}>
                            Fjern fra favoritter
                        </button>
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

SellCard.propTypes = {
    item: PropTypes.object.isRequired,
    userId: PropTypes.number.isRequired,
};

export default SellCard;