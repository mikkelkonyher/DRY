import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateDrumsGear.css';

function CreateDrumsGear() {
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
    ];

    return <GearForm gearType="Trommeudstyr" categories={categories} apiEndpoint="https://localhost:7064/api/DrumsGear" />;
}

export default CreateDrumsGear;