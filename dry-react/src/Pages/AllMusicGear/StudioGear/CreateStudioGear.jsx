import React from 'react';
import GearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateStudioGear() {
    const categories = [
        "Mikrofon", "Studie monitors", "Høretelefoner", "Lydkort", "For-forstærker",
        "Effektprocessor", "Studiesoftware", "Controllere", "Mixer", "Studieakustik-elementer",
        "Studiemøbler", "Midi-udstyr", "Andet"
    ];

    return <GearForm gearType="studie gear" categories={categories} apiEndpoint={`${config.apiBaseUrl}/api/StudioGear`} />;
}

export default CreateStudioGear;