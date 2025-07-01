// Importer nødvendige React hooks og biblioteker
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as regularThumbsUp } from '@fortawesome/free-regular-svg-icons';
import config from "../../../../config.jsx"; // Importer konfigurationsfilen
import './ForumCard.css'; // Importer CSS-styling

// ForumCard-komponentet viser detaljer om et forumindlæg
function ForumCard({ item, userId }) {
    // State til at holde styr på om indlægget er liket
    const [isLiked, setIsLiked] = useState(false);
    // State til at holde styr på antallet af likes
    const [likeCount, setLikeCount] = useState(item?.likeCount || 0);
    // State til at holde styr på antallet af kommentarer
    const [commentCount, setCommentCount] = useState(0);
    // State til at indikere om en like-operation er i gang
    const [loadingLike, setLoadingLike] = useState(false);
    // Brug React Router's navigate-funktion til navigation
    const navigate = useNavigate();

    // useEffect til at hente antallet af kommentarer fra API'et
    useEffect(() => {
        if (!item) return; // Hvis der ikke er noget indlæg, gør ingenting

        const fetchCommentCount = async () => {
            try {
                // Byg URL til API-kaldet
                const countUrl = new URL(`${config.apiBaseUrl}/api/Forum/forum/${item.id}/count`);
                const response = await fetch(countUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Netværksrespons var ikke OK');
                }

                // Parse JSON-responsen og opdater state med antallet af kommentarer
                const data = await response.json();
                setCommentCount(data.commentCount);
            } catch (error) {
                console.error('Fejl ved hentning af kommentarantal:', error);
            }
        };

        fetchCommentCount();
    }, [item]);

    // Funktion til at håndtere klik på like-knappen
    const handleLikeClick = async (e) => {
        e.stopPropagation(); // Forhindrer klik på kortet når knappen trykkes
        if (!userId) {
            alert('Log ind for at like indlæg');
            return;
        }

        if (userId === item.userId) {
            alert('Du kan ikke like dit eget indlæg');
            return;
        }

        if (loadingLike) return; // Hvis en like-operation allerede er i gang, gør ingenting

        setLoadingLike(true); // Sæt loading til true
        try {
            // Byg URL til API-kaldet
            const url = new URL(`${config.apiBaseUrl}/api/ForumLikes`);
            url.searchParams.append('userId', userId);
            url.searchParams.append('forumId', item.id);
            const method = isLiked ? 'DELETE' : 'POST'; // Vælg metode baseret på like-status

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Netværksrespons var ikke OK: ${errorText}`);
            }

            // Opdater like-status og antallet af likes
            setIsLiked(!isLiked);
            setLikeCount(prevCount => (isLiked ? prevCount - 1 : prevCount + 1));
        } catch (error) {
            console.error('Fejl ved toggling af like:', error);
        } finally {
            setLoadingLike(false); // Sæt loading til false
        }
    };

    // Funktion til at navigere til detaljer om forumindlægget
    const handleCardClick = () => {
        navigate(`/ForumDetails/${item.id}`);
    };

    // Returner JSX til visning af forumkortet
    return (
        <div className="forum-card" onClick={handleCardClick}>
            <div className="forum-card-content">
                <h3>{item?.subject}</h3> {/* Viser emnet for indlægget */}
                <p>{item?.body.substring(0, 100)}{item?.body.length > 100 ? '... Se mere' : ''}</p> {/* Viser en kort version af indlægget */}
                <p className="info-text"><strong>Indlæg af: {item?.userName || 'Ukendt bruger'}</strong></p> {/* Viser forfatterens navn */}
                <p className="info-text"><strong>Oprettet: {new Date(item?.createdAt).toLocaleString()}</strong></p> {/* Viser oprettelsesdato */}
                <p className="info-text"><strong>{commentCount} {commentCount === 1 ? 'kommentar' : 'kommentarer'}</strong></p> {/* Viser antallet af kommentarer */}
                <div className="like-container">
                    <button
                        className="like-button"
                        onClick={handleLikeClick}
                        title={isLiked ? 'Fjern like' : 'Tilføj like'}
                        disabled={loadingLike}
                    >
                        <div className="like-content">
                            <FontAwesomeIcon icon={isLiked ? solidThumbsUp : regularThumbsUp} /> {/* Viser like-ikon */}
                            <span className="like-count">{likeCount}</span> {/* Viser antallet af likes */}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Definer prop-types for komponentet
ForumCard.propTypes = {
    item: PropTypes.object.isRequired, // Indlægget er påkrævet
    userId: PropTypes.number, // Bruger-ID er valgfrit
};

// Eksporter komponentet
export default ForumCard;