import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateGuitar from '../Pages/Guitar/CreateGuitar';
import GetGuitar from '../Pages/Guitar/GetGuitar';

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
                <Route path="/create-guitar" element={<CreateGuitar />} />
                <Route path="/get-guitar" element={<GetGuitar />} />
            </Routes>
        </Router>
    );
}

export default App;