import React from 'react';
import GetGearForm from '../Forms/GetGearForm.jsx';
import './GetGuiBassGear.css'

function GetGuitBassGear() {
    const categories = [
        "Elektrisk Guitar", "Akustisk Guitar", "Semi-Hollow Guitar", "Guitarforstærker",
        "Effekt Pedal", "Tilbehør til Guitar", "Elektrisk Bas", "Akustisk Bas",
        "Kontrabas", "Basforstærker", "Tilbehør til Bas", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Guitar og Basudstyr"
            apiEndpoint="https://localhost:7064/api/GuitBassGear"
            categories={categories}
            gearTypeKey="guitBassType"
        />
    );
}

export default GetGuitBassGear;