import React from 'react';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Velkommen til GearNinja <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"
                                             viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M7.75 13c-.01-.35.15-.69.42-.92c.75.16 1.45.47 2.08.92c0 .68-.56 1.24-1.25 1.24S7.76 13.69 7.75 13m6 0c.63-.44 1.33-.75 2.08-.91c.27.23.43.57.42.91c0 .7-.56 1.26-1.25 1.26s-1.25-.56-1.25-1.26M12 9c-2.77-.04-5.5.65-7.93 2L4 12c0 1.23.29 2.44.84 3.54a47.6 47.6 0 0 1 14.32 0c.55-1.1.84-2.31.84-3.54l-.07-1A15.85 15.85 0 0 0 12 9m0-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2"></path>
            </svg></h1>
            <p>Køb og salg af brugt musikudstyr, studiogear og meget mere. Her kan du finde alt, hvad du har brug for
                som musiker, fra udstyr til tjenester som mix og mastering. Opret eller find annoncer for
                musikundervisning, og del din viden med andre. Har du et øvelokale til udlejning, eller søger du selv et
                sted at øve? Her kan du nemt finde eller udleje øvelokaler, eller dele et rum med andre musikere. Vores
                platform forbinder musikere, teknikere og undervisere på ét sted.</p>
        </div>
    );
}

export default Home;