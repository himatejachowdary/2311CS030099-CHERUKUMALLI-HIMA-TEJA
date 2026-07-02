import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, NotificationView } from '../config/firebase';
import type { Notification } from '../config/firebase';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  Skeleton,
  Paper,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PushPin as PinIcon,
  GetApp as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnreadIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';

export function StudentDashboardPage() {
  const { user, studentDetails } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Data States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewedNotifIds, setViewedNotifIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Real-time toast alerts
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [newNotifAlert, setNewNotifAlert] = useState<Notification | null>(null);
  const initialLoadRef = React.useRef<boolean>(true);
  const notificationsRef = React.useRef<Notification[]>([]);

  // Update ref to avoid stale closures
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0); // 0: All, 1: Unread, 2: Pinned
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  
  // Real-time updates subscription
  useEffect(() => {
    if (!studentDetails) return;
    setLoading(true);

    const filterParams: any = {
      branch: studentDetails.branch,
      year: studentDetails.year,
      section: studentDetails.section,
      search: searchQuery
    };
    if (selectedType !== 'All') {
      filterParams.type = selectedType;
    }
    if (selectedPriority !== 'All') {
      filterParams.priority = selectedPriority;
    }

    const unsubscribeNotifs = dbService.subscribeNotifications(
      filterParams,
      (data) => {
        if (!initialLoadRef.current) {
          const prevNotifs = notificationsRef.current;
          const newItems = data.filter(newN => !prevNotifs.some(oldN => oldN.id === newN.id));
          const alertItem = newItems[0];
          if (alertItem) {
            setNewNotifAlert(alertItem);
            setToastOpen(true);

            // Desktop push notification fallback
            if ("Notification" in window) {
              if (window.Notification.permission === "granted") {
                new window.Notification(`New Notice: ${alertItem.title}`, {
                  body: `${alertItem.createdByName}: ${alertItem.description.substring(0, 80)}...`
                });
              } else if (window.Notification.permission !== "denied") {
                window.Notification.requestPermission().then(permission => {
                  if (permission === "granted") {
                    new window.Notification(`New Notice: ${alertItem.title}`, {
                      body: `${alertItem.createdByName}: ${alertItem.description.substring(0, 80)}...`
                    });
                  }
                });
              }
            }
          }
        } else {
          initialLoadRef.current = false;
        }
        setNotifications(data);
        setLoading(false);
      }
    );

    // 2. Subscribe to views logged by this student to determine read status
    const unsubscribeViews = dbService.subscribeAllNotificationViews((views) => {
      const ids = views
        .filter(v => v.studentId === user?.uid)
        .map(v => v.notificationId);
      setViewedNotifIds(ids);
    });

    return () => {
      unsubscribeNotifs();
      unsubscribeViews();
    };
  }, [studentDetails, selectedType, selectedPriority, searchQuery, user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation(); // prevent card click navigation
    if (!user) return;

    try {
      await dbService.logNotificationView({
        notificationId: notif.id,
        studentId: user.uid,
        studentName: studentDetails?.name || user.displayName || 'Student'
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/notifications/${id}`);
  };

  // Compile notifications list depending on activeTab
  const getFilteredFeed = () => {
    switch (activeTab) {
      case 1: // Unread
        return notifications.filter(n => !viewedNotifIds.includes(n.id));
      case 2: // Pinned
        return notifications.filter(n => n.isPinned);
      default: // All
        return notifications;
    }
  };

  const feedList = getFilteredFeed();
  const pinnedNotifs = notifications.filter(n => n.isPinned);
  const unreadNotifs = notifications.filter(n => !viewedNotifIds.includes(n.id));

  // Loading skeleton layout
  const renderSkeletons = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      {[1, 2, 3].map((n) => (
        <Card key={n}>
          <CardContent sx={{ py: 3 }}>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width={120} height={20} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Search & Filter Header card */}
      <Card 
        sx={{ 
          mb: 4, 
          borderRadius: 4,
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.05)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Welcome, {studentDetails?.name || user?.displayName || 'Student'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Here is your live updates feed for <b>{studentDetails?.branch}</b>, Year <b>{studentDetails?.year}</b>, Section <b>{studentDetails?.section}</b>.
          </Typography>

          <Grid container spacing={2}>
            {/* Search Bar */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title, description, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  style: { borderRadius: '10px' }
                }}
              />
            </Grid>
            {/* Category Filter */}
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                InputProps={{ style: { borderRadius: '10px' } }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {['Placement', 'Events', 'Results', 'Hackathons', 'Internships', 'Workshops', 'Exams', 'Scholarships', 'General'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Priority Filter */}
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                InputProps={{ style: { borderRadius: '10px' } }}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Feed Section */}
      <Grid container spacing={3}>
        
        {/* Left Side: Filter Options on Desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Card sx={{ position: 'sticky', top: 90 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FilterIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Filter Feeds
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant={activeTab === 0 ? "contained" : "outlined"}
                    onClick={() => setActiveTab(0)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1.25, borderRadius: '8px' }}
                  >
                    All Notifications ({notifications.length})
                  </Button>
                  <Button
                    variant={activeTab === 1 ? "contained" : "outlined"}
                    color="warning"
                    onClick={() => setActiveTab(1)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1.25, borderRadius: '8px' }}
                  >
                    Unread ({unreadNotifs.length})
                  </Button>
                  <Button
                    variant={activeTab === 2 ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setActiveTab(2)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1.25, borderRadius: '8px' }}
                  >
                    Pinned ({pinnedNotifs.length})
                  </Button>
                </Box>

                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Target Profile
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    Branch: {studentDetails?.branch}
                  </Typography>
                  <Typography variant="body2">
                    Year: {studentDetails?.year}
                  </Typography>
                  <Typography variant="body2">
                    Section: {studentDetails?.section}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Right Side: Feeds */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          
          {/* Mobile Tabs */}
          {isMobile && (
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
              <Tab label={`All (${notifications.length})`} />
              <Tab label={`Unread (${unreadNotifs.length})`} />
              <Tab label={`Pinned (${pinnedNotifs.length})`} />
            </Tabs>
          )}

          {/* Sticky Pinned Announcements Banner (Only in All and Unread feeds) */}
          {activeTab !== 2 && pinnedNotifs.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
                <PinIcon sx={{ fontSize: 16 }} /> STICKY ANNOUNCEMENTS
              </Typography>
              <Grid container spacing={2}>
                {pinnedNotifs.map((notif) => {
                  const isRead = viewedNotifIds.includes(notif.id);
                  return (
                    <Grid item xs={12} key={notif.id}>
                      <Card
                        onClick={() => handleCardClick(notif.id)}
                        sx={{
                          cursor: 'pointer',
                          borderColor: 'secondary.main',
                          borderWidth: '1.5px',
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 211, 238, 0.04)' : 'rgba(8, 145, 178, 0.02)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
                          <Box sx={{ p: 1, bgcolor: 'secondary.light', borderRadius: 2, color: 'secondary.contrastText', display: 'flex' }}>
                            <PinIcon />
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="700" noWrap>
                                {notif.title}
                              </Typography>
                              <Chip 
                                label={notif.type} 
                                size="small" 
                                color="secondary" 
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} 
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                              {notif.description}
                            </Typography>
                            <Box display="flex" gap={1.5} sx={{ mt: 1.5 }} flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                Published by <b>{notif.createdByName}</b>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Read/Unread controls */}
                          <Box sx={{ alignSelf: 'center' }}>
                            {!isRead ? (
                              <Tooltip title="Mark Read">
                                <IconButton 
                                  color="primary" 
                                  size="small" 
                                  onClick={(e) => handleMarkAsRead(e, notif)}
                                >
                                  <UnreadIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Chip label="Read" size="small" color="default" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Core Feed List */}
          {loading ? (
            renderSkeletons()
          ) : feedList.length === 0 ? (
            <Paper variant="outlined" sx={{ py: 8, textAlign: 'center', borderRadius: 4 }}>
              <AlertIcon color="disabled" sx={{ fontSize: 60, mb: 1.5 }} />
              <Typography variant="subtitle1" fontWeight="700">
                Your Feed is Empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                There are no active notifications matching your search or filters.
              </Typography>
            </Paper>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {feedList.map((notif) => {
                const isRead = viewedNotifIds.includes(notif.id);
                const isHighPriority = notif.priority === 'High';
                
                return (
                  <Card
                    key={notif.id}
                    onClick={() => handleCardClick(notif.id)}
                    sx={{
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Top border edge color coding for high priority */}
                    {isHighPriority && (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'error.main' }} />
                    )}

                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={notif.type} 
                            size="small" 
                            color="primary"
                            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700 }} 
                          />
                          <Chip 
                            label={notif.priority} 
                            size="small" 
                            color={notif.priority === 'High' ? 'error' : notif.priority === 'Medium' ? 'warning' : 'info'}
                            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700 }} 
                          />
                          {notif.isPinned && (
                            <Chip 
                              icon={<PinIcon style={{ fontSize: 12 }} />}
                              label="PINNED" 
                              size="small" 
                              color="secondary"
                              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700 }} 
                            />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          {isRead ? (
                            <Chip 
                              icon={<CheckCircleIcon style={{ color: theme.palette.success.main }} />}
                              label="READ" 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 24, fontSize: '0.7rem', fontWeight: 800, borderColor: 'success.main', color: 'success.main' }} 
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<UnreadIcon />}
                              onClick={(e) => handleMarkAsRead(e, notif)}
                              sx={{ 
                                height: 24, 
                                py: 0, 
                                px: 1, 
                                fontSize: '0.7rem', 
                                fontWeight: 700,
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              Mark Read
                            </Button>
                          )}
                        </Box>
                      </Box>

                      <Typography variant="h6" fontWeight="800" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
                        {notif.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {notif.description}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          Published by <b>{notif.createdByName}</b> • {new Date(notif.createdAt).toLocaleDateString()}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1.5}>
                          {notif.attachment && (
                            <Box 
                              display="flex" 
                              alignItems="center" 
                              gap={0.5} 
                              sx={{ 
                                color: 'primary.main', 
                                fontSize: '0.75rem', 
                                fontWeight: 700 
                              }}
                            >
                              <DownloadIcon fontSize="inherit" /> Attachment
                            </Box>
                          )}
                          <Box display="flex" alignItems="center" sx={{ color: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                            Details <ArrowForwardIcon fontSize="inherit" sx={{ ml: 0.5 }} />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

        </Grid>
      </Grid>
      
      {/* Real-time Notice Toaster */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={8000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity={newNotifAlert?.priority === 'High' ? 'error' : newNotifAlert?.priority === 'Medium' ? 'warning' : 'info'}
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
          variant="filled"
        >
          <Box>
            <Typography variant="subtitle2" fontWeight="700">
              New Broadcast Announcement!
            </Typography>
            <Typography variant="body2" sx={{ my: 0.5 }}>
              {newNotifAlert?.title}
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.85 }} display="block">
              Published by {newNotifAlert?.createdByName}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}
