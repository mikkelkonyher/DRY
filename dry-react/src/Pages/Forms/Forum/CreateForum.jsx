import React, { useState, useEffect } from 'react';
import config from '../../../../config.jsx';
import './CreateForum.css';

const CreateForum = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [userId, setUserId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub;
                if (!email) {
                    throw new Error('Email not found in token');
                }

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch users');
                }

                const users = await userResponse.json();
                const user = users.find(user => user.email === email);
                if (!user) {
                    throw new Error('User not found');
                }

                setUserId(user.id);
            } catch (error) {
                console.error('Error decoding token or fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('Subject', subject);
        formData.append('Body', body);
        formData.append('UserId', userId);

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Forum`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            setSuccessMessage('Indlægget er oprettet');
            setSubject('');
            setBody('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div>
                <label htmlFor="subject">Emne *</label>
                <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="body">Indhold *</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Opret</button>
        </form>
    );
};

export default CreateForum;