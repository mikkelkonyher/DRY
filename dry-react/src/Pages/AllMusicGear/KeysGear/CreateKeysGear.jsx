import React from 'react';
import GearForm from '../../Forms/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateKeysGear() {
    const categories = [
        "Synthsizere", "Keyboards", "Klaverer", "Stage Pianos", "Flygler",
        "Orgler", "Akkordeons", "tilbehør til klaverer og flygler", "andet"
    ];

    return <GearForm gearType="Keys Gear" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/KeysGear`} />;
}

export default CreateKeysGear;