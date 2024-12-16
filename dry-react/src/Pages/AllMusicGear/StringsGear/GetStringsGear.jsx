import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetStringsGear() {
    const categories = [
        "Violin/Viola", "Cello", "Kontrabas", "Elektrisk Violin", "Elektrisk Cello",
        "Elektrisk Kontrabas", "Tilbehør til violin og viola", "Tilbehør til cello",
        "Tilbehør til kontrabas", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Strygere"
            apiEndpoint={`${config.apiBaseUrl}/api/StringsGear`}
            categories={categories}
            gearTypeKey="stringsGearType"
        />
    );
}

export default GetStringsGear;