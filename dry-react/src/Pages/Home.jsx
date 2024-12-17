import React, { useEffect, useState } from 'react';
import './Home.css';
import config from '../../config.jsx';
import HomeGearCard from "./HomeGearCard.jsx";
import heroImage from '../assets/Hero_itt2.png';
import { Link } from 'react-router-dom';

function Home() {
    const [musicGear, setMusicGear] = useState([]);

    useEffect(() => {
        const fetchAllMusicGear = async () => {
            let allItems = [];
            let pageNumber = 1;
            let totalItems = 0;

            do {
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/MusicGear?pageNumber=${pageNumber}&pageSize=10`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    totalItems = data.totalItems;
                    allItems = allItems.concat(data.items);
                    pageNumber++;
                } catch (error) {
                    console.error('Error fetching music gear:', error);
                    break;
                }
            } while (allItems.length < totalItems);

            setMusicGear(allItems);
        };

        fetchAllMusicGear();
    }, []);

    // Sort music gear by favoriteCount in descending order
    const sortedMusicGear = [...musicGear].sort((a, b) => b.favoriteCount - a.favoriteCount);

    return (
        <div className="home-container">
            <div className="hero-container" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="hero-box">
                    <h1>Gør dit gear til guld</h1>
                    <Link to="/sell-gear" className="hero-button">Upload en artikel nu</Link>
                </div>
            </div>
            <h2>Populære artikler</h2>
            <div className="carousel-container">
                {sortedMusicGear.map((item) => (
                    <HomeGearCard key={item.id} item={item}/>
                ))}
            </div>
            <h2>Senest tilføjede artikler</h2>
            <div className="carousel-container">
                {musicGear.map((item) => (
                    <HomeGearCard key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}

export default Home;