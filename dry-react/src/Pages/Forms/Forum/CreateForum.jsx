import React, { useState, useEffect } from 'react';
import config from '../../../../config.jsx';
import './CreateForum.css';
import Cookies from 'js-cookie';
import EditNoteIcon from '@mui/icons-material/EditNote';

const CreateForum = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [userId, setUserId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [charCount, setCharCount] = useState(0);
    const maxChars = 8000;

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
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
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
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
            setCharCount(0);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleBodyChange = (e) => {
        setBody(e.target.value);
        setCharCount(e.target.value.length);
    };

    return (
        <div className="create-forum-container">
            <h2 className="centered-heading">Opret forum indlæg <EditNoteIcon/></h2>
            <div className="form-container">
                <form className="createPostForm" onSubmit={handleSubmit}>
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    <div>

                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder={'Emne*'}
                        />
                    </div>
                    <div>

                        <textarea
                            id="body"
                            className="body-textarea"
                            value={body}
                            onChange={handleBodyChange}
                            maxLength={maxChars}
                            required
                            placeholder={'Skriv dit indlæg her...*'}
                        />
                        <div>{charCount}/{maxChars} characters</div>
                    </div>
                    <button className="postForumButton" type="submit">Opret opslag</button>
                </form>
            </div>
        </div>
    );
};

export default CreateForum;