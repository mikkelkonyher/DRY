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
    { name: 'Øvelokaler', path: '/rehearsal-rooms' },
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
            navigate('/search-results', { state: { searchResults: [], searchQuery, errorMessage: '' } });

            const response = await axios.get(`${config.apiBaseUrl}/api/MusicGear/search`, {
                params: {
                    query: searchQuery,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }
            });
            console.log('API Response:', response.data);
            const searchResults = response.data;
            navigate('/search-results', { state: { searchResults, searchQuery } });
        } catch (error) {
            console.error('Error fetching search results:', error);
            navigate('/search-results', { state: { searchResults: [], searchQuery, errorMessage: 'Fandt ingen match.' } });
        }
    };

    const handleSearchIconClick = () => {
        handleSearchSubmit(new Event('submit'));
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
                                textTransform: 'none',
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
                                    backgroundColor: 'black',
                                }
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    key={page.name}
                                    onClick={handleCloseNavMenu}
                                    sx={{color: 'white'}}
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
                                    sx={{color: 'white'}}
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
                            fontSize: {xs: '1.2rem', sm: '1.5rem'},
                            textTransform: 'none',
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
                                                marginLeft: 'auto',
                                                marginRight: '45px',
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
                                    }}
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
                            borderRadius: '20px',

                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                '& fieldset': {
                                    border: 'none',
                                    borderRadius: '20px',
                                },
                                '&:hover fieldset': {
                                    border: 'none',
                                    borderRadius: '20px',
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                    borderRadius: '20px',
                                },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: '20px',
                            },
                            '& .MuiInputBase-input': {
                                color: 'white',
                                fontSize: '0.8rem',
                                height: '45px',
                                borderRadius: '20px',
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton onClick={handleSearchIconClick}>
                                        <SearchIcon sx={{color: 'white'}}/>
                                    </IconButton>
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