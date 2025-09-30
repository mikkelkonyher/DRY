import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as regularThumbsUp } from '@fortawesome/free-regular-svg-icons';
import PostComments from "../../../Components/PostComments.jsx";
import MessageToForum from "../../MessageSystem/MessageToForum.jsx";
import config from "../../../../config.jsx";
import './ForumDetails.css';
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Cookies from 'js-cookie';

function ForumDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [forumItem, setForumItem] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

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

        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchForumItem = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/Forum/${id}`, { credentials: 'include' });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setForumItem(data.items[0]);

                const commentsResponse = await fetch(`${config.apiBaseUrl}/api/Comment/api/Forum/${id}/comments`, { credentials: 'include' });
                if (!commentsResponse.ok) throw new Error('Network response was not ok');
                const commentsData = await commentsResponse.json();
                setForumItem(prevItem => ({ ...prevItem, comments: commentsData }));

                if (userId) {
                    const checkUrl = new URL(`${config.apiBaseUrl}/api/ForumLikes/${userId}`);
                    const checkResponse = await fetch(checkUrl, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    });
                    if (!checkResponse.ok) throw new Error('Network response was not ok');
                    const likes = await checkResponse.json();
                    const likeStatus = likes.some(like => like.forumId === data.items[0].id);
                    setIsLiked(likeStatus);
                }
            } catch (error) {
                console.error('Error fetching forum item:', error);
            }
        };

        fetchForumItem();
    }, [id, userId]);

    const handleLikeClick = async () => {
        if (!userId) {
            alert('Login for at kunne synes godt om indlæg');
            return;
        }

        if (userId === forumItem.userId) {
            alert('Du kan ikke synes godt om dit dit eget indlæg');
            return;
        }

        if (loadingLike) return;

        setLoadingLike(true);
        try {
            const url = new URL(`${config.apiBaseUrl}/api/ForumLikes`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('forumId', id);

            const response = await fetch(url, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');

            setIsLiked(!isLiked);
            setForumItem(prevItem => ({
                ...prevItem,
                likeCount: prevItem.likeCount + (isLiked ? -1 : 1)
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoadingLike(false);
        }
    };

    const handleEditClick = () => {
        setEditSubject(forumItem.subject);
        setEditBody(forumItem.body);
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Forum/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
                },
                credentials: 'include',
                body: JSON.stringify({ id, subject: editSubject, body: editBody, userId })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const updatedItem = response.status !== 204 ? await response.json() : forumItem;
            setForumItem(updatedItem);
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Error saving forum:', error);
        }
    };

    const handleDeleteClick = async () => {
        const isConfirmed = window.confirm("Er du sikker på at du vil slette dette indlæg?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Forum/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Cookies.get('AuthToken')}` },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');
            navigate('/forum'); // Correct path for navigation
        } catch (error) {
            console.error('Error deleting forum:', error);
        }
    };

    const handleCommentPosted = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/api/Forum/${id}/comments`, { credentials: 'include' });
            if (!response.ok) throw new Error('Network response was not ok');
            const commentsData = await response.json();
            setForumItem(prevItem => ({ ...prevItem, comments: commentsData }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const isConfirmed = window.confirm("Er du sikker på at du vil slette denne kommentar?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Cookies.get('AuthToken')}` },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');
            setForumItem(prevItem => ({
                ...prevItem,
                comments: prevItem.comments.filter(comment => comment.id !== commentId)
            }));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (!forumItem) return <div>Loading...</div>;

    return (
        <div className="forum-details">
            {isEditing ? (
                <div className="edit-container">
                    <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                    />
                    <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                    />
                    <button className="forumsavebutton" onClick={handleSaveClick}>Gem</button>
                    <button className="forumcancelbutton" onClick={() => setIsEditing(false)}>Annuller</button>
                </div>
            ) : (
                <>
                    <h4>{forumItem.subject}</h4>
                    <p className="forum-body">{forumItem.body}</p>
                </>
            )}

            <div className="more-info-container">
                <p><strong>Indlæg af: {forumItem.userName || 'Ukendt'}</strong></p>
                <p><strong>Oprettet: {new Date(forumItem.createdAt).toLocaleDateString()}</strong> </p>
            </div>

            <div className="like-container">
                <button
                    className="like-button"
                    onClick={handleLikeClick}
                    title={isLiked ? 'Remove like' : 'Add like'}
                    disabled={loadingLike}
                >
                    <FontAwesomeIcon icon={isLiked ? solidThumbsUp : regularThumbsUp} />
                </button>
                <span>{forumItem.likeCount}</span>
            </div>

            {userId === forumItem.userId && !isEditing && (
                <div className="edit-delete-buttons">
                    <button className="editButton" onClick={handleEditClick}>
                        <EditNoteIcon />
                    </button>
                    <button className="deleteButton" onClick={handleDeleteClick}>
                        <DeleteIcon />
                    </button>
                </div>
            )}

            <button className="forumMessageButton" onClick={() => setIsMessageModalOpen(true)}>
                Skriv til bruger
            </button>

            {isMessageModalOpen && (
                <div className="modal" onClick={() => setIsMessageModalOpen(false)}>
                    <span className="close" onClick={() => setIsMessageModalOpen(false)}>&times;</span>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <MessageToForum
                            senderId={userId}
                            receiverId={forumItem.userId}
                            subject={forumItem.subject}
                        />
                    </div>
                </div>
            )}

            <div className="comments-section">
                <button className="show-comments-button" onClick={() => setShowComments(!showComments)}>
                    {showComments ? 'Skjul kommentarer' : 'Vis Kommentarer'}
                </button>
                {showComments && (
                    <>
                        {forumItem.comments && forumItem.comments.length > 0 ? (
                            forumItem.comments
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p>{comment.user?.name || 'Ukendt'}: {comment.text}</p>
                                        <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
                                        {(comment.userId === userId || forumItem.userId === userId) && (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button className="deleteCommentButton" onClick={() => handleDeleteComment(comment.id)}>Slet kommentar</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <p>Ingen kommentarer.</p>
                        )}
                        <PostComments forumId={forumItem.id} userId={userId} onCommentPosted={handleCommentPosted} />
                    </>
                )}
            </div>
        </div>
    );
}

ForumDetails.propTypes = {
    userId: PropTypes.number,
};

export default ForumDetails;