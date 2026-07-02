import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, Notification, NotificationView } from '../config/firebase';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityIcon,
  PushPin as PinIcon,
  Assignment as ReceiptIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

export function NotificationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, studentDetails, role } = useAuth();

  const [notification, setNotification] = useState<Notification | null>(null);
  const [receipts, setReceipts] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification details and log view receipt
  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await dbService.getNotificationById(id);
        setNotification(data);

        // 1. Log view tracking if current user is a Student
        if (role === 'student' && user) {
          await dbService.logNotificationView({
            notificationId: id,
            studentId: user.uid,
            studentName: studentDetails?.name || user.displayName || 'Student'
          });
        }
      } catch (err: any) {
        console.error("Error loading notification details:", err);
        setError(err.message || "Failed to load notification details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, user, role, studentDetails]);

  // Load read receipts for Agents and Admins
  useEffect(() => {
    if (!id || role === 'student') return;

    const unsubscribe = dbService.subscribeNotificationViews(id, (data) => {
      setReceipts(data);
    });

    return () => unsubscribe();
  }, [id, role]);

  const handleDownloadAttachment = () => {
    if (!notification?.attachment?.url) return;
    // Trigger download in new tab
    window.open(notification.attachment.url, '_blank');
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (error || !notification) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || "Broadcast notice not found."}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Feed
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
      {/* Back navigation */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, fontWeight: 700 }}
      >
        Go Back
      </Button>

      <Grid container spacing={4}>
        {/* Left Column: Notification Detail */}
        <Grid item xs={12} md={role === 'student' ? 12 : 8}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              
              {/* Category, Priority, Pin Row */}
              <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Chip
                  icon={<CategoryIcon fontSize="small" />}
                  label={notification.type.toUpperCase()}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  icon={<PriorityIcon fontSize="small" />}
                  label={`${notification.priority} Priority`.toUpperCase()}
                  color={getPriorityColor(notification.priority)}
                  sx={{ fontWeight: 700 }}
                />
                {notification.isPinned && (
                  <Chip
                    icon={<PinIcon fontSize="small" />}
                    label="PINNED ALERT"
                    color="secondary"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>

              {/* Title */}
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 3 }}>
                {notification.title}
              </Typography>

              {/* Publisher & Date Metadata Row */}
              <Box display="flex" flexWrap="wrap" alignItems="center" gap={3} sx={{ mb: 4, py: 1.5, borderY: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight="600">
                      PUBLISHED BY
                    </Typography>
                    <Typography variant="body2" fontWeight="700">
                      {notification.createdByName}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light' }}>
                    <DateIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight="600">
                      DATE PUBLISHED
                    </Typography>
                    <Typography variant="body2" fontWeight="700">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                
                {notification.expiryDate && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.light' }}>
                      <DateIcon fontSize="small" color="error" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight="600">
                        EXPIRATION DATE
                      </Typography>
                      <Typography variant="body2" fontWeight="700" color="error.main">
                        {new Date(notification.expiryDate).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Description Body */}
              <Typography variant="body1" color="text.primary" paragraph sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>
                {notification.description}
              </Typography>

              {/* Attachment File Box */}
              {notification.attachment && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5 }}>
                    Attached Resource File
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText', display: 'flex' }}>
                      <FileIcon />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="700" noWrap>
                        {notification.attachment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        File Type: {notification.attachment.type || 'Attachment Document'}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadAttachment}
                      sx={{ fontWeight: 600 }}
                    >
                      Download Resource
                    </Button>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Read receipts (Visible only to Admin and Agent roles) */}
        {role !== 'student' && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon color="primary" sx={{ mr: 1 }} /> Read Receipts ({receipts.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {receipts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No students have read this notice yet.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, border: 'none' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Read Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receipts.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="700" fontSize="0.8rem">
                                {r.studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                                Roll: {r.studentId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" fontSize="0.75rem">
                                {new Date(r.viewedAt).toLocaleTimeString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
