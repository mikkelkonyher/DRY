import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateDrumsGear.css';

function CreateDrumsGear() {
    const categories = [
        "Acoustic Drums", "Electronic Drums", "Cymbals", "Drum Hardware",
        "Percussion", "Drum Accessories", "Other"
    ];

    const handleSubmit = async (formData) => {
        formData.set('drumsGearType', formData.get('type'));
        formData.delete('type');

        try {
            const response = await fetch('https://localhost:7064/api/DrumsGear', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating gear:', error);
            throw error;
        }
    };

    return <GearForm gearType="Drums Gear" categories={categories} onSubmit={handleSubmit} />;
}

export default CreateDrumsGear;