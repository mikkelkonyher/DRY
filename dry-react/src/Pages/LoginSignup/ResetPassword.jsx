import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import config from "../../../config.jsx";
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setErrorMessage('Adgangskode skal være mindst 8 tegn lang.');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(newPassword)) {
            setErrorMessage('Adgangskode skal indeholde mindst ét stort bogstav og ét specialtegn f.eks. #!+?');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Adgangskoderne stemmer ikke overens.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${config.apiBaseUrl}/api/Auth/reset-password`,
                { token, newPassword },
                { withCredentials: true }
            );

            setErrorMessage('');
            setSuccessMessage(response.data.Message || 'Adgangskode er blevet ændret.');
            setNewPassword('');
            setConfirmPassword('');
            navigate('/login');
        } catch (err) {
            setErrorMessage(err.response?.data?.Message || 'Error resetting password.');
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <h2 className="reset-password-title">Skift adgangskode</h2>
            {errorMessage && <p className="reset-password-message" style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p className="reset-password-message" style={{ color: 'green' }}>{successMessage}</p>}
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newPassword" className="reset-password-label">Ny adgangskode</label>
                    <input
                        placeholder="Indtast ny adgangskode"
                        type="password"
                        id="newPassword"
                        className="reset-password-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        maxLength="100"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword" className="reset-password-label">Bekræft adgangskode</label>
                    <input
                        placeholder="Bekræft ny adgangskode"
                        type="password"
                        id="confirmPassword"
                        className="reset-password-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="reset-password-button" disabled={loading}>
                    {loading ? 'Indlæser...' : 'Skift adgangskode'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;