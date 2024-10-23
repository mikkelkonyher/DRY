import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './GearForm.css';

function GearForm({ gearType, categories, onSubmit }) {
    // State for gear details
    const [gear, setGear] = useState({
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

    // State for image files and previews
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes for gear details
    const handleChange = (e) => {
        const { name, value } = e.target;
        setGear((prevGear) => ({
            ...prevGear,
            [name]: value,
        }));
    };

    // Handle file input changes for images
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 8) {
            alert('Du kan kun uploade op til 8 fotos.');
            return;
        }
        setImageFiles(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        setMainImageIndex(0);
    };

    // Handle main image selection
    const handleMainImageChange = (index) => {
        setMainImageIndex(index);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('GuitBassType', gear.type); // Ensure this matches the server's expected field name
        for (const key in gear) {
            formData.append(key, gear[key]);
        }
        for (const file of imageFiles) {
            formData.append('imageFiles', file);
        }
        formData.append('mainImageIndex', mainImageIndex);

        // Log the form data for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            await onSubmit(formData);
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
        } catch (error) {
            console.error('Fejl ved oprettelse af gear:', error);
        }
    };

    return (
        <div>
            <h2>Sælg {gearType}</h2>
            <form onSubmit={handleSubmit}>
                {/* Success message */}
                {successMessage && <p className="success-message" style={{color: 'green'}}>{successMessage}</p>}

                {/* Gear type selection */}
                <select name="type" value={gear.type} onChange={handleChange} required>
                    <option value="">Vælg {gearType} kategori</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                {/* Gear details inputs */}
                <input type="text" name="brand" value={gear.brand} onChange={handleChange} placeholder="Mærke" required />
                <input type="text" name="model" value={gear.model} onChange={handleChange} placeholder="Model" required />
                <textarea name="description" value={gear.description} onChange={handleChange} placeholder="Beskrivelse" required />
                <input type="number" name="price" value={gear.price} onChange={handleChange} placeholder="Pris" required />

                {/* Gear condition selection */}
                <select name="condition" value={gear.condition} onChange={handleChange} required>
                    <option value="">Vælg tilstand</option>
                    <option value="Ny">Ny</option>
                    <option value="Næsten Ny">Næsten Ny</option>
                    <option value="God Stand">God Stand</option>
                    <option value="Brugt">Brugt</option>
                </select>

                {/* Additional gear details inputs */}
                <input type="number" name="year" value={gear.year} onChange={handleChange} placeholder="År" required />
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
                    <option value="Færøerne">Færøerne</option>
                    <option value="Grønland">Grønland</option>
                    <option value="Andet">Andet</option>
                </select>
                <input type="number" name="userId" value={gear.userId} onChange={handleChange} placeholder="Bruger ID" required />

                {/* Image file input */}
                <input type="file" multiple onChange={handleFileChange} />

                {/* Image previews */}
                <div className="image-previews">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="image-preview-container">
                            <img src={src} alt={`Forhåndsvisning ${index}`} className="image-preview" />
                            <label>
                                <input
                                    type="radio"
                                    name="mainImage"
                                    checked={mainImageIndex === index}
                                    onChange={() => handleMainImageChange(index)}
                                />
                                Hovedbillede
                            </label>
                        </div>
                    ))}
                </div>

                {/* Submit button */}
                <button type="submit">Opret Produkt</button>
            </form>
        </div>
    );
}

GearForm.propTypes = {
    gearType: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default GearForm;