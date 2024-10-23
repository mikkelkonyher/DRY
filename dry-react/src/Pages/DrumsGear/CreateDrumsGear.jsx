import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateDrumsGear.css';

function CreateDrumsGear() {
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
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

    return <GearForm gearType="Trommeudstyr" categories={categories} onSubmit={handleSubmit} />;
}

export default CreateDrumsGear;