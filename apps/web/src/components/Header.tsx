import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { dbService, Notification, NotificationView } from '../config/firebase';
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

interface HeaderProps {
  handleDrawerToggle: () => void;
}

export function Header({ handleDrawerToggle }: HeaderProps) {
  const { user, logout, role, studentDetails } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
    handleMenuClose();
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Subscribe to unread notifications count if user is a student
  useEffect(() => {
    if (!user || role !== 'student' || !studentDetails) return;

    let allNotifs: Notification[] = [];
    let viewedNotifs: string[] = [];

    const updateCount = () => {
      const unread = allNotifs.filter(notif => !viewedNotifs.includes(notif.id));
      setUnreadCount(unread.length);
    };

    // 1. Subscribe to notifications matching student branch/year/section
    const unsubNotifs = dbService.subscribeNotifications(
      {
        branch: studentDetails.branch,
        year: studentDetails.year,
        section: studentDetails.section
      },
      (notifs) => {
        allNotifs = notifs;
        updateCount();
      }
    );

    // 2. Subscribe to views of this student
    const unsubViews = dbService.subscribeAllNotificationViews((views) => {
      viewedNotifs = views
        .filter(v => v.studentId === user.uid)
        .map(v => v.notificationId);
      updateCount();
    });

    return () => {
      unsubNotifs();
      unsubViews();
    };
  }, [user, role, studentDetails]);

  const getProfileName = () => {
    if (role === 'admin') return 'Admin User';
    return user?.displayName || 'User';
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: (theme) => 
          theme.palette.mode === 'dark'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'none'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { lg: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <CampaignIcon sx={{ mr: 1, color: 'primary.main', display: { xs: 'none', md: 'block' } }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: '800', letterSpacing: '-0.02em' }}
          >
            Campus Notification Portal
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {/* Unread Badge for Students */}
          {role === 'student' && (
            <Tooltip title={`${unreadCount} Unread Notifications`}>
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Theme Toggler */}
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton 
              onClick={toggleDarkMode} 
              color="inherit"
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* Profile Dropdown Trigger */}
          {user && (
            <Tooltip title="Account Settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 0.5 }}
                aria-controls={isMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                <Avatar 
                  src={user.photoURL || ""} 
                  sx={{ 
                    width: 38, 
                    height: 38,
                    border: '1.5px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {getProfileName().charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Account settings dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 220,
              borderRadius: '12px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight="700" noWrap>
              {getProfileName()}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          
          <MenuItem onClick={handleProfileClick} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogoutClick} sx={{ py: 1.25, color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
