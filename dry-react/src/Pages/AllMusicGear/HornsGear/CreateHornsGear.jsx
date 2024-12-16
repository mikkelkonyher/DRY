import React from 'react';
import CreateGearForm from '../../Forms/Gear/GearForm.jsx';
import config from "../../../../config.jsx";

function CreateHornsGear() {
    const categories = [
        "Altsaxofon", "Barytonsaxofon", "Tenorsaxofon", "Sopransaxofon", "Trompet", "Klarinet", "Flygelhorn", "Horn", "Basun",
        "Tenorhorn", "Baryton", "Alt-/Barytonhorn", "Tuba", "Obo", "Fagot",
        "Tværfløjte", "Blokfløjte", "Mundharmonika", "Melodica",
        "Tilbehør til blæseinstrumenter"
    ];

    return (
        <CreateGearForm
            gearType="Blæseinstrumenter"
            apiEndpoint={`${config.apiBaseUrl}/api/HornsGear`}
            categories={categories}
            gearTypeKey="hornsGearType"
        />
    );
}

export default CreateHornsGear;