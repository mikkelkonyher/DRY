import React, { useEffect, useState, useRef } from 'react';
import config from "../../../config.jsx";
import './MessageInterface.css';

const MessageInterface = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [userId, setUserId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Set loading to true initially
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include',
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
                    const updatedChats = data.map(chat => {
                        const hasUnreadMessages = chat.messages.some(
                            message => message.receiverId === userId && !message.isReadReceiver
                        );
                        return { ...chat, hasUnreadMessages };
                    });
                    setChats(updatedChats);
                } else {
                    console.error('Failed to fetch chats');
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };

        fetchUserId().then(fetchChats);
    }, [userId]);

    const markAllMessagesAsRead = async (chatId) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Chats/${chatId}/markAllAsRead/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'accept': 'application/json',
                },
            });

            if (response.ok) {
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
                                hasUnreadMessages: false
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

    const handleChatClick = (chatId) => {
        if (selectedChat !== chatId) {
            setSelectedChat(chatId);
            markAllMessagesAsRead(chatId);
        } else {
            setSelectedChat(null);
        }
    };

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
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
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

    const handleSoftDeleteChat = async (e, chatId) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Er du sikker på at du vil slette denne chat?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Chats/${chatId}/softDelete/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'accept': 'application/json',
                },
            });

            if (response.ok) {
                setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
            } else {
                console.error('Failed to soft delete chat');
            }
        } catch (error) {
            console.error('Error soft deleting chat:', error);
        }
    };

    if (loading) {
        return <div className="spinner-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="message-interface-container">
            <div className="message-interface">
                <div className={`chat-list ${selectedChat ? 'hidden' : ''}`}>
                    <h2>
                        {!userId
                            ? 'Du skal være logget ind for at se dine beskeder'
                            : (chats.length === 0
                                ? 'Ingen beskeder'
                                : `Indbakke (${chats.reduce((total, chat) => total + chat.messages.filter(message => message.receiverId === userId && !message.isReadReceiver).length, 0)} Ulæste)`)
                        }
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