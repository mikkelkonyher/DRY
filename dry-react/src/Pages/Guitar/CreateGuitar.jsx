import React, { useState } from 'react';
import './CreateGuitar.css';

function CreateGuitar() {
    const [guitar, setGuitar] = useState({
        brand: '',
        model: '',
        description: '',
        price: '',
        location: '',
        condition: '',
        year: '',
        guitarType: '',
        userId: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuitar((prevGuitar) => ({
            ...prevGuitar,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 8) {
            alert('Du kan kun uploade op til 8 fotos.');
            return;
        }
        setImageFiles(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        setMainImageIndex(0); // Set the first image as the default main image
    };

    const handleMainImageChange = (index) => {
        setMainImageIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in guitar) {
            formData.append(key, guitar[key]);
        }
        for (const file of imageFiles) {
            formData.append('imageFiles', file);
        }
        formData.append('mainImageIndex', mainImageIndex);

        try {
            const response = await fetch('https://localhost:7064/api/Guitar', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Guitar created successfully:', result);
            setSuccessMessage('Guitar oprettet med succes!');
            setGuitar({
                brand: '',
                model: '',
                description: '',
                price: '',
                location: '',
                condition: '',
                year: '',
                guitarType: '',
                userId: '',
            });
            setImageFiles([]);
            setImagePreviews([]);
            setMainImageIndex(0);
        } catch (error) {
            console.error('Fejl ved oprettelse af guitar:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {successMessage && <p className="success-message">{successMessage}</p>}
            <input type="text" name="brand" value={guitar.brand} onChange={handleChange} placeholder="Mærke" required />
            <input type="text" name="model" value={guitar.model} onChange={handleChange} placeholder="Model" required />
            <textarea name="description" value={guitar.description} onChange={handleChange} placeholder="Beskrivelse" required />
            <input type="number" name="price" value={guitar.price} onChange={handleChange} placeholder="Pris" required />
            <input type="text" name="location" value={guitar.location} onChange={handleChange} placeholder="Placering" required />
            <input type="text" name="condition" value={guitar.condition} onChange={handleChange} placeholder="Tilstand" required />
            <input type="number" name="year" value={guitar.year} onChange={handleChange} placeholder="År" required />
            <select name="guitarType" value={guitar.guitarType} onChange={handleChange} required>
                <option value="">Vælg guitartype</option>
                <option value="Electric Guitar">Elektrisk guitar</option>
                <option value="Acoustic Guitar">Akustisk guitar</option>
                <option value="Semi-Hollow Guitar">Semi-hollow guitar</option>
                <option value="Guitar Amplifier">Guitarforstærker</option>
                <option value="Effect Pedal">Effektpedal</option>
                <option value="Accessory">Tilbehør</option>
                <option value="Other">Andet</option>
            </select>
            <input type="number" name="userId" value={guitar.userId} onChange={handleChange} placeholder="Bruger ID" required />
            <input type="file" multiple onChange={handleFileChange} />
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
            <button type="submit">Opret Guitar</button>
        </form>
    );
}

export default CreateGuitar;