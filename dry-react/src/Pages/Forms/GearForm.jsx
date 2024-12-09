import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import config from "../../../config.jsx";
import './GearForm.css';

//DraggableImage component
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

//GearForm component
function GearForm({ gearType, categories, apiEndpoint }) {
    const [gear, setGear] = useState({
        brand: '',
        model: '',
        description: '',
        price: '',
        location: '',
        condition: '',
        type: '',
        userId: '',
        year: '',
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

                setGear((prevGear) => ({
                    ...prevGear,
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
        setGear((prevGear) => ({
            ...prevGear,
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
        let typeFieldName;

        switch (gearType) {
            case 'Trommeudstyr':
                typeFieldName = 'DrumsGearType';
                break;
            case 'Guitar/Bas Udstyr':
                typeFieldName = 'GuitBassType';
                break;
            case 'Keys Gear':
                typeFieldName = 'KeysGearType';
                break;
            case 'Studie Gear':
                typeFieldName = 'StudioGearType';
                break;
            case 'Strygere':
                typeFieldName = 'StringsGearType';
                break;
            case 'Blæseinstrumenter':
                typeFieldName = 'HornsGearType';
                break;
            default:
                typeFieldName = 'GearType';
        }

        formData.append(typeFieldName, gear.type);
        for (const key in gear) {
            formData.append(key, gear[key]);
        }
        for (const file of imageFiles) {
            formData.append('imageFiles', file);
        }
        formData.append('mainImageIndex', mainImageIndex);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            const response = await fetch(apiEndpoint, {
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

            setSuccessMessage('Produktet er blevet oprettet!');
            setGear({
                brand: '',
                model: '',
                description: '',
                price: '',
                location: '',
                condition: '',
                year: '',
                type: '',
                userId: '',
            });
            setImageFiles([]);
            setImagePreviews([]);
            setMainImageIndex(0);
            setErrorMessage('');
        } catch (error) {
            console.error('Fejl ved oprettelse af gear:', error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h2 className="sellHeadline">Sælg {gearType}</h2>
                <form onSubmit={handleSubmit}>
                    {successMessage && <p className="success-message" style={{color: 'green'}}>{successMessage}</p>}
                    {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}

                    <select name="type" value={gear.type} onChange={handleChange} required>
                        <option value="">Vælg {gearType} kategori</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <input type="text" name="brand" value={gear.brand} onChange={handleChange} placeholder="Mærke"
                           required/>
                    <input type="text" name="model" value={gear.model} onChange={handleChange} placeholder="Model"
                           required/>
                    <textarea
                        name="description"
                        value={gear.description}
                        onChange={handleChange}
                        placeholder="Beskrivelse max 2000 tegn"
                        required
                        maxLength={2000} // Assuming an average word length of 5 characters
                    />
                    <input type="number" name="price" value={gear.price} onChange={handleChange} placeholder="Pris"
                           required/>

                    <select name="condition" value={gear.condition} onChange={handleChange} required>
                        <option value="">Vælg tilstand</option>
                        <option value="Ny">Ny</option>
                        <option value="Næsten Ny">Næsten Ny</option>
                        <option value="God Stand">God Stand</option>
                        <option value="Brugt">Brugt</option>
                    </select>

                    <input type="number" name="year" value={gear.year} onChange={handleChange} placeholder="År"
                           required/>
                    <select name="location" value={gear.location} onChange={handleChange} required>
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

                    <input type="file" multiple onChange={handleFileChange}/>

                    <div className="image-previews">
                        {imagePreviews.map((src, index) => (
                            <DraggableImage key={index} src={src} index={index} moveImage={moveImage}/>
                        ))}
                    </div>

                    <button type="submit">Opret Produkt</button>
                </form>
            </div>
        </DndProvider>
    );
}

GearForm.propTypes = {
    gearType: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    apiEndpoint: PropTypes.string.isRequired,
};

export default GearForm;