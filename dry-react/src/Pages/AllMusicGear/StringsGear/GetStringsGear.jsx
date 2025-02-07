import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetStringsGear() {
    const categories = [
        "Violin/viola", "Cello", "Kontrabas", "Elektrisk violin", "Elektrisk cello",
        "Elektrisk kontrabas", "Tilbehør til violin og viola", "Tilbehør til cello",
        "Tilbehør til kontrabas", "Andet"
    ];

    return (
        <GetGearForm
            gearType="strygere"
            apiEndpoint={`${config.apiBaseUrl}/api/StringsGear`}
            categories={categories}
            gearTypeKey="stringsGearType"
        />
    );
}

export default GetStringsGear;