import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateGuitar from './Pages/Guitar/CreateGuitar';
import GetGuitar from './Pages/Guitar/GetGuitar';
import ResponsiveAppBar from './Pages/FooterHeader/Navbar';
import './index.css';
import Box from '@mui/material/Box';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <ResponsiveAppBar />
            <Box sx={{ marginTop: '84px', padding: '20px' }}> {/* Adjust marginTop based on AppBar height */}
                <Routes>
                    <Route path="/create-guitar" element={<CreateGuitar />} />
                    <Route path="/get-guitar" element={<GetGuitar />} />
                </Routes>
            </Box>
        </Router>
    </StrictMode>,
);