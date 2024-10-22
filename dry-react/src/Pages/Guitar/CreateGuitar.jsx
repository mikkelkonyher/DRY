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
            alert('You can only upload up to 8 photos.');
            return;
        }
        setImageFiles(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
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
        } catch (error) {
            console.error('Error creating guitar:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="mærke" value={guitar.brand} onChange={handleChange} placeholder="Mærke" required />
            <input type="text" name="model" value={guitar.model} onChange={handleChange} placeholder="Model" required />
            <textarea name="beskrivelse" value={guitar.description} onChange={handleChange} placeholder="Beskrivelse" required />
            <input type="number" name="pris" value={guitar.price} onChange={handleChange} placeholder="Pris" required />
            <input type="text" name="placering" value={guitar.location} onChange={handleChange} placeholder="Placering" required />
            <input type="text" name="tilstand" value={guitar.condition} onChange={handleChange} placeholder="Tilstand" required />
            <input type="number" name="år" value={guitar.year} onChange={handleChange} placeholder="År" required />
            <select name="guitarType" value={guitar.guitarType} onChange={handleChange} required>
                <option value="">Vælg Produktkategori</option>
                <option value="Elektrisk Guitar">Elektrisk Guitar</option>
                <option value="Akustisk Guitar">Akustisk Guitar</option>
                <option value="Semi-Hollow Guitar">Semi-Hollow Guitar</option>
                <option value="Guitar-forstærker">Guitar-forstærker</option>
                <option value="Effekt Pedal">Effekt Pedal</option>
                <option value="Tilbehør">Tilbehør</option>
                <option value="Andet">Andet</option>
            </select>
            <input type="number" name="brugerId" value={guitar.userId} onChange={handleChange} placeholder="Bruger ID" required />
            <input type="file" multiple onChange={handleFileChange} />
            <div className="image-previews">
                {imagePreviews.map((src, index) => (
                    <img key={index} src={src} alt={`Preview ${index}`} className="image-preview" />
                ))}
            </div>
            <button type="submit">Opret Guitar</button>
        </form>
    );
}

export default CreateGuitar;