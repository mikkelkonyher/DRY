import React, { useState } from 'react';
import PropTypes from 'prop-types';
import config from "../../../config.jsx";

import Cookies from 'js-cookie';

const MessageToForum = ({ senderId, receiverId, subject }) => {
    const [subjectState, setSubjectState] = useState(subject);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!subjectState.trim() || !message.trim()) return;

        if (!senderId) {
            setStatus('Log ind for skrive beskeder');
            return;
        }

        if (senderId === receiverId) {
            setStatus('Du kan ikke skrive til dig selv');
            return;
        }

        const messageData = {
            senderId,
            receiverId,
            subject: subjectState,
            content: message
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                setStatus('Besked sendt');
                setSubjectState(subject);
                setMessage('');
            } else {
                setStatus('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('Error sending message');
        }
    };

    return (
        <div className="message-to-forum">
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={subjectState}
                    onChange={(e) => setSubjectState(e.target.value)}
                    placeholder="Emne"
                />
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Skriv privat besked..."
                />
                <button type="submit">Send</button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

MessageToForum.propTypes = {
    senderId: PropTypes.number.isRequired,
    receiverId: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
};

export default MessageToForum;