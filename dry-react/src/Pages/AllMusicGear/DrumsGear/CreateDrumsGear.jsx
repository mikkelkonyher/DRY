import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import './CreateDrumsGear.css';
import config from "../../../../config.jsx";

function CreateDrumsGear() {
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
    ];

    return <GearForm gearType="Trommeudstyr" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/DrumsGear`}/>;
}

export default CreateDrumsGear;