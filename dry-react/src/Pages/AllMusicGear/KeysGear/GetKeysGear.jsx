import React from 'react';
import GetGearForm from '../../Forms/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetKeysGear() {
    const categories = [
        "Synthsizere", "Keyboards", "Klaverer", "Stage Pianos", "Flygler",
        "Orgler", "Akkordeons", "Tilbehør til klaverer og flygler", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Keys Gear"
            apiEndpoint={`${config.apiBaseUrl}/api/KeysGear`}
            categories={categories}
            gearTypeKey="keysGearType"
        />
    );
}

export default GetKeysGear;