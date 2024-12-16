import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateKeysGear() {
    const categories = [
        "Synthsizere", "Keyboards", "Klaverer", "Stage Pianos", "Flygler",
        "Orgler", "Akkordeons", "Tilbehør til keys", "Andet"
    ];

    return <GearForm gearType="Keys Gear" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/KeysGear`} />;
}

export default CreateKeysGear;