import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateGuitar from './Pages/Guitar/CreateGuitar';
import GetGuitar from './Pages/Guitar/GetGuitar';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <nav>
                <ul>
                    <li><Link to="/create-guitar">Opret Guitar</Link></li>
                    <li><Link to="/get-guitar">Se Guitar produkter</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/create-guitar" element={<CreateGuitar />} />
                <Route path="/get-guitar" element={<GetGuitar />} />
            </Routes>
        </Router>
    </StrictMode>,
);