import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon, Warning as WarningIcon } from '@mui/icons-material';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <WarningIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h1" color="primary" fontWeight="800" sx={{ mb: 1 }}>
          404
        </Typography>
        
        <Typography variant="h4" fontWeight="700" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The link you followed may be broken, or the page may have been removed. Let's get you back home.
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ py: 1.5, px: 3, fontWeight: 700, borderRadius: '10px' }}
        >
          Return Home
        </Button>
      </Box>
    </Container>
  );
}
