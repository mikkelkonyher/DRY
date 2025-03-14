import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import config from "../../../../config.jsx";
import './GearForm.css';

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
            <button type="button" className="remove-button" onClick={() => moveImage(index, -1)}>Fjern</button>
            {index === 0 && <p>Primært billede</p>}
        </div>
    );
}

DraggableImage.propTypes = {
    src: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    moveImage: PropTypes.func.isRequired,
};

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                setGear((prevGear) => ({
                    ...prevGear,
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
        setLoading(true);

        if (imageFiles.length === 0) {
            setErrorMessage('Du skal uploade mindst ét billede.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        let typeFieldName;

        switch (gearType) {
            case 'trommer':
                typeFieldName = 'DrumsGearType';
                break;
            case 'guitar/bas':
                typeFieldName = 'GuitBassType';
                break;
            case 'keys':
                typeFieldName = 'KeysGearType';
                break;
            case 'studiegear':
                typeFieldName = 'StudioGearType';
                break;
            case 'strygere':
                typeFieldName = 'StringsGearType';
                break;
            case 'blæseinstrumenter':
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

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                credentials: 'include',
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h2 className="sellHeadline">Sælg {gearType}</h2>
                <form className="createGearForm" onSubmit={handleSubmit}>
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

                    <select name="type" value={gear.type} onChange={handleChange} required>
                        <option value="">Vælg type kategori</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <input type="text" name="brand" value={gear.brand} onChange={handleChange} placeholder="Mærke" required maxLength="100" />
                    <input type="text" name="model" value={gear.model} onChange={handleChange} placeholder="Model" required maxLength="100" />
                    <textarea
                        name="description"
                        value={gear.description}
                        onChange={handleChange}
                        placeholder="Beskrivelse (maks. 2000 tegn)"
                        required
                        maxLength={2000}
                    />
                    <input type="number" name="price" value={gear.price} onChange={handleChange} placeholder="Pris" required max="999999" min="0"/>

                    <select name="condition" value={gear.condition} onChange={handleChange} required>
                        <option value="">Vælg tilstand</option>
                        <option value="Ny">Ny</option>
                        <option value="Næsten Ny">Næsten ny</option>
                        <option value="God Stand">God stand</option>
                        <option value="Brugt">Brugt</option>
                    </select>

                    <input type="number" name="year" value={gear.year} onChange={handleChange} placeholder="År" required max="9999" min="0" />
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

                    <div className="custom-file-input-wrapper">
                        <label htmlFor="fileInput" className="custom-file-label">Upload billede</label>
                        <input type="file" multiple onChange={handleFileChange}/>

                        <div className="image-previews">
                            {imagePreviews.map((src, index) => (
                                <DraggableImage key={index} src={src} index={index} moveImage={moveImage}/>
                            ))}
                        </div>
                    </div>

                    <div className="parent-div">
                        <button type="submit" className="submitproduct-button" disabled={loading}>
                            {loading ? 'Indlæser...' : 'Opret artikel'}
                        </button>
                    </div>
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