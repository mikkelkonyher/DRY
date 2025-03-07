import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateDrumsGear() {
    const categories = [
        "Akustiske trommer", "Elektroniske trommer", "Lilletromme", "Stortromme","Bækkener",
        "Hardware", "Trommetilbehør", "Andet"
    ];

    return <GearForm gearType="trommer" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/DrumsGear`}/>;
}

export default CreateDrumsGear;