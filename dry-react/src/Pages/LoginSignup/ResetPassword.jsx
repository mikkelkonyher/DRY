import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from "../../../config.jsx";
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Adgangskoderne stemmer ikke overens.');
            setIsError(true);
            return;
        }
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/Auth/reset-password`, { token, newPassword });
            setMessage(response.data.Message || 'Adgangskode er blevet ændret.');
            setIsError(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage(err.response?.data?.Message || 'Error resetting password.');
            setIsError(true);
        }
    };

    return (
        <div className="reset-password-container">
            <h2 className="reset-password-title">Ændre adgangskode</h2>
            {message && <p className="reset-password-message" style={{ color: isError ? 'red' : 'green' }}>{message}</p>}
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newPassword" className="reset-password-label">Ny adgangskode</label>
                    <input
                        placeholder={'Indtast ny adgangskode'}
                        type="password"
                        id="newPassword"
                        className="reset-password-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword" className="reset-password-label">Bekræft adgangskode</label>
                    <input
                        placeholder={'Bekræft ny adgangskode'}
                        type="password"
                        id="confirmPassword"
                        className="reset-password-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="reset-password-button">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;