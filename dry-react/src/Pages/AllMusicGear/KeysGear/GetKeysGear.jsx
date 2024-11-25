import React from 'react';
import GetGearForm from '../../Forms/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetKeysGear() {
    const categories = [
        "Synthsizere", "Keyboards", "Klaverer", "Stage Pianos", "Flygler",
        "Orgler", "Akkordeons", "tilbehør til klaverer og flygler", "andet"
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