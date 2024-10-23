import React, { useEffect, useState } from 'react';
import GetGearForm from '../Forms/GetGearForm.jsx';
import './GetDrumsGear.css';

function GetDrumsGear() {
    const [gearData, setGearData] = useState([]);
    const categories = [
        "Akustiske Trommer", "Elektroniske Trommer", "Lilletromme", "Stortromme", "Tamtammer", "Bækkener",
        "Trommehardware", "Slagtøj", "Trommetilbehør", "Andet"
    ];

    useEffect(() => {
        const fetchGearData = async () => {
            try {
                const response = await fetch('https://localhost:7064/api/DrumsGear');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGearData(data);
            } catch (error) {
                console.error('Error fetching gear data:', error);
            }
        };

        fetchGearData();
    }, []);

    return <GetGearForm gearType="Trommeudstyr" categories={categories} gearData={gearData} />;
}

export default GetDrumsGear;