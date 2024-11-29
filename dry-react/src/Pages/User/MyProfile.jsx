import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellCard from "./SellCard.jsx";
import config from '../../../config.jsx';
import './MyProfile.css';


function MyProfile() {
    const [gear, setGear] = useState([]);
    const [favoriteGear, setFavoriteGear] = useState([]);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [showSellCards, setShowSellCards] = useState(false);
    const [showFavoriteCards, setShowFavoriteCards] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEmailChanging, setIsEmailChanging] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmDelete, setConfirmDelete] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub;
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
                setUserName(user.name);
                setUserEmail(user.email);

            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchUserGear = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/MusicGear/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGear(data);

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User`);
                if (!userResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await userResponse.json();
                const userMap = userData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);
            } catch (error) {
                console.error('Error fetching user gear or users:', error);
            }
        };

        fetchUserGear();
    }, [userId]);

    const fetchFavoriteGear = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/Favorites/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const favoriteData = await response.json();
            const favoriteGearData = favoriteData.map(fav => ({
                ...fav.musicGear,
                isFavorite: true
            }));
            setFavoriteGear(favoriteGearData);
        } catch (error) {
            console.error('Error fetching favorite gear:', error);
        }
    };

    const handleImageClick = (src) => {
        // Handle image click if needed
    };

    const handleEdit = () => {
        setIsEditing(true);
        setIsEmailChanging(false);
        setConfirmEmail('');
        setOriginalEmail(userEmail);
        setShowSellCards(false);
        setShowFavoriteCards(false);
    };

    const handleSave = async () => {
        if (!userName || !userEmail || userEmail === "string" || userName === "string") {
            console.error('Invalid user data');
            return;
        }

        if (isEmailChanging && userEmail !== confirmEmail) {
            setErrorMessage('E-mailadresserne stemmer ikke overens.');
            return;
        }

        const confirmed = window.confirm('Er du sikker på at du vil gemme disse ændringer?');
        if (!confirmed) return;

        try {
            const userResponse = await fetch(`${config.apiBaseUrl}/api/User`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await userResponse.json();
            const userExists = users.some(user => (user.name === userName || user.email === userEmail) && user.id !== userId);

            if (userExists) {
                setErrorMessage('Brugernavn eller mail er optaget');
                return;
            }

            const response = await fetch(`${config.apiBaseUrl}/api/User/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: userId, name: userName, email: userEmail })
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            setIsEditing(false);
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setErrorMessage('');
        setUserEmail(originalEmail);
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        if (confirmDelete !== 'SLET') {
            setErrorMessage('Du skal skrive SLET for at bekræfte sletning.');
            return;
        }

        const confirmed = window.confirm('Er du sikker på, at du vil slette din profil? Denne handling kan ikke fortrydes.');
        if (!confirmed) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/User/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Handle successful deletion (e.g., redirect to login page)
            window.location.href = '/login';
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorMessage('Failed to delete user');
        }
    };

    return (
        <div className="my-profile">
            <img className="ninja"
                 src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='%23712cf9' d='M7.75 13c-.01-.35.15-.69.42-.92c.75.16 1.45.47 2.08.92c0 .68-.56 1.24-1.25 1.24S7.76 13.69 7.75 13m6 0c.63-.44 1.33-.75 2.08-.91c.27.23.43.57.42.91c0 .7-.56 1.26-1.25 1.26s-1.25-.56-1.25-1.26M12 9c-2.77-.04-5.5.65-7.93 2L4 12c0 1.23.29 2.44.84 3.54a47.6 47.6 0 0 1 14.32 0c.55-1.1.84-2.31.84-3.54l-.07-1A15.85 15.85 0 0 0 12 9m0-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2'></path></svg>"
                 alt="Ninja Icon"/>
            {isEditing ? (
                <div className="edit-profile">
                    <Link to="/forgot-password">
                        <button>Skift Adgangskode</button>
                    </Link>
                    <button className="deleteprofile-button" onClick={handleDelete}>Slet Profil</button>
                    {showDeleteConfirm && (
                        <div className="delete-confirm">
                            <input
                                type="text"
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                                placeholder="Skriv SLET for at bekræfte sletning"
                                className="input-field"
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => {
                            setUserEmail(e.target.value);
                            setIsEmailChanging(true);
                        }}
                        className="input-field"
                    />
                    {isEmailChanging && (
                        <input
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            className="input-field"
                            placeholder="Bekræft ændring af email"
                        />
                    )}
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            ) : (
                <div className="profile-info">
                    <h2> GearNinja: {userName}</h2>
                    <p><strong>Brugernavn:</strong> {userName}</p>
                    <p><strong>Email:</strong> {userEmail}</p>
                    <button onClick={handleEdit}>Edit</button>
                </div>
            )}
            {!isEditing && (
                <>
                    <button className="myproductsButton" onClick={() => setShowSellCards(!showSellCards)}>
                        {showSellCards ? 'Skjul mine annoncer' : 'Se alle mine annoncer'}
                    </button>
                    <button onClick={() => {
                        setShowFavoriteCards(!showFavoriteCards);
                        if (!showFavoriteCards) fetchFavoriteGear();
                    }}>
                        {showFavoriteCards ? 'Skjul favoritter' : 'Se alle favoritter'}
                    </button>
                </>
            )}
            {showSellCards && (
                <div className="gear-list">
                    {gear.map((item) => (
                        <SellCard
                            key={item.id}
                            item={item}
                            users={users}
                            handleImageClick={handleImageClick}
                            userId={userId}
                            isFavorite={false}
                        />
                    ))}
                </div>
            )}
            {showFavoriteCards && (
                <div className="gear-list">
                    {favoriteGear.map((item) => (
                        <SellCard
                            key={item.id}
                            item={item}
                            users={users}
                            handleImageClick={handleImageClick}
                            userId={userId}
                            isFavorite={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyProfile;