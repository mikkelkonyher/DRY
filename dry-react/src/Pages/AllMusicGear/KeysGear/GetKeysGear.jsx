import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetKeysGear() {
    const categories = [
        "Synthesizer", "Keyboard", "Klaver", "Stage piano", "Flygel",
        "Orgel", "Akkordeon","Andet"
    ];

    return (
        <GetGearForm
            gearType="keys"
            apiEndpoint={`${config.apiBaseUrl}/api/KeysGear`}
            categories={categories}
            gearTypeKey="keysGearType"
        />
    );
}

export default GetKeysGear;