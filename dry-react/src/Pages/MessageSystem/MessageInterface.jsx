import React, { useEffect, useState } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css'; // Import the CSS file for styling

const MessageInterface = () => {
    const [messages, setMessages] = useState([]);
    const [userId, setUserId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [users, setUsers] = useState({});
    const [newMessage, setNewMessage] = useState('');

    // Fetch user ID from token
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1])); // Decode token payload
                const email = payload.sub; // Extract email from payload
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
                setUsers(users.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {}));
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    // Fetch messages
    useEffect(() => {
        if (userId) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/Messages/${userId}`, {
                        headers: {
                            'accept': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setMessages(data);
                    } else {
                        console.error('Failed to fetch messages');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            fetchMessages();
        }
    }, [userId]);

    const handleChatClick = (chatId) => {
        setSelectedChat(selectedChat === chatId ? null : chatId);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const receiverId = selectedChat;
        if (!users[receiverId]) {
            alert('Bruger eksisterer ikke længere');
            return;
        }

        const messageData = {
            senderId: userId,
            receiverId,
            content: newMessage
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
                const newMessageData = await response.json();
                setMessages(prevMessages => [...prevMessages, newMessageData]);
                setNewMessage('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const groupedMessages = messages.reduce((acc, message) => {
        const chatId = message.senderId === userId ? message.receiverId : message.senderId;
        if (!acc[chatId]) {
            acc[chatId] = { messages: [], latestSubject: '', latestTimestamp: '' };
        }
        acc[chatId].messages.push(message);
        if (message.subject) {
            acc[chatId].latestSubject = message.subject; // Update the latest subject only if it's not empty
        }
        acc[chatId].latestTimestamp = message.timestamp; // Update the latest timestamp
        return acc;
    }, {});

    const sortedChatIds = Object.keys(groupedMessages).sort((a, b) =>
        new Date(groupedMessages[b].latestTimestamp) - new Date(groupedMessages[a].latestTimestamp)
    );

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className="chat-list">
                    <h2>Inbox</h2>
                    {sortedChatIds.map(chatId => (
                        <div key={chatId} className="chat-item" onClick={() => handleChatClick(chatId)}>
                            <strong>{users[chatId]?.name || 'Slettet bruger'}</strong>
                            <div className="chat-subject">{groupedMessages[chatId].latestSubject || 'No subject'}</div>
                        </div>
                    ))}
                </div>
                {selectedChat && (
                    <div className="chat-box">

                        <div className="messages">
                            {groupedMessages[selectedChat].messages.map(message => (
                                <div key={message.id}
                                     className={`message ${message.senderId === userId ? 'sent' : 'received'}`}>
                                    <strong>{message.senderUsername || 'Slettet bruger'}:</strong> {message.content}
                                    <em>({new Date(message.timestamp).toLocaleString()})</em>
                                    <div className="message-subject"><strong>{message.subject}</strong></div>
                                </div>
                            ))}
                        </div>
                        <form className="message-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInterface;