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

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub;
                if (!email) {
                    throw new Error('Email not found in token');
                }

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch users');
                }

                const users = await userResponse.json();
                const user = users.find(user => user.email === email);
                if (!user) {
                    throw new Error('User not found');
                }

                setRehearsalRoom((prevRoom) => ({
                    ...prevRoom,
                    userId: user.id,
                }));
            } catch (error) {
                console.error('Error decoding token or fetching user ID:', error);
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
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('Login for at oprette et produkt');
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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h2 className="sellHeadline">Opret Øvelokale/Musikstudie</h2>
                <form onSubmit={handleSubmit}>
                    {successMessage && <p className="success-message" style={{color: 'green'}}>{successMessage}</p>}
                    {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}

                    <input type="text" name="name" value={rehearsalRoom.name} onChange={handleChange} placeholder="Navn" required />
                    <input type="text" name="address" value={rehearsalRoom.address} onChange={handleChange} placeholder="Adresse" required />

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

                    <input type="number" name="price" value={rehearsalRoom.price} onChange={handleChange} placeholder="Pris" required />
                    <input type="number" name="roomSize" value={rehearsalRoom.roomSize} onChange={handleChange} placeholder="Størrelse i 2m" required />

                    <select name="type" value={rehearsalRoom.type} onChange={handleChange} required>
                        <option value="">Vælg type</option>
                        <option value="Øvelokale">Øvelokale</option>
                        <option value="Musikstudie">Musikstudie</option>
                        <option value="andet">andet</option>
                    </select>

                    <input type="file" multiple onChange={handleFileChange} />

                    <div className="image-previews">
                        {imagePreviews.map((src, index) => (
                            <DraggableImage key={index} src={src} index={index} moveImage={moveImage} />
                        ))}
                    </div>

                    <button type="submit">Opret lokale</button>
                </form>
            </div>
        </DndProvider>
    );
}

export default CreateRehearsalRoom;