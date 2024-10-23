import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGuitBassGear from './Pages/GuitBassGear/CreateGuitBassGear.jsx';
import GetGuitBassGear from './Pages/GuitBassGear/GetGuitBassGear.jsx';
import CreateDrumsGear from "./Pages/DrumsGear/CreateDrumsGear.jsx";
import ResponsiveAppBar from './Pages/FooterHeader/Navbar';
import './index.css';
import Box from '@mui/material/Box';
import Home from './Pages/Home/';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <ResponsiveAppBar />
            <Box sx={{ marginTop: '84px', padding: '20px' }}> {/* Adjust marginTop based on AppBar height */}
                <Routes>
                    <Route path="/SellGuiBassGear" element={<CreateGuitBassGear />} />
                    <Route path="/GuiBass" element={<GetGuitBassGear />} />
                    <Route path="/SellDrumsGear" element={<CreateDrumsGear />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </Box>
        </Router>
    </StrictMode>,
);