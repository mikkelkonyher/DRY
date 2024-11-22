import React from 'react';
import GetGearForm from '../../Forms/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetStudioGear() {
    const categories = [
        "Mikrofon", "Studie Monitors", "Høretelefoner", "Lydkort", "For-forstærker",
        "Effekprocessor", "Studiesoftware", "Controllere", "Mixerpult", "Studieakustik-elementer",
        "Studie møbler", "Midi-udstyr", "Andet"
    ];

    return (
        <GetGearForm
            gearType="Studio Gear"
            apiEndpoint={`${config.apiBaseUrl}/api/StudioGear`}
            categories={categories}
            gearTypeKey="studioGearType"
        />
    );
}

export default GetStudioGear;