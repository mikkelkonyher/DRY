import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGuitBassGear from './Pages/GuitBassGear/CreateGuitBassGear.jsx';
import GetGuitBassGear from './Pages/GuitBassGear/GetGuitBassGear.jsx';
import CreateDrumsGear from "./Pages/DrumsGear/CreateDrumsGear.jsx";
import GetDrumsGear from "./Pages/DrumsGear/GetDrumsGear.jsx";
import ResponsiveAppBar from './Pages/FooterHeader/Navbar';
import './index.css';
import Box from '@mui/material/Box';
import Home from './Pages/Home/';
import Login from './Pages/LoginSignup/Login.jsx';
import Signup from "./Pages/LoginSignup/Signup.jsx";
import { checkToken } from './authUtils';

function Main() {
    useEffect(() => {
        checkToken();
    }, []);

    return (
        <Router>
            <ResponsiveAppBar />
            <Box sx={{ marginTop: '84px', padding: '20px' }}>
                <Routes>
                    <Route path="/SellGuiBassGear" element={<CreateGuitBassGear />} />
                    <Route path="/GuitBass" element={<GetGuitBassGear />} />
                    <Route path="/SellDrumsGear" element={<CreateDrumsGear />} />
                    <Route path="/Trommer" element={<GetDrumsGear />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </Box>
        </Router>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Main />
    </StrictMode>,
);