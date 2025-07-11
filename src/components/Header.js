import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  Logout,
  KeyboardArrowDown,
  AccessTime,
  CalendarToday,
  LocalHospital
} from '@mui/icons-material';
import { logger } from '../services/logger';

const Header = ({ user, userRole, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(false);
  };

  const handleLogout = async () => {
    try {
      logger.activity('User initiated logout', { userId: user.uid, role: userRole });
      await onLogout();
      handleMenuClose();
    } catch (error) {
      logger.error('Logout failed', { error: error.message, userId: user.uid });
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'doctor':
        return '👨‍⚕️';
      case 'receptionist':
        return '👩‍💼';
      default:
        return '👤';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'doctor':
        return theme.palette.success.main;
      case 'receptionist':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, margin: '0 auto', width: '100%', px: 2 }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <LocalHospital sx={{ fontSize: 32, color: 'white' }} />
          </Paper>
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                color: 'white',
                lineHeight: 1.2
              }}
            >
              Direction Clinic
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 300,
                color: 'white'
              }}
            >
              Work Assistance Program
            </Typography>
          </Box>
        </Box>

        {/* Center Section - Date and Time */}
        {!isMobile && (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: 200
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'white' }} />
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {formatDate(currentTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'white' }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 600,
                      fontFamily: 'Courier New, monospace'
                    }}
                  >
                    {formatTime(currentTime)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* User Section */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                p: 1.5,
                color: 'white',
                display: 'flex',
                gap: 1
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontSize: '1.2rem'
                }}
              >
                {getRoleIcon()}
              </Avatar>
              {!isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.email}
                  </Typography>
                  <Chip
                    label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                </Box>
              )}
              <KeyboardArrowDown 
                sx={{ 
                  transition: 'transform 0.3s ease',
                  transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)'
                }} 
              />
            </IconButton>
          </Paper>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 280,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Header */}
            <Box sx={{ p: 2, backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.5rem'
                  }}
                >
                  {getRoleIcon()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user.displayName || user.email}
                  </Typography>
                  <Chip
                    label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Info Items */}
            <MenuItem sx={{ cursor: 'default', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
              <ListItemIcon>
                <Email fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={user.email}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
            </MenuItem>

            <MenuItem sx={{ cursor: 'default', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
              <ListItemIcon>
                <Badge fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={`ID: ${user.uid?.slice(0, 8)}...`}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
            </MenuItem>

            <Divider />

            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  backgroundColor: 'error.light',
                  color: 'error.dark'
                }
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;