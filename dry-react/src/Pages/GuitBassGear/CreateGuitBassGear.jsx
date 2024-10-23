import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateGuitBassGear.css';

function CreateGuitBassGear() {
    const categories = [
        "Elektrisk Guitar", "Akustisk Guitar", "Semi-Hollow Guitar", "Guitarforstærker",
        "Effekt Pedal", "Tilbehør til Guitar", "Elektrisk Bas", "Akustisk Bas",
        "Kontrabas", "Basforstærker", "Tilbehør til Bas", "Andet"
    ];

    const handleSubmit = async (formData) => {
        const response = await fetch('https://localhost:7064/api/GuitBassGear', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    };

    return <GearForm gearType="Guitar og Basudstyr" categories={categories} onSubmit={handleSubmit} />;
}

export default CreateGuitBassGear;