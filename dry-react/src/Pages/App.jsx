import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateGuitBassGear from './GuitBassGear/CreateGuitBassGear.jsx';
import GetGuitBassGear from './GuitBassGear/GetGuitBassGear.jsx';

function App() {
    return (
        <Router>
            <nav>
                <ul>
                    <li><Link to="/create-guitar">Create Guitar</Link></li>
                    <li><Link to="/get-guitar">Get Guitars</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/create-guitar" element={<CreateGuitBassGear />} />
                <Route path="/get-guitar" element={<GetGuitBassGear />} />
            </Routes>
        </Router>
    );
}

export default App;