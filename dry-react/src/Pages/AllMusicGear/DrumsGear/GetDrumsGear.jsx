import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetDrumsGear() {
    const categories = [
        "Akustiske trommer", "Elektroniske trommer", "Lilletromme", "Stortromme","Bækkener",
        "Hardware", "Trommetilbehør", "Andet"
    ];

    return (
        <GetGearForm
            gearType="trommer"
            apiEndpoint={`${config.apiBaseUrl}/api/DrumsGear`}
            categories={categories}
            gearTypeKey="drumsGearType"
        />
    );
}

export default GetDrumsGear;