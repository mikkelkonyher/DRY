import React, { useState } from 'react';
import config from "../../../config.jsx";

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
            setMessage(data.Message || 'Password reset link has been sent to your email.');
        } catch (err) {
            console.error('Error:', err);
            setMessage(err.message || 'Error sending password reset link.');
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
