import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from "../../config.jsx";
import Cookies from 'js-cookie';

function PostComment({ musicGearId, rehearsalRoomId, forumId, onCommentPosted }) {
    const [commentText, setCommentText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState(null);

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include', // This sends cookies with the request
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                setUserId(userId);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    const handleCommentChange = (e) => setCommentText(e.target.value);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // This sends cookies with the request
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
                maxLength="1000"
                required
                rows={calculateRows(commentText)}
            />
            <button type="submit-comment" className="submit-button">Post Kommentar</button>
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