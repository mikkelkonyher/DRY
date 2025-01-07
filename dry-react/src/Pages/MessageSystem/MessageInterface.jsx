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
            acc[chatId] = { messages: [] };
        }
        acc[chatId].messages.push(message);
        return acc;
    }, {});

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className="chat-list">
                    <h2>Inbox</h2>
                    {Object.keys(groupedMessages).map(chatId => (
                        <div key={chatId} className="chat-item" onClick={() => handleChatClick(chatId)}>
                            <strong>{users[chatId]?.name || 'Chat unidentified'}</strong>
                        </div>
                    ))}
                </div>
                {selectedChat && (
                    <div className="chat-box">
                        <div className="chat-box-header">
                            <strong> Chat med: {users[selectedChat]?.name || 'Chat unidentified'}</strong>
                            <button className="close-button" onClick={() => setSelectedChat(null)}>Close</button>
                        </div>
                        <div className="messages">
                            {groupedMessages[selectedChat].messages.map(message => (
                                <div key={message.id}
                                     className={`message ${message.senderId === userId ? 'sent' : 'received'}`}>
                                    <strong>{message.senderUsername}:</strong> {message.content}
                                    <em>({new Date(message.timestamp).toLocaleString()})</em>
                                    <div className="message-subject">{message.subject}</div>
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