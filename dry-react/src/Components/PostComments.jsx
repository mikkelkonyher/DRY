import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from "../../config.jsx";

function PostComment({ musicGearId, rehearsalRoomId, forumId, onCommentPosted }) {
    const [commentText, setCommentText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub;
                if (!email) throw new Error('Email not found in token');

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch users');

                const users = await userResponse.json();
                const user = users.find(user => user.email === email);
                if (!user) throw new Error('User not found');

                setUserId(user.id);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    const handleCommentChange = (e) => setCommentText(e.target.value);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('Login for at skrive en kommentar');
            return;
        }

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ musicGearId, rehearsalRoomId, forumId, userId, text: commentText })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Network response was not ok:', errorText);
                throw new Error('Network response was not ok');
            }

            setCommentText('');
            setErrorMessage('');
            onCommentPosted();
        } catch (error) {
            console.error('Fejl ved oprettelse af kommentar:', error);
            setErrorMessage('Fejl ved oprettelse af kommentar');
        }
    };

    const calculateRows = (text) => {
        const lines = text.split('\n').length;
        const extraLines = Math.floor(text.length / 50); // Adjust based on average line length
        return lines + extraLines;
    };

    return (
        <form onSubmit={handleCommentSubmit}>
            {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
            <textarea
                className="comment-input"
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Skriv en kommentar..."
                required
                rows={calculateRows(commentText)}
            />
            <button type="submit">Post Kommentar</button>
        </form>
    );
}

PostComment.propTypes = {
    musicGearId: PropTypes.number,
    rehearsalRoomId: PropTypes.number,
    forumId: PropTypes.number,
    onCommentPosted: PropTypes.func.isRequired,
};

export default PostComment;