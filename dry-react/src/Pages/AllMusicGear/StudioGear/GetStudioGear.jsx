import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetStudioGear() {
    const categories = [
        "Mikrofon", "Studie monitors", "Høretelefoner", "Lydkort", "For-forstærker",
        "Effektprocessor", "Studiesoftware", "Controllere", "Mixer", "Studieakustik-elementer",
        "Studiemøbler", "Midi-udstyr", "Andet"
    ];

    return (
        <GetGearForm
            gearType="studie gear"
            apiEndpoint={`${config.apiBaseUrl}/api/StudioGear`}
            categories={categories}
            gearTypeKey="studioGearType"
        />
    );
}

export default GetStudioGear;