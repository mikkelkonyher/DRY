import React, { useEffect, useState } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css';
import Cookies from 'js-cookie';

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
                const token = Cookies.get('AuthToken'); // Get token from cookie
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1])); // Decode token payload
                const email = payload.sub; // Extract email from payload
                if (!email) throw new Error('Email not found in token');

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`, { // Fetch users
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}` // Send token in header
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch users');

                const users = await userResponse.json(); // Parse response
                const user = users.find(user => user.email === email);
                if (!user) throw new Error('User not found');

                setUserId(user.id); // Set user ID in state
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    // Fetch chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                if (!userId) return;
                const response = await fetch(`${config.apiBaseUrl}/api/Chats/${userId}`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched chats:', data); // Log fetched data
                    // Check if each chat has unread messages for the receiver
                    const updatedChats = data.map(chat => {
                        const hasUnreadMessages = chat.messages.some(
                            message => message.receiverId === userId && !message.isReadReceiver
                        );
                        console.log(`Chat ${chat.id} has unread messages:`, hasUnreadMessages); // Log unread status
                        return { ...chat, hasUnreadMessages };
                    });
                    setChats(updatedChats);
                } else {
                    console.error('Failed to fetch chats');
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();
    }, [userId]);

    // Mark all messages as read
    const markAllMessagesAsRead = async (chatId) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Chats/${chatId}/markAllAsRead/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`,
                    'accept': 'application/json',
                },
            });

            if (response.ok) {
                // Update the state of the chats array directly
                setChats(prevChats => {
                    return prevChats.map(chat => {
                        if (chat.id === chatId) {
                            return {
                                ...chat,
                                messages: chat.messages.map(message => ({
                                    ...message,
                                    isReadReceiver: message.receiverId === userId ? true : message.isReadReceiver,
                                    isReadSender: message.senderId === userId ? true : message.isReadSender
                                })),
                                hasUnreadMessages: false // Set hasUnreadMessages to false
                            };
                        }
                        return chat;
                    });
                });
            } else {
                console.error('Failed to mark messages as read');
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Handle chat click
    const handleChatClick = (chatId) => {
        if (selectedChat !== chatId) {
            setSelectedChat(chatId);
            markAllMessagesAsRead(chatId); // Mark messages as read for the current chat
        } else {
            setSelectedChat(null);
        }
    };

    // Handle send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const selectedChatData = chats.find(chat => chat.id === selectedChat);
        if (!selectedChatData) {
            setError('Selected chat does not exist.');
            return;
        }

        const chatId = selectedChatData.id;
        const receiverId = selectedChatData.messages[0].senderId === userId
            ? selectedChatData.messages[0].receiverId
            : selectedChatData.messages[0].senderId;

        const messageData = {
            senderId: userId,
            receiverId: receiverId,
            subject: selectedChatData.subject,
            content: newMessage,
            chatId: chatId
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
            console.error('Error sending message:', error);
        }
    };

    // Handle soft delete chat
    const handleSoftDeleteChat = async (e, chatId) => {
        e.stopPropagation(); // Stop event propagation
        const confirmDelete = window.confirm("Er du sikker på at du vil slette denne chat?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Chats/${chatId}/softDelete/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`,
                    'accept': 'application/json',
                },
            });

            if (response.ok) {
                // Remove the chat from the state
                setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
            } else {
                console.error('Failed to soft delete chat');
            }
        } catch (error) {
            console.error('Error soft deleting chat:', error);
        }
    };

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className="chat-list">
                    <h2>Chats</h2>
                    {chats.map(chat => {
                        const unreadMessages = chat.messages.filter(
                            message => message.receiverId === userId && !message.isReadReceiver
                        ).length;

                        return (
                            <div
                                key={chat.id}
                                className={`chat-item ${chat.hasUnreadMessages ? 'unread' : ''}`}
                                onClick={() => handleChatClick(chat.id)}
                            >
                                <strong>{chat.subject}</strong>
                                <span>
                                    {chat.messages[0].senderId === userId
                                        ? ` - ${chat.messages[0].receiverUsername}`
                                        : ` - ${chat.messages[0].senderUsername}`}
                                    {unreadMessages > 0 && ` (${unreadMessages} unread)`}
                                </span>
                                <button onClick={(e) => handleSoftDeleteChat(e, chat.id)}>Delete</button>
                            </div>
                        );
                    })}
                </div>
                {selectedChat && (
                    <div className="chat-box">
                        <div className="messages">
                            {chats.find(chat => chat.id === selectedChat).messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.senderId === userId ? 'sent' : 'received'}`}
                                >
                                    <strong>{message.senderUsername || 'Deleted user'}:</strong> {message.content}
                                    <div><em>({new Date(message.timestamp).toLocaleString()})</em></div>
                                </div>
                            ))}
                        </div>
                        <form className="message-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Skriv besked..."
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