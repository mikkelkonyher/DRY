import React from 'react';
import { Link } from 'react-router-dom';
import './SellGear.css';

function SellGear() {
    return (
        <div className="sell-gear-container">
            <h2>Vælg en kategori for at sælge dit gear</h2>
            <ul>
                <li><Link to="/SellGuiBassGear">Sælg Guitar/Bass Gear</Link></li>
                <li><Link to="/SellDrumsGear">Sælg Trommer Gear</Link></li>
                <li><Link to="/SellStudioGear">Sælg Studio Gear</Link></li>
                <li><Link to="/SellKeysGear">Sælg Keys Gear</Link></li>
                <li><Link to="/SellStringsGear">Sælg Strygere Gear</Link></li>
                <li><Link to="/SellHornsGear">Sælg Blæsere Gear</Link></li>
            </ul>
        </div>
    );
}

export default SellGear;