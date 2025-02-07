import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateGuitBassGear() {
    const categories = [
        "Elektrisk guitar", "Akustisk guitar", "Semi-hollow guitar", "Guitarforstærker",
        "Effektpedal", "Tilbehør til guitar", "Elektrisk bas", "Akustisk bas",
        "Kontrabas", "Basforstærker", "Tilbehør til bas", "Andet"
    ];

    return <GearForm gearType="guitar/bas" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/GuitBassGear`} />;
}

export default CreateGuitBassGear;