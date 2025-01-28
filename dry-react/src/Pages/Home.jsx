import React, { useEffect, useState } from 'react';
import './Home.css';
import config from '../../config.jsx';
import HomeGearCard from "./HomeGearCard.jsx";
import heroImage from '../assets/Hero_itt2.png';
import { Link } from 'react-router-dom';
import RehearsalRoomCard from "./Forms/RehearsalRoom/RehearsalRoomCard.jsx";
import SkeletonLoader from './SkeletonLoader.jsx';
import HomeRehearsalRoomCard from "./HomeRehearsalRoomCard.jsx";

function Home() {
    const [musicGear, setMusicGear] = useState([]);
    const [rehearsalRooms, setRehearsalRooms] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        };

        const fetchRehearsalRooms = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRehearsalRooms(data.items);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching rehearsal rooms:', error);
                setLoading(false);
            }
        };

        fetchAllMusicGear();
        fetchRehearsalRooms();
    }, []);

    // Sort music gear by favoriteCount in descending order
    const sortedMusicGear = [...musicGear].sort((a, b) => b.favoriteCount - a.favoriteCount);

    return (
        <div className="home-container">
            <div className="hero-container" style={{backgroundImage: `url(${heroImage})`}}>
                <div className="hero-box">
                    <h1>Gør dit gear til guld</h1>
                    <Link to="/sell-gear" className="hero-button">Upload en artikel nu</Link>
                </div>
            </div>
            <h2>Populære artikler</h2>
            <div className="carousel-container">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
                ) : (
                    sortedMusicGear.map((item) => (
                        <HomeGearCard key={item.id} item={item}/>
                    ))
                )}
            </div>
            <h2>Senest tilføjede artikler</h2>
            <div className="carousel-container">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
                ) : (
                    musicGear.map((item) => (
                        <HomeGearCard key={item.id} item={item}/>
                    ))
                )}
            </div>
            <h2>Find dit nye øvelokale eller studie</h2>
            <div className="carousel-container">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
                ) : (
                    rehearsalRooms.map((item) => (
                        <HomeRehearsalRoomCard key={item.id} item={item}/>
                    ))
                )}
            </div>
        </div>
    );
}

export default Home;