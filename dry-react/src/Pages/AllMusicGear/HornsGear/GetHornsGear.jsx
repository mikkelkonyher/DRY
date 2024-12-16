import React from 'react';
import GetGearForm from '../../Forms/Gear/GetGearForm.jsx';
import config from "../../../../config.jsx";

function GetHornsGear() {
    const categories = [
        "Altsaxofon", "Barytonsaxofon", "Tenorsaxofon", "Sopransaxofon", "Trompet", "Klarinet", "Flygelhorn", "Horn", "Basun",
        "Tenorhorn", "Baryton", "Alt-/Barytonhorn", "Tuba", "Obo", "Fagot",
        "Tværfløjte", "Blokfløjte", "Mundharmonika", "Melodica",
        "Tilbehør til blæseinstrumenter"
    ];

    return (
        <GetGearForm
            gearType="Blæseinstrumenter"
            apiEndpoint={`${config.apiBaseUrl}/api/HornsGear`}
            categories={categories}
            gearTypeKey="hornsGearType"
        />
    );
}

export default GetHornsGear;