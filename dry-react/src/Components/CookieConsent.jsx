import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './CookieConsent.css';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = Cookies.get('necessaryCookiesConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set('necessaryCookiesConsent', 'true', { expires: 365 });
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-consent-banner">
            <p>Accepter nødvendige cookies.</p>
            <button onClick={handleAccept}>Accepter</button>
        </div>
    );
};

export default CookieConsent;