import React from 'react';
import { Link } from 'react-router-dom';
import './SellGear.css';

function SellGear() {
    return (
        <div className="sell-gear-container">
            <h2>Vælg en kategori</h2>
            <ul>
                <li><Link to="/SellGuiBassGear">🎸 - Guitar & bas</Link></li>
                <li><Link to="/SellDrumsGear">🥁 - Trommer</Link></li>
                <li><Link to="/SellStudioGear">🎤 - Studiegear</Link></li>
                <li><Link to="/SellKeysGear">🎹 - Keyboards</Link></li>
                <li><Link to="/SellStringsGear">🎻 - Strygere</Link></li>
                <li><Link to="/SellHornsGear">🎷 - Blæs</Link></li>
                <li><Link to ="/CreateRehearsalRoom">🏠 - Øvelokale & studie</Link></li>
            </ul>
        </div>
    );
}

export default SellGear;