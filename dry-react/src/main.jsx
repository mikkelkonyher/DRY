import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGuitBassGear from './Pages/AllMusicGear/GuitBassGear/CreateGuitBassGear.jsx';
import GetGuitBassGear from './Pages/AllMusicGear/GuitBassGear/GetGuitBassGear.jsx';
import CreateDrumsGear from "./Pages/AllMusicGear/DrumsGear/CreateDrumsGear.jsx";
import GetDrumsGear from "./Pages/AllMusicGear/DrumsGear/GetDrumsGear.jsx";
import CreateStudioGear from "./Pages/AllMusicGear/StudioGear/CreateStudioGear.jsx";
import GetStudioGear from "./Pages/AllMusicGear/StudioGear/GetStudioGear.jsx";
import CreateKeysGear from "./Pages/AllMusicGear/KeysGear/CreateKeysGear.jsx";
import GetKeysGear from "./Pages/AllMusicGear/KeysGear/GetKeysGear.jsx";
import CreateStringsGear from "./Pages/AllMusicGear/StringsGear/CreateStringsGear.jsx";
import GetStringsGear from "./Pages/AllMusicGear/StringsGear/GetStringsGear.jsx";
import ResponsiveAppBar from './Pages/FooterHeader/Navbar';
import './index.css';
import Box from '@mui/material/Box';
import Home from './Pages/Home/';
import Login from './Pages/LoginSignup/Login.jsx';
import Signup from "./Pages/LoginSignup/Signup.jsx";
import { checkToken } from './authUtils';
import ForgotPassword from "./Pages/LoginSignup/ForgotPassword.jsx";
import ResetPassword from "./Pages/LoginSignup/ResetPassword.jsx";
import MyProfile from "./Pages/User/MyProfile.jsx";

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
                    <Route path="/SellDrumsGear" element={<CreateDrumsGear />} />
                    <Route path="/SellStudioGear" element={<CreateStudioGear />} />
                    <Route path="/SellKeysGear" element={<CreateKeysGear />} />
                    <Route path="/SellStringsGear" element={<CreateStringsGear />} />
                    <Route path="/GuitBass" element={<GetGuitBassGear />} />
                    <Route path="/Trommer" element={<GetDrumsGear />} />
                    <Route path="/Studiogear" element={<GetStudioGear />} />
                    <Route path="/Strygere" element={<GetStringsGear />} />
                    <Route path="/Keys" element={<GetKeysGear />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />}/>
                    <Route path="/myprofile" element={<MyProfile />} />
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