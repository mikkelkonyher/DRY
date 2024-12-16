import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateStringsGear() {
    const categories = [
        "Violin/Viola", "Cello", "Kontrabas", "Elektrisk Violin", "Elektrisk Cello",
        "Elektrisk Kontrabas", "Tilbehør til violin og viola", "Tilbehør til cello",
        "Tilbehør til kontrabas", "Andet"
    ];

    return <GearForm gearType="Strygere" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/StringsGear`} />;
}

export default CreateStringsGear;