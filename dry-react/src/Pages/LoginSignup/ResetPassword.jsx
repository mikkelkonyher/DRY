import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from "../../../config.jsx";
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/Auth/reset-password`, { token, newPassword });
            setMessage(response.data.Message || 'Password has been reset successfully.');
            setNewPassword(''); // Clear the input box
        } catch (err) {
            setMessage(err.response?.data?.Message || 'Error resetting password.');
        }
    };

    return (
        <div className="reset-password-container">
            <h2 className="reset-password-title">Ændring af adgangskode</h2>
            {message && <p className="reset-password-message">{message}</p>}
            <form onSubmit={handleSubmit} className="reset-password-form">
                <div className="form-group">
                    <label htmlFor="newPassword" className="reset-password-label">Ny adganskode:</label>
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
                <button type="submit" className="reset-password-button">Ændre adganskode</button>
            </form>
        </div>
    );
};

export default ResetPassword;