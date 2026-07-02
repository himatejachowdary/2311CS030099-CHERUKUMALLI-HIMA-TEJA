import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Grid,
  MenuItem
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

export function LoginPage() {
  const { login, loginWithGoogle, resetPassword, registerStudent } = useAuth();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Student Sign-Up States
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [studentBranch, setStudentBranch] = useState<string>('CSE');
  const [studentYear, setStudentYear] = useState<string>('3');
  const [studentSection, setStudentSection] = useState<string>('A');

  // Feedback States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Reset Modal States
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setIsSignUp(false);
    setStudentName('');
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => navigate('/'), 600);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !email || !password) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await registerStudent({
        name: studentName,
        email,
        branch: studentBranch,
        year: studentYear,
        section: studentSection
      }, password);

      setSuccessMsg("Account created successfully! Logging in...");
      // Auto login
      await login(email, password);
      setTimeout(() => navigate('/'), 600);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setSuccessMsg("Logged in successfully with Google!");
      setTimeout(() => navigate('/'), 600);
    } catch (e: any) {
      setErrorMsg(e.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(resetEmail);
      setSuccessMsg("Password reset email sent. Please check your inbox.");
      setResetDialogOpen(false);
      setResetEmail('');
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const getPortalInfo = () => {
    switch (tabIndex) {
      case 0:
        return {
          title: "Student Portal",
          desc: isSignUp ? "Create your custom student profile details to access notices." : "Access your targeted alerts, exam scores, and internship drives.",
          placeholderEmail: "student1@campus.edu",
          icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
        };
      case 1:
        return {
          title: "Agent Portal",
          desc: "Publish branch alerts, upload notices, and manage read receipts.",
          placeholderEmail: "agent1@campus.edu",
          icon: <BadgeIcon color="secondary" sx={{ fontSize: 40 }} />
        };
      case 2:
        return {
          title: "Admin Console",
          desc: "Manage college departments, add/remove agents, and review platform activities.",
          placeholderEmail: "admin@campus.edu",
          icon: <AdminIcon color="error" sx={{ fontSize: 40 }} />
        };
      default:
        return { title: "Login", desc: "", placeholderEmail: "user@campus.edu", icon: null };
    }
  };

  const info = getPortalInfo();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => 
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 10% 20%, #1e1e38 0%, #0f172a 90%)'
            : 'radial-gradient(circle at 10% 20%, #eef2ff 0%, #f8fafc 90%)',
        py: 4,
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          backdropFilter: 'blur(20px)',
          bgcolor: (theme) => 
            theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.7)'
              : 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
          borderRadius: 4
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CampaignIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
                CAMPUS PORTAL
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight="700">
              {isSignUp ? "CREATE NEW STUDENT ACCOUNT" : "SECURE LOG IN"}
            </Typography>
          </Box>

          {/* Portal Selection Tabs */}
          {!isSignUp && (
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab label="Student" sx={{ fontWeight: 700 }} />
              <Tab label="Agent" sx={{ fontWeight: 700 }} />
              <Tab label="Admin" sx={{ fontWeight: 700 }} />
            </Tabs>
          )}

          {/* Portal Info Panel */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {info.icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="700">
                {info.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {info.desc}
              </Typography>
            </Box>
          </Box>

          {/* Error Message */}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Form Content Toggle */}
          {tabIndex === 0 && isSignUp ? (
            <Box component="form" onSubmit={handleSignUpSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="studentName"
                label="Full Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Rahul Sharma"
                InputProps={{ style: { borderRadius: '10px' } }}
              />
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                InputProps={{ style: { borderRadius: '10px' } }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    label="Branch"
                    value={studentBranch}
                    onChange={(e) => setStudentBranch(e.target.value)}
                    InputProps={{ style: { borderRadius: '10px' } }}
                  >
                    {['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'].map((b) => (
                      <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    label="Year"
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    InputProps={{ style: { borderRadius: '10px' } }}
                  >
                    {['1', '2', '3', '4'].map((y) => (
                      <MenuItem key={y} value={y}>Year {y}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    label="Section"
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    InputProps={{ style: { borderRadius: '10px' } }}
                  >
                    {['A', 'B', 'C'].map((s) => (
                      <MenuItem key={s} value={s}>Sec {s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Student Account"}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
                    sx={{ fontWeight: 700, textTransform: 'none', p: 0 }}
                  >
                    Log In
                  </Button>
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleLoginSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={info.placeholderEmail}
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: tabIndex === 0 ? 2 : 0,
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : `Log In to ${info.title}`}
              </Button>

              {tabIndex === 0 && (
                <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                  <Typography variant="body2">
                    New Student?{' '}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
                      sx={{ fontWeight: 700, textTransform: 'none', p: 0 }}
                    >
                      Create Account
                    </Button>
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Student Google Sign-In Option */}
          {tabIndex === 0 && !isSignUp && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">
                  OR
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{
                  py: 1.25,
                  borderRadius: '10px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                Sign In with Google
              </Button>
            </>
          )}

          {/* Guest Credentials Tip */}
          <Box sx={{ mt: 3, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">
              Demo Credentials:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              Student: student1@campus.edu / student123 <br />
              Agent: agent1@campus.edu / agent123 <br />
              Admin: admin@campus.edu / admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} PaperProps={{ style: { borderRadius: 16 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '0.875rem' }}>
            Enter your campus registered email address, and we will send you instructions to reset your password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reset-email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            InputProps={{ style: { borderRadius: 10 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setResetDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordSubmit} 
            variant="contained" 
            disabled={resetLoading || !resetEmail}
            sx={{ fontWeight: 600 }}
          >
            {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Send Reset Link"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toasts */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
