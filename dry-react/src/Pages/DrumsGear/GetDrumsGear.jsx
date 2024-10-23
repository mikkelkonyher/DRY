import React from 'react';
import GetGearForm from '../Forms/GetGearForm.jsx';
import './GetDrumsGear.css';

function GetDrumsGear() {
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Trommeudstyr"
            apiEndpoint="https://localhost:7064/api/DrumsGear"
            categories={categories}
            gearTypeKey="drumsGearType"
        />
    );
}

export default GetDrumsGear;