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
        <AppBar position="fixed" sx={{ backgroundColor: '#712cf9', boxShadow: 'none', width: '100%', padding: '10px 0' }}>
            <Container maxWidth="xl" sx={{ padding: '0 20px' }}>
                <Toolbar disableGutters>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="2em"
                        height="2em"
                        viewBox="0 0 24 24"
                        sx={{display: {xs: 'none', lg: 'flex'}, mr: 1}}
                    >
                        <path
                            fill="currentColor"
                            d="M7.75 13c-.01-.35.15-.69.42-.92c.75.16 1.45.47 2.08.92c0 .68-.56 1.24-1.25 1.24S7.76 13.69 7.75 13m6 0c.63-.44 1.33-.75 2.08-.91c.27.23.43.57.42.91c0 .7-.56 1.26-1.25 1.26s-1.25-.56-1.25-1.26M12 9c-2.77-.04-5.5.65-7.93 2L4 12c0 1.23.29 2.44.84 3.54a47.6 47.6 0 0 1 14.32 0c.55-1.1.84-2.31.84-3.54l-.07-1A15.85 15.85 0 0 0 12 9m0-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2"
                        />
                    </svg>
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
                        href="#app-bar-with-responsive-menu"
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