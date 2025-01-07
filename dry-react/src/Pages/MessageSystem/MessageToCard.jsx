import React, { useState } from 'react';
import PropTypes from 'prop-types';
import config from "../../../config.jsx";

const MessageToCard = ({ senderId, receiverId }) => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const messageData = {
            senderId,
            receiverId,
            content: message
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                setStatus('Besked sendt');
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
        <div className="message-to-card">
            <form onSubmit={handleSendMessage}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Skriv privat besked til sælger..."
                />
                <button type="submit">Send</button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

MessageToCard.propTypes = {
    senderId: PropTypes.number.isRequired,
    receiverId: PropTypes.number.isRequired,
};

export default MessageToCard;