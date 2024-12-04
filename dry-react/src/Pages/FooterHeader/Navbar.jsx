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
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

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
        <AppBar position="fixed" sx={{ backgroundColor: 'black', boxShadow: 'none', width: '100%', padding: '10px 0', backdropFilter: 'blur(10px)' }}>
            <Container maxWidth="xl" sx={{ padding: '0 20px' }}>
                <Toolbar disableGutters>

                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', lg: 'flex' },
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

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', lg: 'none' }, justifyContent: 'center' }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
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
                                display: { xs: 'block', lg: 'none' },
                                '& .MuiPaper-root': {
                                    backgroundColor: 'black', // Set background color to black
                                }
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    key={page.name}
                                    onClick={handleCloseNavMenu}
                                    sx={{ color: 'white' }} // Set text color to white
                                >
                                    <Typography
                                        component={Link}
                                        to={page.path}
                                        sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', textTransform: 'none' }}
                                    >
                                        {page.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                            {!isAuthenticated && (
                                <MenuItem
                                    onClick={handleCloseNavMenu}
                                    sx={{ color: 'white' }} // Set text color to white
                                >
                                    <Typography
                                        component={Link}
                                        to="/signup"
                                        sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', textTransform: 'none' }}
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
                            display: { xs: 'flex', lg: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }, // Smaller font size on small screens
                            textTransform: 'none', // Ensure text is not uppercase
                            justifyContent: 'center'
                        }}
                    >
                        GearNinja
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                component={Link}
                                to={page.path}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block', textTransform: 'none', mx: 2 }}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>
                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                        {!isAuthenticated ? (
                            <>
                                <Typography
                                    component={Link}
                                    to="/login"
                                    sx={{ my: 2, color: 'cyan', textDecoration: 'none', textTransform: 'none' }}
                                >
                                    LOGIN
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/signup"
                                    sx={{ my: 2, color: 'cyan', textDecoration: 'none', textTransform: 'none', ml: 2 }}
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
                                        <Avatar sx={{ bgcolor: '#6366f1' }}>
                                            <AccountBoxIcon sx={{ color: 'white' }} />
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px', '& .MuiPaper-root': { backgroundColor: 'black' } }} // Set background color to black
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
                                        <MenuItem key={setting.name} onClick={handleCloseUserMenu} sx={{ color: 'white' }}>
                                            <Typography
                                                component={Link}
                                                to={setting.path}
                                                sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', textTransform: 'none' }}
                                            >
                                                {setting.name}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                    <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                                        <Typography
                                            component="a"
                                            sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', textTransform: 'none' }}
                                        >
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;