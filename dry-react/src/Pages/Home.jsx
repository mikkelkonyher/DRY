import React, { useEffect, useState, useContext } from 'react';
import './Home.css';
import config from '../../config.jsx';
import HomeGearCard from "./HomeGearCard.jsx";
import SkeletonLoader from './SkeletonLoader.jsx';
import HomeRehearsalRoomCard from "./HomeRehearsalRoomCard.jsx";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SellIcon from '@mui/icons-material/Sell';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from "../AuthContext.jsx";

function Home() {
    const [popularMusicGear, setPopularMusicGear] = useState([]);
    const [latestMusicGear, setLatestMusicGear] = useState([]);
    const [rehearsalRooms, setRehearsalRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        const fetchPopularMusicGear = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/GetByFavoriteCount?pageNumber=1&pageSize=30`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(`Fetched ${data.items.length} popular music gear items`);
                setPopularMusicGear(data.items);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching popular music gear:', error);
                setLoading(false);
            }
        };

        const fetchLatestMusicGear = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear?pageNumber=1&pageSize=30`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(`Fetched ${data.items.length} latest music gear items`);
                setLatestMusicGear(data.items);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching latest music gear:', error);
                setLoading(false);
            }
        };

        const fetchRehearsalRooms = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom?pageNumber=1&pageSize=30`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(`Fetched ${data.items.length} rehearsal room items`);
                setRehearsalRooms(data.items);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching rehearsal rooms:', error);
                setLoading(false);
            }
        };

        fetchPopularMusicGear();
        fetchLatestMusicGear();
        fetchRehearsalRooms();
    }, []);

    return (
        <div className="home-container">
            <div className="headline-container">
                <h1 className="hero-text">
                    Fra din dojo til en ny mester
                </h1>

                <p className="subheadline">
                    Sælg dit gear og find dit næste våben!
                </p>
                <div className="landingpagebuttons">
                    {isAuthenticated ? (
                        <button className="sellgear-button" onClick={() => navigate('/sell-gear')}>
                            Upload en artikel nu <SellIcon className="icon-spacing" />
                        </button>
                    ) : (
                        <button className="opret-dig-button" onClick={() => navigate('/signup')}>
                            Opret profil <ArrowForwardIcon className="icon-spacing" />
                        </button>
                    )}
                </div>
            </div>
            <h2>Populære artikler</h2>
            <div className="carousel-container">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
                ) : (
                    popularMusicGear.map((item) => (
                        <HomeGearCard key={item.id} item={item}/>
                    ))
                )}
            </div>
            <h2>Senest tilføjede artikler</h2>
            <div className="carousel-container">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
                ) : (
                    latestMusicGear.map((item) => (
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