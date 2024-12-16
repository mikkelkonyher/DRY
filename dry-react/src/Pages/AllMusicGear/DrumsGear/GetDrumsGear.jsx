import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import './GetDrumsGear.css';
import config from "../../../../config.jsx";

function GetDrumsGear() {
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Trommeudstyr"
            apiEndpoint={`${config.apiBaseUrl}/api/DrumsGear`}
            categories={categories}
            gearTypeKey="drumsGearType"
        />
    );
}

export default GetDrumsGear;