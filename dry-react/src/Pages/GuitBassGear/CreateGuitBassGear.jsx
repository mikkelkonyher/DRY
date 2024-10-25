import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateGuitBassGear.css';

function CreateGuitBassGear() {
    const categories = [
        "Akustiske Guitarer", "Elektriske Guitarer", "Basser", "Forstærkere", "Effekter", "Tilbehør", "Andet"
    ];

    return <GearForm gearType="Guitar/Bas Udstyr" categories={categories} apiEndpoint="https://localhost:7064/api/GuitBassGear" />;
}

export default CreateGuitBassGear;