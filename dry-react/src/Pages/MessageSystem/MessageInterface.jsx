import React, { useEffect, useState } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css'; // Import the CSS file for styling

const MessageInterface = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [userId, setUserId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');

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
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    // Fetch chats
    useEffect(() => {
        if (userId) {
            const fetchChats = async () => {
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/Chats`, {
                        headers: {
                            'accept': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setChats(data);
                    } else {
                        console.error('Failed to fetch chats');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            fetchChats();
        }
    }, [userId]);

    const handleChatClick = (chatId) => {
        setSelectedChat(selectedChat === chatId ? null : chatId);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const selectedChatData = chats.find(chat => chat.id === selectedChat);
        if (!selectedChatData) {
            setError('Selected chat does not exist.');
            return;
        }

        const chatId = selectedChatData.id; // Use the existing chat ID
        const receiverId = selectedChatData.messages[0].senderId === userId
            ? selectedChatData.messages[0].receiverId
            : selectedChatData.messages[0].senderId; // Ensure the correct receiverId is used

        const messageData = {
            senderId: userId,
            receiverId: receiverId,
            subject: selectedChatData.subject, // Keep the same subject
            content: newMessage,
            chatId: chatId // Use the existing chatId
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
                setChats(prevChats => {
                    return prevChats.map(chat =>
                        chat.id === chatId ? { ...chat, messages: [...chat.messages, newMessageData] } : chat
                    );
                });
                setNewMessage('');
                setError('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className="chat-list">
                    <h2>Inbox</h2>
                    {chats.map(chat => (
                        <div key={chat.id} className="chat-item" onClick={() => handleChatClick(chat.id)}>
                            <strong>{chat.subject}</strong>
                        </div>
                    ))}
                </div>
                {selectedChat && (
                    <div className="chat-box">
                        <div className="messages">
                            {chats.find(chat => chat.id === selectedChat).messages.map(message => (
                                <div key={message.id}
                                     className={`message ${message.senderId === userId ? 'sent' : 'received'}`}>
                                    <strong>{message.senderUsername || 'Deleted user'}:</strong> {message.content}
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
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInterface;