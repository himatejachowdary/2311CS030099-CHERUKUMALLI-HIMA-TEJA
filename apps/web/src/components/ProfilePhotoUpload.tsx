import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../config/firebase';
import { 
  Avatar, 
  Box, 
  IconButton, 
  CircularProgress, 
  Typography, 
  Tooltip 
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

interface ProfilePhotoUploadProps {
  currentPhotoURL: string | null;
  onUploadSuccess: (url: string) => void;
  size?: number;
}

export function ProfilePhotoUpload({ currentPhotoURL, onUploadSuccess, size = 120 }: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG/JPG).');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Upload file using our Firebase/Mock storage service
      const downloadURL = await storageService.uploadFile(file, `profiles/${user.uid}`);
      onUploadSuccess(downloadURL);
    } catch (e: any) {
      console.error("Error uploading profile photo:", e);
      setError(e.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={currentPhotoURL || ""}
          sx={{
            width: size,
            height: size,
            cursor: uploading ? 'default' : 'pointer',
            border: '3px solid',
            borderColor: 'primary.main',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              opacity: uploading ? 1 : 0.85,
              transform: uploading ? 'none' : 'scale(1.02)'
            }
          }}
          onClick={uploading ? undefined : handleAvatarClick}
        >
          {user?.displayName ? user.displayName.charAt(0) : '?'}
        </Avatar>

        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
          >
            <CircularProgress size={size * 0.4} sx={{ color: '#ffffff' }} />
          </Box>
        )}

        {!uploading && (
          <Tooltip title="Upload Photo">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={handleAvatarClick}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }
              }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, textAlign: 'center', fontWeight: 600 }}>
          {error}
        </Typography>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Supports JPG, PNG (Max 2MB)
      </Typography>
    </Box>
  );
}
