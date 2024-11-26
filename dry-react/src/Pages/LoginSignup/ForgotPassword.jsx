import React, { useState } from 'react';
import config from "../../../config.jsx";
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(email),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.Message || 'Network response was not ok';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setMessage(data.Message || 'Nulstillingslink er blevet sendt til din email.');
        } catch (err) {
            console.error('Error:', err);
            setMessage(err.message || 'Fejl ved sending af password reset link.');
        }
    };

    return (
        <div className="forgot-password-container">
            <h2 className="forgot-password-title">Nulstil Adgangskode</h2>
            {message && <p className="forgot-password-message">{message}</p>}
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="forgot-password-form-group">
                    <label htmlFor="email" className="forgot-password-label">Email Adresse</label>
                    <input
                        placeholder={'Indtast email'}
                        type="email"
                        id="email"
                        className="forgot-password-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="forgot-password-button">Send nulstillingslink</button>
            </form>
        </div>
    );
};

export default ForgotPassword;