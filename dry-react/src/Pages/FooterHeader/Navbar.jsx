import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import axios from 'axios';
import config from "../../../config.jsx";

const pages = [
    { name: 'Guit/Bas', path: '/GuitBass' },
    { name: 'Trommer', path: '/Trommer' },
    { name: 'Keys', path: '/keys' },
    { name: 'Blæs', path: '/blæsere' },
    { name: 'Strygere', path: '/strygere' },
    { name: 'Studie Gear', path: '/studiogear' },
    { name: 'Øvelokaler', path: '/øvelokaler' },
    { name: 'Forum', path: '/forum' }
];
const settings = [
    { name: 'Min Profil', path: '/myprofile' },
    { name: 'Inbox', path: '/inbox' }
];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));
    const [searchQuery, setSearchQuery] = React.useState('');
    const theme = useTheme();
    const navigate = useNavigate();

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        const pageNumber = 1;
        const pageSize = 10;
        try {
            // Clear the error message before making a new search request
            navigate('/search-results', { state: { searchResults: [], searchQuery, errorMessage: '' } });

            const response = await axios.get(`${config.apiBaseUrl}/api/MusicGear/search`, {
                params: {
                    query: searchQuery,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
            });
            console.log('API Response:', response.data); // Log the API response
            const searchResults = response.data;
            navigate('/search-results', { state: { searchResults, searchQuery } });
        } catch (error) {
            console.error('Error fetching search results:', error);
            if (error.response && error.response.status === 404) {
                navigate('/search-results', { state: { searchResults: [], searchQuery, errorMessage: 'Fandt ingen match.' } });
            } else {
                navigate('/search-results', { state: { searchResults: [], searchQuery, errorMessage: 'Fandt ingen match.' } });
            }
        }
    };

    return (
        <AppBar position="fixed" sx={{ backgroundColor: 'black', boxShadow: 'none', width: '100%', padding: '0px 0', backdropFilter: 'blur(50px)', marginBottom: '20px' }}>
            <Container maxWidth="xl" sx={{padding: '0 0px'}}>
                <Toolbar disableGutters>
                    <Box sx={{flexGrow: 0, display: 'flex', justifyContent: 'center'}}>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: {xs: 'none', lg: 'flex'},
                                fontFamily: 'monospace',
                                fontWeight: 100,
                                letterSpacing: '.2rem',
                                color: 'inherit',
                                textDecoration: 'none',
                                textTransform: 'none', // Ensure text is not uppercase
                            }}
                        >
                            GearNinja
                        </Typography>
                    </Box>

                    <Box sx={{flexGrow: 1, display: {xs: 'flex', lg: 'none'}, justifyContent: 'center'}}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: {xs: 'block', lg: 'none'},
                                '& .MuiPaper-root': {
                                    backgroundColor: 'black', // Set background color to black
                                }
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    key={page.name}
                                    onClick={handleCloseNavMenu}
                                    sx={{color: 'white'}} // Set text color to white
                                >
                                    <Typography
                                        component={Link}
                                        to={page.path}
                                        sx={{
                                            textAlign: 'center',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            textTransform: 'none'
                                        }}
                                    >
                                        {page.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                            {!isAuthenticated && (
                                <MenuItem
                                    onClick={handleCloseNavMenu}
                                    sx={{color: 'white'}} // Set text color to white
                                >
                                    <Typography
                                        component={Link}
                                        to="/signup"
                                        sx={{
                                            textAlign: 'center',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            textTransform: 'none'
                                        }}
                                    >
                                        Signup
                                    </Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>

                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', lg: 'none'},
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            fontSize: {xs: '1.2rem', sm: '1.5rem'}, // Smaller font size on small screens
                            textTransform: 'none', // Ensure text is not uppercase
                            justifyContent: 'center'
                        }}
                    >
                        GearNinja
                    </Typography>

                    <Box sx={{flexGrow: 1, display: {xs: 'none', lg: 'flex'}, justifyContent: 'center'}}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                component={Link}
                                to={page.path}
                                onClick={handleCloseNavMenu}
                                sx={{my: 2, color: 'white', display: 'block', textTransform: 'none', mx: 2}}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{flexGrow: 0, display: 'flex', alignItems: 'center'}}>
                        {!isAuthenticated ? (
                            <>
                                <Typography
                                    component={Link}
                                    to="/login"
                                    sx={{my: 2, color: 'cyan', textDecoration: 'none', textTransform: 'none'}}
                                >
                                    LOGIN
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/signup"
                                    sx={{my: 2, color: 'cyan', textDecoration: 'none', textTransform: 'none', ml: 2}}
                                >
                                    SIGNUP
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Min Profil og Inbox">
                                    <IconButton
                                        onClick={handleOpenUserMenu}
                                        sx={{
                                            p: 0,
                                            marginRight: '10px',
                                            [theme.breakpoints.down('sm')]: {
                                                marginLeft: 'auto', // Ensure it stays within the viewport
                                                marginRight: '45px', // Add some left margin
                                            },
                                        }}
                                    >
                                        <Avatar sx={{bgcolor: '#6366f1'}}>
                                            <AccountBoxIcon sx={{color: 'white'}}/>
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{
                                        mt: '45px',
                                        '& .MuiPaper-root': {backgroundColor: 'black'}
                                    }} // Set background color to black
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting.name} onClick={handleCloseUserMenu}
                                                  sx={{color: 'white'}}>
                                            <Typography
                                                component={Link}
                                                to={setting.path}
                                                sx={{
                                                    textAlign: 'center',
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    textTransform: 'none'
                                                }}
                                            >
                                                {setting.name}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                    <MenuItem onClick={handleLogout} sx={{color: 'red'}}>
                                        <Typography
                                            component="a"
                                            sx={{
                                                textAlign: 'center',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                textTransform: 'none'
                                            }}
                                        >
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>

                <form onSubmit={handleSearchSubmit} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    border: '0px',
                    marginTop: '-25px',
                    marginBottom: '10px'
                }}>
                    <TextField
                        variant="outlined"
                        placeholder="Søg i alt udstyr..."
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{
                            backgroundColor: 'black',
                            width: {xs: '100%', sm: '500px'},
                            height: '40px',
                            borderRadius: '20px', // Apply border radius directly here

                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px', // Ensure border radius is applied here as well
                                '& fieldset': {
                                    border: 'none',
                                    borderRadius: '15px', // Apply border radius to fieldset
                                },
                                '&:hover fieldset': {
                                    border: 'none',
                                    borderRadius: '15px', // Apply border radius to fieldset on hover
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                    borderRadius: '15px', // Apply border radius to fieldset when focused
                                },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: '15px', // Ensure border radius is applied here as well
                            },
                            '& .MuiInputBase-input': {
                                color: 'white',
                                fontSize: '0.8rem',
                                height: '45px',
                                borderRadius: '15px', // Apply border radius to input
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{color: 'white'}}/>
                                </InputAdornment>
                            )
                        }}
                    />
                </form>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;