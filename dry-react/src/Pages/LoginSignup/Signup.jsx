import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

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
            const signupResponse = await fetch('https://localhost:7064/api/Auth/signup', {
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
        <div className="auth-body">
            <div className="auth-container">
                <h2>Opret dig som Ninja!</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {successMessage && <p className="signup-success-message">{successMessage}</p>}
                    {errorMessage && <p className="auth-error-message">{errorMessage}</p>}

                    <input
                        type="text"
                        name="name"
                        className="auth-input"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Brugernavn"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        className="auth-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        className="auth-input"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        className="auth-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                    />
                    <button type="submit" className="auth-button">Signup</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;