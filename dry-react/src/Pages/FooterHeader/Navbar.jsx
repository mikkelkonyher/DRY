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
import AdbIcon from '@mui/icons-material/Adb';
import { Link, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const pages = [
    { name: 'Guit/Bass', path: '/GuitBass' },
    { name: 'Trommer', path: '/Trommer' },
    { name: 'Keys', path: '/keys' },
    { name: 'Blæs', path: '/blæs' },
    { name: 'Strygere', path: '/strygere' },
    { name: 'Studio Gear', path: '/studioGear' },
    { name: 'Øvelokaler', path: '/øvelokaler' },
    { name: 'Musikundervisning', path: '/musikundervisning' },
    { name: 'mix/master', path: '/mixmaster' },
    { name: 'Session musikere', path: '/sessionmusikere' }
];
const settings = ['Min Profil', 'Inbox'];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));
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

    return (
        <AppBar position="fixed" sx={{ backgroundColor: 'rgba(24, 24, 24, 0.8)', boxShadow: 'none', width: '100%', padding: '10px 0', backdropFilter: 'blur(10px)' }}>
            <Container maxWidth="xl" sx={{ padding: '0 20px' }}>
                <Toolbar disableGutters>

                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: {xs: 'none', lg: 'flex'},
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        GearNinja
                    </Typography>

                    <Box sx={{flexGrow: 1, display: {xs: 'flex', lg: 'none'}}}>
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
                            sx={{display: {xs: 'block', lg: 'none'}}}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                    <Typography
                                        component={Link}
                                        to={page.path}
                                        sx={{textAlign: 'center', textDecoration: 'none', color: 'inherit'}}
                                    >
                                        {page.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                            {!isAuthenticated && (
                                <MenuItem onClick={handleCloseNavMenu}>
                                    <Typography
                                        component={Link}
                                        to="/signup"
                                        sx={{textAlign: 'center', textDecoration: 'none', color: 'inherit'}}
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
                        }}
                    >
                        GearNinja
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'none', lg: 'flex'}, alignItems: 'center'}}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                component={Link}
                                to={page.path}
                                onClick={handleCloseNavMenu}
                                sx={{my: 2, color: 'white', display: 'block'}}
                            >
                                {page.name}
                            </Button>
                        ))}
                        {!isAuthenticated && (
                            <Button
                                component={Link}
                                to="/signup"
                                onClick={handleCloseNavMenu}
                                sx={{my: 2, color: 'white', display: 'block'}}
                            >
                                Signup
                            </Button>
                        )}
                    </Box>
                    <Box sx={{flexGrow: 0, display: 'flex', alignItems: 'center'}}>
                        {isAuthenticated ? (
                            <Typography
                                component="a"
                                onClick={handleLogout}
                                sx={{my: 2, color: 'red', cursor: 'pointer', textDecoration: 'none'}}
                            >
                                LOGOUT
                            </Typography>
                        ) : (
                            <Typography
                                component={Link}
                                to="/login"
                                sx={{my: 2, color: 'cyan', textDecoration: 'none'}}
                            >
                                LOGIN
                            </Typography>
                        )}
                        <Tooltip title="Min Profil og Inbox">
                            <IconButton
                                onClick={handleOpenUserMenu}
                                sx={{
                                    p: 0,
                                    marginRight: isAuthenticated ? '10px' : '0', // Adjust this value as needed
                                    [theme.breakpoints.down('sm')]: {
                                        marginRight: '10px', // Adjust this value as needed
                                    },
                                }}
                            >
                                <Avatar sx={{bgcolor: 'white'}}>
                                    <AccountBoxIcon sx={{color: '#712cf9'}}/>
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: '45px'}}
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
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography sx={{textAlign: 'center'}}>{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;