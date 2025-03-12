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
    const [loading, setLoading] = useState(false);
    const maxChars = 8000;

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    headers: {
                        'accept': '*/*',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                if (!userId) throw new Error('User ID not found');

                setUserId(userId); // Set user ID
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleBodyChange = (e) => {
        setBody(e.target.value);
        setCharCount(e.target.value.length);
    };

    return (
        <div className="create-forum-container">
            <h2 className="centered-heading">Opret nyt indlæg <EditNoteIcon/></h2>
            <div className="form-container">
                <form className="createPostForm" onSubmit={handleSubmit}>
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    <div>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            maxLength="100"
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
                    <button className="postForumButton" type="submit" disabled={loading}>
                        {loading ? 'Indlæser...' : 'Opret opslag'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateForum;