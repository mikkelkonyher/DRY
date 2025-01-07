import React, { useEffect, useState } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css'; // Import the CSS file for styling

const MessageInterface = () => {
    const [messages, setMessages] = useState([]);
    const [userId, setUserId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [users, setUsers] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [isNewChat, setIsNewChat] = useState(false);
    const [newChatReceiverId, setNewChatReceiverId] = useState('');
    const [newChatContent, setNewChatContent] = useState('');

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
                        'accept': 'application/json', // Specify JSON response
                        'Authorization': `Bearer ${token}` // Add token to headers
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch users');

                const users = await userResponse.json();
                const user = users.find(user => user.email === email); // Find user by email
                if (!user) throw new Error('User not found');

                setUserId(user.id); // Set user ID
                setUsers(users.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {})); // Store users in state
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

    const handleNewChatSubmit = async (e) => {
        e.preventDefault();
        if (!newChatContent.trim() || !newChatReceiverId.trim()) return;

        const messageData = {
            senderId: userId,
            receiverId: newChatReceiverId,
            content: newChatContent
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
                setNewChatReceiverId('');
                setNewChatContent('');
                setIsNewChat(false);
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Group messages by chatId
    const groupedMessages = messages.reduce((acc, message) => {
        const chatId = message.senderId === userId ? message.receiverId : message.senderId;
        if (!acc[chatId]) {
            acc[chatId] = [];
        }
        acc[chatId].push(message);
        return acc;
    }, {});

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className="chat-list">
                    <h2>Chats</h2>
                    {Object.keys(groupedMessages).map(chatId => (
                        <div key={chatId} className="chat-item" onClick={() => handleChatClick(chatId)}>
                            <strong>{users[chatId]?.name || 'Chat unidentified'}</strong>
                        </div>
                    ))}
                    <button onClick={() => setIsNewChat(true)}>New Chat</button>
                </div>
                {selectedChat && (
                    <div className="chat-box">
                        <div className="chat-box-header">
                            <strong>{users[selectedChat]?.name || 'Chat unidentified'}</strong>
                            <button className="close-button" onClick={() => setSelectedChat(null)}>Close</button>
                        </div>
                        <div className="messages">
                            {groupedMessages[selectedChat].map(message => (
                                <div key={message.id} className={`message ${message.senderId === userId ? 'sent' : 'received'}`}>
                                    <strong>{message.senderUsername}:</strong> {message.content} <em>({new Date(message.timestamp).toLocaleString()})</em>
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
                {isNewChat && (
                    <div className="new-chat-form">
                        <h2>New Chat</h2>
                        <form onSubmit={handleNewChatSubmit}>
                            <input
                                type="text"
                                value={newChatReceiverId}
                                onChange={(e) => setNewChatReceiverId(e.target.value)}
                                placeholder="Receiver ID"
                            />
                            <input
                                type="text"
                                value={newChatContent}
                                onChange={(e) => setNewChatContent(e.target.value)}
                                placeholder="Message content"
                            />
                            <button type="submit">Send</button>
                            <button type="button" onClick={() => setIsNewChat(false)}>Cancel</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInterface;