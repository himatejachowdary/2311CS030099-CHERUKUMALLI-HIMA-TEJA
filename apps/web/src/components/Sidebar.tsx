import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  Campaign as CampaignIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }: SidebarProps) {
  const { user, role, studentDetails, agentDetails } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define sidebar links based on user role
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { text: 'Platform Overview', icon: <DashboardIcon />, path: '/' },
          { text: 'Manage Agents', icon: <BadgeIcon />, path: '/?tab=agents' },
          { text: 'Students Directory', icon: <PeopleIcon />, path: '/?tab=students' },
          { text: 'Platform Analytics', icon: <BarChartIcon />, path: '/?tab=analytics' },
          { text: 'All Notifications', icon: <NotificationsIcon />, path: '/?tab=notifications' }
        ];
      case 'agent':
        return [
          { text: 'Agent Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Publish Broadcast', icon: <CampaignIcon />, path: '/?action=create' },
          { text: 'Notification Analytics', icon: <BarChartIcon />, path: '/?tab=analytics' },
          { text: 'Read Receipts Logs', icon: <AssignmentIcon />, path: '/?tab=receipts' }
        ];
      case 'student':
        return [
          { text: 'Notifications Feed', icon: <NotificationsIcon />, path: '/' },
          { text: 'Student Profile', icon: <AccountCircleIcon />, path: '/profile' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getNavItems();

  const handleNavClick = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const getProfileName = () => {
    if (role === 'admin') return 'System Administrator';
    if (role === 'agent') return agentDetails?.name || user?.displayName || 'Campus Agent';
    if (role === 'student') return studentDetails?.name || user?.displayName || 'Student';
    return 'Campus User';
  };

  const getProfileSub = () => {
    if (role === 'admin') return 'Root Control';
    if (role === 'agent') return `Agent (${agentDetails?.department || 'Faculty'})`;
    if (role === 'student') return `${studentDetails?.branch || 'Student'} - Year ${studentDetails?.year || ''}`;
    return '';
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header section with brand */}
      <Toolbar sx={{ px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', py: 3 }}>
        <Typography variant="h5" color="primary" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
          <CampaignIcon sx={{ mr: 1, fontSize: 32 }} /> CAMPUS
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mt: -0.5, letterSpacing: '0.05em' }}>
          NOTIFICATION PORTAL
        </Typography>
      </Toolbar>
      
      <Divider />

      {/* User profile details header */}
      {user && (
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={user.photoURL || ""} 
            sx={{ 
              width: 48, 
              height: 48, 
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: '0px 4px 10px rgba(99, 102, 241, 0.2)'
            }}
          >
            {getProfileName().charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight="700" noWrap>
              {getProfileName()}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mb: 0.5 }}>
              {getProfileSub()}
            </Typography>
            <Chip 
              label={role?.toUpperCase()} 
              size="small" 
              color={role === 'admin' ? 'error' : role === 'agent' ? 'secondary' : 'primary'}
              sx={{ height: 16, fontSize: '0.65rem', fontWeight: 800 }}
            />
          </Box>
        </Box>
      )}

      <Divider />

      {/* Nav Link Items */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname + location.search === item.path;
          return (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: '10px',
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  opacity: isActive ? 1 : 0.85,
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.light' : 'action.hover',
                    opacity: 1,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.contrastText' : 'primary.main',
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? '700' : '500' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          v1.0.0 • Production Ready
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundImage: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
