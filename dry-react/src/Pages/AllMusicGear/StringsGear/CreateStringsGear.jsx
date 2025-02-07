import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateStringsGear() {
    const categories = [
        "Violin/viola", "Cello", "Kontrabas", "Elektrisk violin", "Elektrisk cello",
        "Elektrisk kontrabas", "Tilbehør til violin og viola", "Tilbehør til cello",
        "Tilbehør til kontrabas", "Andet"
    ];

    return <GearForm gearType="strygere" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/StringsGear`} />;
}

export default CreateStringsGear;