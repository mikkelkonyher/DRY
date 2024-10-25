import React from 'react';
import GearForm from '../Forms/GearForm.jsx';
import './CreateGuitBassGear.css';

function CreateGuitBassGear() {
    const categories = [
        "Elektrisk Guitar", "Akustisk Guitar", "Semi-Hollow Guitar", "Guitarforstærker",
        "Effekt Pedal", "Tilbehør til Guitar", "Elektrisk Bas", "Akustisk Bas",
        "Kontrabas", "Basforstærker", "Tilbehør til Bas", "Andet"
    ];

    return <GearForm gearType="Guitar/Bas Udstyr" categories={categories} apiEndpoint="https://localhost:7064/api/GuitBassGear" />;
}

export default CreateGuitBassGear;