import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import './CreateGuitBassGear.css';
import config from "../../../../config.jsx";

function CreateGuitBassGear() {
    const categories = [
        "Elektrisk Guitar", "Akustisk Guitar", "Semi-Hollow Guitar", "Guitarforstærker",
        "Effekt Pedal", "Tilbehør til Guitar", "Elektrisk Bas", "Akustisk Bas",
        "Kontrabas", "Basforstærker", "Tilbehør til Bas", "Andet"
    ];

    return <GearForm gearType="Guitar/Bas Udstyr" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/GuitBassGear`} />;
}

export default CreateGuitBassGear;