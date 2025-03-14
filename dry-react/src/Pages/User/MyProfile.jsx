import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import SellCard from "./SellCard.jsx";
import SellRehearsalRoom from "./SellRehearsalRoom.jsx";
import config from '../../../config.jsx';
import './MyProfile.css';
import Cookies from 'js-cookie';
import { AuthContext } from "../../AuthContext.jsx";
import defaultProfileImage from '../../assets/3675952-200.png';

const ninjaNames = [
    "Shadow Reaper",
    "Ghost Fang",
    "Bloodmoon Shinobi",
    "Silent Phantom",
    "Nightfall Ronin",
    "Dagger Viper",
    "Stormblade Sensei",
    "Void Stalker",
    "Obsidian Kage",
    "Venom Shuriken"
];

function MyProfile() {
    const [gear, setGear] = useState([]);
    const [favoriteGear, setFavoriteGear] = useState([]);
    const [rehearsalRooms, setRehearsalRooms] = useState([]);
    const [favoriteRehearsalRooms, setFavoriteRehearsalRooms] = useState([]);
    const [users, setUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
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
    const [randomNinjaName, setRandomNinjaName] = useState('');
    const fileInputRef = useRef(null);
    const { setIsAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdResponse = await fetch(`${config.apiBaseUrl}/api/Auth/get-user-id`, {
                    method: 'GET',
                    credentials: 'include', // This sends cookies with the request
                });

                if (!userIdResponse.ok) {
                    const errorResponse = await userIdResponse.json();
                    console.error('Error response:', errorResponse);
                    throw new Error('Failed to fetch user ID');
                }

                const { userId } = await userIdResponse.json();
                if (!userId) throw new Error('User ID not found');

                setUserId(userId);

                const userDetailResponse = await fetch(`${config.apiBaseUrl}/api/User/${userId}`, {
                    method: 'GET',
                    credentials: 'include', // This sends cookies with the request
                });

                if (userDetailResponse.ok) {
                    const userDetails = await userDetailResponse.json();
                    setUserName(userDetails.name);
                    setUserEmail(userDetails.email);
                    setProfileImageUrl(userDetails.profileImageUrl);
                }

            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        const randomName = ninjaNames[Math.floor(Math.random() * ninjaNames.length)];
        setRandomNinjaName(randomName);
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchUserGearAndRooms = async () => {
            try {
                const gearResponse = await fetch(`${config.apiBaseUrl}/api/MusicGear/user/${userId}`);
                if (gearResponse.ok) {
                    const gearData = await gearResponse.json();
                    setGear(gearData);
                } else if (gearResponse.status !== 404) {
                    throw new Error('Failed to fetch user gear');
                }

                const roomResponse = await fetch(`${config.apiBaseUrl}/api/RehearsalRoom/user/${userId}`);
                if (!roomResponse.ok) {
                    throw new Error('Failed to fetch rehearsal rooms');
                }
                const roomData = await roomResponse.json();
                setRehearsalRooms(roomData.items || []);

                const userResponse = await fetch(`${config.apiBaseUrl}/api/User/${userId}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch users');
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

                const imageUrl = await imageResponse.text();
                setProfileImageUrl(imageUrl);

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
        setShowSellCards(false);
        setShowFavoriteCards(false);
    };

    const handleSave = async () => {
        if (!userEmail || userEmail === "string") {
            setErrorMessage('Invalid user data');
            return;
        }

        if (isEmailChanging && userEmail !== confirmEmail) {
            setErrorMessage('E-mail addresses do not match.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to save these changes?');
        if (!confirmed) return;

        try {
            const requestBody = { id: userId, name: userName, email: userEmail };
            if (profileImageUrl) {
                requestBody.profileImageUrl = profileImageUrl;
            } else {
                requestBody.profileImageUrl = defaultProfileImage;
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
            setErrorMessage('Failed to update user');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setErrorMessage('');
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
                    'Authorization': `Bearer ${Cookies.get('AuthToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setIsAuthenticated(false);
            Cookies.remove('AuthToken');

            window.location.href = '/login';
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorMessage('Failed to delete user');
        }
    };

    const handleRemoveFavorite = (itemId) => {
        setFavoriteGear(favoriteGear.filter(item => item.id !== itemId));
    };

    const handleRemoveFavoriteRoom = (roomId) => {
        setFavoriteRehearsalRooms(favoriteRehearsalRooms.filter(room => room.id !== roomId));
    };

    const handleRemoveItem = (itemId) => {
        setGear(gear.filter(item => item.id !== itemId));
    };

    const handleRemoveRoom = (roomId) => {
        setRehearsalRooms(rehearsalRooms.filter(room => room.id !== roomId));
    };

    return (
        <div className="my-profile">
            {profileImageUrl ? (
                <img className="profile-image" src={profileImageUrl} alt="Profile" onClick={handleImageClick} />
            ) : (
                <div className="default-profile-image" onClick={handleImageClick}>
                    <img src={defaultProfileImage} alt="Default Profile" style={{ width: '15em', height: '15em' }} />
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
                        type="email"
                        value={userEmail || ''}
                        onChange={(e) => {
                            setUserEmail(e.target.value);
                            setIsEmailChanging(true);
                        }}
                        className="input-field"
                        placeholder="Skift din e-mailadresse"
                    />
                    {isEmailChanging && (
                        <input
                            type="email"
                            value={confirmEmail || ''}
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
                    <h2>{`${randomNinjaName} ${userName}`}</h2>

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
                        if (!showFavoriteCards) fetchFavoriteGearAndRooms();
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
                            onRemove={handleRemoveItem}

                        />
                    ))}
                    {rehearsalRooms.map((room) => (
                        <SellRehearsalRoom
                            key={room.id}
                            room={room}
                            userId={userId}
                            onRemove={handleRemoveRoom}
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
                            onRemove={handleRemoveFavorite}
                        />
                    ))}
                    {favoriteRehearsalRooms.map((room) => (
                        <SellRehearsalRoom
                            key={room.id}
                            room={room}
                            userId={userId}
                            onRemove={handleRemoveFavoriteRoom}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyProfile;