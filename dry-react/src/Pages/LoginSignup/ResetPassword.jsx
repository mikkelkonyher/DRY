import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from "../../../config.jsx";

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/Auth/reset-password`, { token, newPassword });
            setMessage(response.data.Message || 'Password has been reset successfully.');
        } catch (err) {
            setMessage(err.response?.data?.Message || 'Error resetting password.');
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Reset Password</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;