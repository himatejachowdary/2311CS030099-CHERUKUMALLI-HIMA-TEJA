import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Box, Toolbar } from '@mui/material';

const DRAWER_WIDTH = 260;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Header bar */}
      <Header handleDrawerToggle={handleDrawerToggle} />

      {/* Side Navigation panel */}
      <Sidebar 
        drawerWidth={DRAWER_WIDTH} 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />

      {/* Main viewport area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
        }}
      >
        {/* Adds standard spacing underneath fixed AppBar header */}
        <Toolbar />
        
        {/* Child Router routes display */}
        <Box sx={{ py: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
export default AppShell;
