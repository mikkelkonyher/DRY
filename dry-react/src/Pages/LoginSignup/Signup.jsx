import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import config from "../../../config.jsx";
import HowToRegIcon from '@mui/icons-material/HowToReg';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const modalRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCheckboxChange = (e) => {
        setTermsAccepted(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termsAccepted) {
            setErrorMessage('Du skal acceptere vilkårene og betingelserne.');
            return;
        }
        if (formData.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            const signupResponse = await fetch(`${config.apiBaseUrl}/api/Auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
                credentials: 'include' // Ensure cookies are sent and received
            });

            if (signupResponse.status === 400) {
                const errorData = await signupResponse.json();
                setErrorMessage(errorData.message);
                return;
            }

            if (!signupResponse.ok) {
                setErrorMessage('Signup failed. Please try again.');
                throw new Error('Network response was not ok');
            }

            setSuccessMessage('Brugeroprettelse vellykket! Tjek venligst din e-mail for at bekræfte din konto.');
            setErrorMessage('');
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Error during signup:', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
            setIsSuccessModalOpen(false);
        }
    };

    useEffect(() => {
        if (isModalOpen || isSuccessModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen, isSuccessModalOpen]);

    return (
        <div className="signup-body">
            <div className="signup-container">
                <div className="signup-header">
                    <h2>Opret bruger</h2>
                    <HowToRegIcon />
                </div>
                <form className="signup-form" onSubmit={handleSubmit}>
                    {errorMessage && <p className="signup-error-message">{errorMessage}</p>}
                    <label htmlFor="name" className="signup-label">Brugernavn*</label>
                    <input
                        type="text"
                        name="name"
                        className="signup-input"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Brugernavn"
                        required
                    />
                    <label htmlFor="email" className="signup-label">Emailadresse*</label>
                    <input
                        type="email"
                        name="email"
                        className="signup-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Indtast email"
                        required
                    />
                    <label htmlFor="password" className="signup-label">Adgangskode*</label>
                    <input
                        type="password"
                        name="password"
                        className="signup-input"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Adgangskode"
                        minLength="8"
                        required
                    />
                    <label htmlFor="confirmPassword" className="signup-label">Bekræft adgangskode*</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="signup-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Bekræft adgangskode"
                        required
                    />
                    <label className="signup-label">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={handleCheckboxChange}
                        />
                        Jeg accepterer <span onClick={() => setIsModalOpen(true)} style={{color: 'white', textDecoration: 'underline', cursor: 'pointer'}}>vilkår og betingelser</span>.
                    </label>
                    <button type="submit" className="signup-button">Opret bruger</button>
                </form>
            </div>
            {isModalOpen && (
                <div className="signup-modal" ref={modalRef}>
                    <div className="signup-modal-content">
                        <span className="signup-close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Vilkår og betingelser</h2>
                        <p className="signup-terms-text">
                            1. Generelt<br />
                            Disse vilkår og betingelser gælder for brugen af GearNinja.dk. Ved at benytte vores tjenester accepterer du at overholde disse vilkår. Hvis du ikke accepterer vilkårene, skal du stoppe med at bruge tjenesten.<br /><br />
                            2. Brug af tjenesten<br />
                            GearNinja.dk er en platform, der faciliterer kommunikation mellem brugere. Du må kun bruge tjenesten til lovlige formål og på måder, der ikke skader tjenesten eller andre brugere. Vi forbeholder os retten til at suspendere eller lukke din konto, hvis du overtræder disse vilkår.<br /><br />
                            3. Brugeraftaler og betalinger<br />
                            GearNinja.dk påtager sig ikke noget ansvar for aftaler om betalinger, køb eller salg af varer og tjenester mellem brugere. Alle betalinger og aftaler skal aftales direkte mellem brugerne. Vi anbefaler, at du tager de nødvendige forholdsregler for at sikre, at disse aftaler gennemføres på en sikker måde.<br /><br />
                            4. Brugeroplysninger<br />
                            Du er ansvarlig for at beskytte dine brugeroplysninger, og du skal sikre, at de er korrekte og opdaterede. GearNinja.dk er ikke ansvarlig for eventuelle problemer, der opstår som følge af falske eller misbrugte oplysninger. Del kun oplysninger med andre brugere, som du er tryg ved.<br /><br />
                            5. Ophavsret<br />
                            Alt indhold på GearNinja.dk, herunder tekst, billeder og andre materialer, er beskyttet af ophavsret. Du må ikke kopiere, distribuere eller på anden måde bruge indholdet uden forudgående tilladelse.<br /><br />
                            6. Ansvarsfraskrivelse<br />
                            GearNinja.dk leverer tjenesten “som den er”, og vi påtager os ikke ansvar for fejl, mangler eller andre problemer, der måtte opstå som følge af brug af tjenesten eller aftaler mellem brugere. Vi er heller ikke ansvarlige for betalinger eller leverancer relateret til de aftaler, der indgås mellem brugere.<br /><br />
                            7. Ændringer<br />
                            GearNinja.dk forbeholder sig retten til at ændre disse vilkår og betingelser. Ændringer træder i kraft, når de offentliggøres på denne side, og det er brugerens ansvar at holde sig opdateret på eventuelle ændringer.<br /><br />
                            8. Lovgivning<br />
                            Disse vilkår og betingelser er underlagt dansk lovgivning, og eventuelle tvister skal afgøres ved domstolene i Danmark.<br /><br />
                            9. Kontakt<br />
                            Hvis du har spørgsmål til disse vilkår og betingelser, kan du kontakte GearNinja.dk på Support@GearNinja.dk.
                        </p>
                    </div>
                </div>
            )}
            {isSuccessModalOpen && (
                <div className="signup-modal" ref={modalRef}>
                    <div className="signup-modal-content">
                        <span className="signup-close" onClick={() => setIsSuccessModalOpen(false)}>&times;</span>
                        <h2>Success</h2>
                        <p className="signup-success-message">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;