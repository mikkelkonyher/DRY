import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import SellCard from "./SellCard.jsx";
import SellRehearsalRoom from "./SellRehearsalRoom.jsx";
import config from '../../../config.jsx';
import './MyProfile.css';
import Cookies from 'js-cookie';
import { AuthContext } from "../../AuthContext.jsx";

function MyProfile() {
    // State variables
    const [gear, setGear] = useState([]);
    const [favoriteGear, setFavoriteGear] = useState([]);
    const [rehearsalRooms, setRehearsalRooms] = useState([]);
    const [favoriteRehearsalRooms, setFavoriteRehearsalRooms] = useState([]);
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
    const { setIsAuthenticated } = useContext(AuthContext);

    // Fetch user ID and profile image URL
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = Cookies.get('AuthToken');
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

    // Fetch user gear and rehearsal rooms
    useEffect(() => {
        if (!userId) return;

        const fetchUserGearAndRooms = async () => {
            try {
                const gearResponse = await fetch(`${config.apiBaseUrl}/api/MusicGear/user/${userId}`);
                if (!gearResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const gearData = await gearResponse.json();
                setGear(gearData);

                const roomResponse = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom/user/${userId}`);
                if (!roomResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const roomData = await roomResponse.json();
                setRehearsalRooms(roomData.items || []);

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User/${userId}`);
                if (!userResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await userResponse.json();
                const userMap = Array.isArray(userData) ? userData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {}) : {};
                setUsers(userMap);
            } catch (error) {
                console.error('Error fetching user gear, rooms, or users:', error);
            }
        };

        fetchUserGearAndRooms();
    }, [userId]);

    // Fetch favorite gear and rehearsal rooms
    const fetchFavoriteGearAndRooms = async () => {
        try {
            const favoriteGearResponse = await fetch(`${config.apiBaseUrl}/api/Favorites/${userId}`);
            if (!favoriteGearResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const favoriteGearData = await favoriteGearResponse.json();
            const favoriteGearItems = favoriteGearData.map(fav => ({
                ...fav.musicGear,
                isFavorite: true
            }));
            setFavoriteGear(favoriteGearItems);

            const favoriteRoomResponse = await fetch(`${config.apiBaseUrl}/api/RehearsalRoomFavorites/${userId}`);
            if (!favoriteRoomResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const favoriteRoomData = await favoriteRoomResponse.json();
            const favoriteRoomItems = favoriteRoomData.map(fav => ({
                ...fav.rehearsalRoom,
                isFavorite: true
            }));
            setFavoriteRehearsalRooms(favoriteRoomItems);
        } catch (error) {
            console.error('Error fetching favorite gear or rooms:', error);
        }
    };

    // Handle profile image click
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    // Handle profile image file change
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
                        'Authorization': `Bearer ${Cookies.get('AuthToken')}`
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
                        'Authorization': `Bearer ${Cookies.get('AuthToken')}`
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

    // Handle edit button click
    const handleEdit = () => {
        setIsEditing(true);
        setIsEmailChanging(false);
        setConfirmEmail('');
        setOriginalEmail(userEmail);
        setShowSellCards(false);
        setShowFavoriteCards(false);
    };

    // Handle save button click
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
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
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

    // Handle cancel button click
    const handleCancel = () => {
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setErrorMessage('');
        setUserEmail(originalEmail);
    };

    // Handle delete button click
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
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Update authentication state
            setIsAuthenticated(false);
            Cookies.remove('AuthToken');

            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorMessage('Failed to delete user');
        }
    };

    return (
        <div className="my-profile">
            {/* Profile image */}
            {profileImageUrl ? (
                <img className="profile-image" src={profileImageUrl} alt="Profile" onClick={handleImageClick} />
            ) : (
                <div className="default-profile-image" onClick={handleImageClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10em" height="10em" viewBox="0 0 24 24">
                        <path fill="#712cf9" d="M7.75 13c-.01-.35.15-.69.42-.92c.75.16 1.45.47 2.08.92c0 .68-.56 1.24-1.25 1.24S7.76 13.69 7.75 13m6 0c.63-.44 1.33-.75 2.08-.91c.27.23.43.57.42.91c0 .7-.56 1.26-1.25 1.26s-1.25-.56-1.25-1.26M12 9c-2.77-.04-5.5.65-7.93 2L4 12c0 1.23.29 2.44.84 3.54a47.6 47.6 0 0 1 14.32 0c.55-1.1.84-2.31.84-3.54l-.07-1A15.85 15.85 0 0 0 12 9m0-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2"></path>
                    </svg>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            {/* Edit profile form */}
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
                    <h2>{userName}</h2>

                    <button onClick={handleEdit}>Rediger</button>
                </div>
            )}
            {/* Show sell and favorite cards */}
            {!isEditing && (
                <>
                    <button className="myproductsButton" onClick={() => setShowSellCards(!showSellCards)}>
                        {showSellCards ? 'Skjul mine annoncer' : 'Se alle mine annoncer'}
                    </button>
                    <button onClick={() => {
                        setShowFavoriteCards(!showFavoriteCards);
                        if (!showFavoriteCards) fetchFavoriteGearAndRooms();
                    }}>
                        {showFavoriteCards ? 'Skjul favoritter' : 'Se alle favoritter'}
                    </button>
                </>
            )}
            {/* Sell cards */}
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
                    {rehearsalRooms.map((room) => (
                        <SellRehearsalRoom
                            key={room.id}
                            room={room}
                            userId={userId}
                        />
                    ))}
                </div>
            )}
            {/* Favorite cards */}
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
                    {favoriteRehearsalRooms.map((room) => (
                        <SellRehearsalRoom
                            key={room.id}
                            room={room}
                            userId={userId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyProfile;