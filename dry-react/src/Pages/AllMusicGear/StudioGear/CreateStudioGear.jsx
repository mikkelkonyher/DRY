import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateStudioGear() {
    const categories = [
        "Mikrofon", "Studie Monitors", "Høretelefoner", "Lydkort", "For-forstærker",
        "Effekprocessor", "Studiesoftware", "Controllere", "Mixerpult", "Studieakustik-elementer",
        "Studie møbler", "Midi-udstyr", "Andet"
    ];

    return <GearForm gearType="Studie Gear" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/StudioGear`} />;
}

export default CreateStudioGear;