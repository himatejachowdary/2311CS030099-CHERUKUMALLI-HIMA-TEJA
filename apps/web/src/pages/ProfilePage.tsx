import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

export function ProfilePage() {
  const { user, role, studentDetails, agentDetails, updateUserProfile, resetPassword } = useAuth();

  // Form states
  const [name, setName] = useState<string>(
    role === 'student' ? studentDetails?.name || '' : role === 'agent' ? agentDetails?.name || '' : 'Administrator'
  );
  
  // Student specific details
  const [branch, setBranch] = useState<string>(studentDetails?.branch || 'CSE');
  const [year, setYear] = useState<string>(studentDetails?.year || '1');
  const [section, setSection] = useState<string>(studentDetails?.section || 'A');

  // Agent specific details
  const [department, setDepartment] = useState<string>(agentDetails?.department || 'CSE');

  // Loading & Feedback states
  const [saving, setSaving] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProfilePhotoSuccess = async (url: string) => {
    try {
      await updateUserProfile({ photoURL: url });
      setSuccessMsg("Profile photo updated successfully!");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to update profile photo.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg("Name field cannot be left blank.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (role === 'student') {
        await updateUserProfile({
          name,
          branch,
          year,
          section
        });
      } else if (role === 'agent') {
        await updateUserProfile({
          name,
          department
        });
      } else {
        await updateUserProfile({ name });
      }
      setSuccessMsg("Profile details saved successfully.");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordResetClick = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(user.email);
      setSuccessMsg(`A password modification link has been sent to ${user.email}.`);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to issue password modification link.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
        My Account Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configure personal details, academic settings, and modify passwords.
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column: Avatar upload */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ProfilePhotoUpload
                currentPhotoURL={user?.photoURL || null}
                onUploadSuccess={handleProfilePhotoSuccess}
                size={140}
              />
              <Typography variant="subtitle1" fontWeight="700" sx={{ mt: 2, textAlign: 'center' }}>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Chip
                label={role?.toUpperCase()}
                size="small"
                color={role === 'admin' ? 'error' : role === 'agent' ? 'secondary' : 'primary'}
                sx={{ fontWeight: 800, px: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Editable forms */}
        <Grid item xs={12} md={8}>
          <Box component="form" onSubmit={handleProfileSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* General Profile Details Card */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      InputProps={{ style: { borderRadius: 10 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address (ReadOnly)"
                      fullWidth
                      value={user?.email || ''}
                      disabled
                      InputProps={{ style: { borderRadius: 10 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Academic Targets / Department Card */}
            {role !== 'admin' && (
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    {role === 'student' ? (
                      <React.Fragment>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} /> Academic Targets configuration
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <BadgeIcon color="secondary" sx={{ mr: 1 }} /> Faculty Department
                      </React.Fragment>
                    )}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {role === 'student' && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Branch"
                          fullWidth
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          InputProps={{ style: { borderRadius: 10 } }}
                        >
                          <MenuItem value="CSE">CSE</MenuItem>
                          <MenuItem value="ECE">ECE</MenuItem>
                          <MenuItem value="MECH">MECH</MenuItem>
                          <MenuItem value="CIVIL">CIVIL</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          select
                          label="Academic Year"
                          fullWidth
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          InputProps={{ style: { borderRadius: 10 } }}
                        >
                          <MenuItem value="1">Year 1</MenuItem>
                          <MenuItem value="2">Year 2</MenuItem>
                          <MenuItem value="3">Year 3</MenuItem>
                          <MenuItem value="4">Year 4</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          select
                          label="Section"
                          fullWidth
                          value={section}
                          onChange={(e) => setSection(e.target.value)}
                          InputProps={{ style: { borderRadius: 10 } }}
                        >
                          <MenuItem value="A">Section A</MenuItem>
                          <MenuItem value="B">Section B</MenuItem>
                          <MenuItem value="C">Section C</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  )}

                  {role === 'agent' && (
                    <TextField
                      select
                      label="Faculty Department"
                      fullWidth
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      InputProps={{ style: { borderRadius: 10 } }}
                    >
                      <MenuItem value="CSE">Computer Science (CSE)</MenuItem>
                      <MenuItem value="ECE">Electronics & Comm (ECE)</MenuItem>
                      <MenuItem value="MECH">Mechanical Eng (MECH)</MenuItem>
                      <MenuItem value="CIVIL">Civil Eng (CIVIL)</MenuItem>
                    </TextField>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile Action Buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LockIcon />}
                onClick={handlePasswordResetClick}
                disabled={resetLoading}
                sx={{ fontWeight: 600 }}
              >
                {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Modify Password"}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ fontWeight: 600, py: 1.25, px: 3 }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : "Save Profile Details"}
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>

      {/* Feedback Toast messages */}
      <Snackbar
        open={!!successMsg || !!errorMsg}
        autoHideDuration={4000}
        onClose={() => {
          setSuccessMsg(null);
          setErrorMsg(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          severity={successMsg ? "success" : "error"}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successMsg || errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
