import React, { useEffect, useState, useRef } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css';
import Cookies from 'js-cookie';

const MessageInterface = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [userId, setUserId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

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

        setLoading(true);

        const selectedChatData = chats.find(chat => chat.id === selectedChat);
        if (!selectedChatData) {
            setError('Selected chat does not exist.');
            setLoading(false);
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
        } finally {
            setLoading(false);
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
                <div className={`chat-list ${selectedChat ? 'hidden' : ''}`}>
                    <h2>
                        {chats.length === 0 ? 'Ingen beskeder' : `Indbakke (${chats.reduce((total, chat) => total + chat.messages.filter(message => message.receiverId === userId && !message.isReadReceiver).length, 0)} Ulæste)`}
                    </h2>
                    {chats.map(chat => {
                        const unreadMessages = chat.messages.filter(
                            message => message.receiverId === userId && !message.isReadReceiver
                        ).length;

                        return (
                            <div
                                key={chat.id}
                                className={`chat-item ${chat.hasUnreadMessages ? 'unread' : ''} ${selectedChat === chat.id ? 'selected-chat' : ''}`}
                                onClick={() => handleChatClick(chat.id)}
                            >

                                <strong>
                                    {chat.messages[0].senderId === userId
                                        ? chat.messages[0].receiverUsername
                                        : chat.messages[0].senderUsername} {chat.hasUnreadMessages && <span className="blue-dot"></span>}
                                </strong>
                                <br />
                                <strong className="subject">{chat.subject}</strong>
                                <span className="unread-count">
                                    {unreadMessages > 0 && ` (${unreadMessages} ulæste)`}
                                </span>
                                <button className="softDeleteButton" onClick={(e) => handleSoftDeleteChat(e, chat.id)}>Slet</button>
                            </div>
                        );
                    })}
                </div>
                {selectedChat && (
                    <div className="chat-box">
                        <button className="back-button" onClick={() => setSelectedChat(null)}>Tilbage til indbakke</button>
                        <div className="messages">
                            {chats.find(chat => chat.id === selectedChat).messages
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map(message => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.senderId === userId ? 'sent' : 'received'}`}
                                    >
                                        <strong>{message.senderUsername || 'Bruger slettet – modtager ikke beskeder'}:</strong> <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{message.content}</pre>
                                        <div className="dateTimeMessage" style={{ fontSize: '0.8em' }}>
                                            {new Date(message.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="message-form" onSubmit={handleSendMessage}>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Skriv besked..."
                                maxLength="1000"
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Indlæser...' : 'Send'}
                            </button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInterface;