import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import config from '../../../../config.jsx';
import '../Gear/GearForm.css';

const API_ENDPOINT = `${config.apiBaseUrl}/api/RehearsalRoom`;

const ItemType = {
    IMAGE: 'image',
};

function DraggableImage({ src, index, moveImage }) {
    const [, ref] = useDrag({
        type: ItemType.IMAGE,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemType.IMAGE,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveImage(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <div ref={(node) => ref(drop(node))} className="image-preview-container">
            <img src={src} alt={`Forhåndsvisning ${index}`} className="image-preview" />
            <button type="button" onClick={() => moveImage(index, -1)}>Fjern</button>
            {index === 0 && <p>Hovedbillede</p>}
        </div>
    );
}

DraggableImage.propTypes = {
    src: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    moveImage: PropTypes.func.isRequired,
};

function CreateRehearsalRoom() {
    const [rehearsalRoom, setRehearsalRoom] = useState({
        name: '',
        address: '',
        location: '',
        description: '',
        paymentType: '',
        price: '',
        roomSize: '',
        type: '',
        favoriteCount: 0,
        comments: [],
        userId: '',
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include', // This sends cookies with the request
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                setRehearsalRoom((prevRoom) => ({
                    ...prevRoom,
                    userId: userId,
                }));
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRehearsalRoom((prevRoom) => ({
            ...prevRoom,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const newImageFiles = [...imageFiles];
        const newImagePreviews = [...imagePreviews];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setErrorMessage('Kun billeder af typen jpg, jpeg, png eller webp er tilladt.');
                return;
            }
            if (newImageFiles.length >= 8) {
                setErrorMessage('Du kan ikke uploade mere end 8 billeder.');
                return;
            }
            newImageFiles.push(file);
            newImagePreviews.push(URL.createObjectURL(file));
        }

        setImageFiles(newImageFiles);
        setImagePreviews(newImagePreviews);
        setErrorMessage('');
    };

    const handleRemoveImage = (index) => {
        const newImageFiles = [...imageFiles];
        const newImagePreviews = [...imagePreviews];

        newImageFiles.splice(index, 1);
        newImagePreviews.splice(index, 1);

        setImageFiles(newImageFiles);
        setImagePreviews(newImagePreviews);
    };

    const moveImage = (fromIndex, toIndex) => {
        if (toIndex === -1) {
            handleRemoveImage(fromIndex);
            return;
        }

        const newImageFiles = [...imageFiles];
        const newImagePreviews = [...imagePreviews];

        const [movedFile] = newImageFiles.splice(fromIndex, 1);
        const [movedPreview] = newImagePreviews.splice(fromIndex, 1);

        newImageFiles.splice(toIndex, 0, movedFile);
        newImagePreviews.splice(toIndex, 0, movedPreview);

        setImageFiles(newImageFiles);
        setImagePreviews(newImagePreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (imageFiles.length === 0) {
            setErrorMessage('Du skal uploade mindst ét billede.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        for (const key in rehearsalRoom) {
            formData.append(key, rehearsalRoom[key]);
        }
        for (const file of imageFiles) {
            formData.append('imageFiles', file);
        }
        formData.append('mainImageIndex', mainImageIndex);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                credentials: 'include', // This sends cookies with the request
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Network response was not ok:', errorText);
                throw new Error('Network response was not ok');
            }

            setSuccessMessage('Øvelokalet er blevet oprettet!');
            setRehearsalRoom({
                name: '',
                address: '',
                location: '',
                description: '',
                paymentType: '',
                price: '',
                roomSize: '',
                type: '',
                favoriteCount: 0,
                comments: [],
                userId: '',
            });
            setImageFiles([]);
            setImagePreviews([]);
            setMainImageIndex(0);
            setErrorMessage('');
        } catch (error) {
            console.error('Fejl ved oprettelse af øvelokale:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h2 className="sellHeadline">Opret øvelokale/musikstudie</h2>
                <form onSubmit={handleSubmit}>
                    {successMessage && (
                        <div className="modal-overlay" onClick={() => {
                            setSuccessMessage('');
                            window.location.reload();
                        }}>
                            <div className="modal-error-success" onClick={(e) => e.stopPropagation()}>
                                <span className="close-button" onClick={() => {
                                    setSuccessMessage('');
                                    window.location.reload();
                                }}>&times;</span>
                                <p className="successmessage">{successMessage}</p>
                            </div>
                        </div>
                    )}
                    {errorMessage && (
                        <div className="modal-overlay" onClick={() => setErrorMessage('')}>
                            <div className="modal-error-success" onClick={(e) => e.stopPropagation()}>
                                <span className="close-button" onClick={() => setErrorMessage('')}>&times;</span>
                                <p className="error-message">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <input type="text" name="name" value={rehearsalRoom.name} onChange={handleChange} placeholder="Navn" required maxLength="100" />
                    <input type="text" name="address" value={rehearsalRoom.address} onChange={handleChange} placeholder="Adresse" required maxLength="100" />

                    <select name="location" value={rehearsalRoom.location} onChange={handleChange} required>
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

                    <textarea
                        name="description"
                        value={rehearsalRoom.description}
                        onChange={handleChange}
                        placeholder="Beskrivelse max 2000 tegn"
                        required
                        maxLength={2000}
                    />

                    <select name="paymentType" value={rehearsalRoom.paymentType} onChange={handleChange} required>
                        <option value="">Vælg betalingstype</option>
                        <option value="pr. måned">pr. måned</option>
                        <option value="i timen">i timen</option>
                    </select>

                    <input type="number" name="price" value={rehearsalRoom.price} onChange={handleChange} placeholder="Pris" required max="999999" min="0" />
                    <input type="number" name="roomSize" value={rehearsalRoom.roomSize} onChange={handleChange} placeholder="Størrelse i m2" required max="9999" />

                    <select name="type" value={rehearsalRoom.type} onChange={handleChange} required>
                        <option value="">Vælg type</option>
                        <option value="Øvelokale">Øvelokale</option>
                        <option value="Musikstudie">Musikstudie</option>
                        <option value="Andet">Andet</option>
                    </select>
                    <div className="custom-file-input-wrapper">

                        <label htmlFor="fileInput" className="custom-file-label">Upload billede</label>
                        <input id="fileInput" type="file" multiple onChange={handleFileChange} />


                    <div className="image-previews">
                        {imagePreviews.map((src, index) => (
                            <DraggableImage key={index} src={src} index={index} moveImage={moveImage} />
                        ))}
                    </div>
                    </div>
                    <div className="parent-div">
                        <button type="submit" className="submitproduct-button" disabled={loading}>
                        {loading ? 'Indlæser...' : 'Opret lokale'}
                    </button>
                    </div>
                </form>
            </div>
        </DndProvider>
    );
}

export default CreateRehearsalRoom;