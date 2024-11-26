import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import LoginIcon from '@mui/icons-material/Login';
import config from "../../../config.jsx";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.apiBaseUrl}/api/Auth/login`, { email, password });
            localStorage.setItem('token', response.data.token);
            setSuccess('Login successful!');
            setError('');
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError('Forkert email eller adgangskode, eller bruger er ikke bekræftet.');
            setSuccess('');
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-h2">Login <LoginIcon /> </h2>
            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="login-form-group">
                    <label htmlFor="email" className="login-label">Email Adresse</label>
                    <input
                        placeholder={'Indtast email'}
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>
                <div className="login-form-group">
                    <label htmlFor="password" className="login-label">Adgangskode</label>
                    <input
                        placeholder={'Indtast adgangskode'}
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
            <p className="signup-text">
                <Link to="/signup" className="signup-link">Signup</Link>
            </p>
            <p className="forgot-password-text">
                <Link to="/forgot-password" className="forgot-password-link">Glemt adgangskode?</Link>
            </p>
        </div>
    );
};

export default Login;