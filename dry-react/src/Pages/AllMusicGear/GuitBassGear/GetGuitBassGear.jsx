import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetGuitBassGear() {
    const categories = [
        "Elektrisk guitar", "Akustisk guitar", "Semi-hollow guitar", "Guitarforstærker",
        "Effektpedal", "Tilbehør til guitar", "Elektrisk bas", "Akustisk bas",
        "Kontrabas", "Basforstærker", "Tilbehør til bas", "Andet"
    ];

    return (
        <GetGearForm
            gearType="guitar og bas"
            apiEndpoint={`${config.apiBaseUrl}/api/GuitBassGear`}
            categories={categories}
            gearTypeKey="guitBassType"
        />
    );
}

export default GetGuitBassGear;