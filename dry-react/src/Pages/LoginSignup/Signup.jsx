import React, { useState } from 'react';
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
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        } catch (error) {
            console.error('Error during signup:', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="signup-body">
            <div className="signup-container">
                <h2>Signup <HowToRegIcon/></h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    {successMessage && <p className="signup-success-message">{successMessage}</p>}
                    {errorMessage && <p className="signup-error-message">{errorMessage}</p>}
                    <label htmlFor="name" className="signup-label">Brugernavn</label>
                    <input
                        type="text"
                        name="name"
                        className="signup-input"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Brugernavn"
                        required
                    />
                    <label htmlFor="email" className="signup-label">Email adresse</label>
                    <input
                        type="email"
                        name="email"
                        className="signup-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Indtast email"
                        required
                    />
                    <label htmlFor="password" className="signup-label">Adgangskode</label>
                    <input
                        type="password"
                        name="password"
                        className="signup-input"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Adgangskode"
                        required
                    />
                    <label htmlFor="confirmPassword" className="signup-label">Bekræft adgangskode</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="signup-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Bekræft adgangskode"
                        required
                    />
                    <button type="submit" className="signup-button">Signup</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;