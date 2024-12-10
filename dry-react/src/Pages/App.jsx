import { Route, Routes } from 'react-router-dom';
import CreateGuitBassGear from "./AllMusicGear/GuitBassGear/CreateGuitBassGear.jsx";
import GetGuitBassGear from "./AllMusicGear/GuitBassGear/GetGuitBassGear.jsx";
import CreateDrumsGear from "./AllMusicGear/DrumsGear/CreateDrumsGear.jsx";
import GetDrumsGear from "./AllMusicGear/DrumsGear/GetDrumsGear.jsx";
import CreateStudioGear from "./AllMusicGear/StudioGear/CreateStudioGear.jsx";
import GetStudioGear from "./AllMusicGear/StudioGear/GetStudioGear.jsx";
import CreateKeysGear from ".//AllMusicGear/KeysGear/CreateKeysGear.jsx";
import GetKeysGear from "./AllMusicGear/KeysGear/GetKeysGear.jsx";
import CreateStringsGear from "./AllMusicGear/StringsGear/CreateStringsGear.jsx";
import GetStringsGear from "./AllMusicGear/StringsGear/GetStringsGear.jsx";
import CreateHornsGear from "./AllMusicGear/HornsGear/CreateHornsGear.jsx";
import GetHornsGear from "./AllMusicGear/HornsGear/GetHornsGear.jsx";
import CardDetails from "./Forms/CardDetails.jsx";
import ResponsiveAppBar from './FooterHeader/Navbar';
import Box from '@mui/material/Box';
import Home from "./Home.jsx";
import Login from './LoginSignup/Login.jsx';
import Signup from "./LoginSignup/Signup.jsx";
import ForgotPassword from "./LoginSignup/ForgotPassword.jsx";
import ResetPassword from "./LoginSignup/ResetPassword.jsx";
import MyProfile from "./User/MyProfile.jsx";
import Footer from "./FooterHeader/Footer.jsx";
import SearchResults from "./FooterHeader/SearchResults.jsx";
import GetRehearsalRoomForm from "./Forms/GetRehearsalRoomForm.jsx";
import RehearsalRoomDetails from "./Forms/RehearsalRoomDetails.jsx";


function App() {
    return (
        <>
            <ResponsiveAppBar />
            <Box sx={{ marginTop: '84px', padding: '20px' }}>
                <Routes>
                    <Route path="/SellGuiBassGear" element={<CreateGuitBassGear />} />
                    <Route path="/SellDrumsGear" element={<CreateDrumsGear />} />
                    <Route path="/SellStudioGear" element={<CreateStudioGear />} />
                    <Route path="/SellKeysGear" element={<CreateKeysGear />} />
                    <Route path="/SellStringsGear" element={<CreateStringsGear />} />
                    <Route path="/SellHornsGear" element={<CreateHornsGear />} />
                    <Route path="/GuitBass" element={<GetGuitBassGear />} />
                    <Route path="/Trommer" element={<GetDrumsGear />} />
                    <Route path="/Studiogear" element={<GetStudioGear />} />
                    <Route path="/Strygere" element={<GetStringsGear />} />
                    <Route path="/Keys" element={<GetKeysGear />} />
                    <Route path="/Blæsere" element={<GetHornsGear />} />
                    <Route path="/gear/:id" element={<CardDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />}/>
                    <Route path="/myprofile" element={<MyProfile />} />
                    <Route path="/search-results" element={<SearchResults />} />
                    <Route path="/rehearsal-rooms" element={<GetRehearsalRoomForm />} />
                    <Route path="/RehearsalRoomDetails/:id" element={<RehearsalRoomDetails />} />
                </Routes>
            </Box>

            <Footer />
        </>
    );
}

export default App;