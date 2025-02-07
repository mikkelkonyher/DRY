import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateKeysGear() {
    const categories = [
        "Synthesizer", "Keyboard", "Klaver", "Stage piano", "Flygel",
        "Orgel", "Akkordeon","Andet"
    ];

    return <GearForm gearType="keys" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/KeysGear`} />;
}

export default CreateKeysGear;