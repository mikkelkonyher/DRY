import React, { useState, useEffect, useRef } from 'react';
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
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const fileInputRef = useRef(null);

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

                // Fetch profile image URL
                const userDetailResponse = await fetch(`${config.apiBaseUrl}/api/User/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userDetailResponse.ok) {
                    const userDetails = await userDetailResponse.json();
                    setProfileImageUrl(userDetails.profileImageUrl);
                }

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

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImageUrl(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload the image immediately
            const formData = new FormData();
            formData.append('imageFiles', file);

            try {
                const imageResponse = await fetch(`${config.apiBaseUrl}/api/User/${userId}/profile-image`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!imageResponse.ok) {
                    const errorText = await imageResponse.text();
                    throw new Error(`Failed to upload profile image: ${errorText}`);
                }

                // Update profile image URL
                const imageUrl = await imageResponse.text();
                setProfileImageUrl(imageUrl);

                // Save the profile image URL to the user profile
                const updateUserResponse = await fetch(`${config.apiBaseUrl}/api/User/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ id: userId, name: userName, email: userEmail, profileImageUrl: imageUrl })
                });

                if (!updateUserResponse.ok) {
                    const errorText = await updateUserResponse.text();
                    throw new Error(`Failed to update user profile image URL: ${errorText}`);
                }

                // Reload the page to fetch the updated image
                window.location.reload();
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
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

            const requestBody = { id: userId, name: userName, email: userEmail };
            if (profileImageUrl) {
                requestBody.profileImageUrl = profileImageUrl;
            }

            const response = await fetch(`${config.apiBaseUrl}/api/User/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update user: ${errorText}`);
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
            {profileImageUrl ? (
                <img className="profile-image" src={profileImageUrl} alt="Profile" onClick={handleImageClick} />
            ) : (
                <div className="default-profile-image" onClick={handleImageClick}>
                    Upload profilbillede
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
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
                    <button onClick={handleSave}>Gem</button>
                    <button onClick={handleCancel}>Annuller</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            ) : (
                <div className="profile-info">
                    <h2> GearNinja: {userName}</h2>
                    <p><strong>Brugernavn:</strong> {userName}</p>
                    <p><strong>Email:</strong> {userEmail}</p>
                    <button onClick={handleEdit}>Rediger</button>
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