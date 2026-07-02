import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, storageService, Notification, NotificationView } from '../config/firebase';
import { CSVExport } from '../components/CSVExport';
import { PDFExport } from '../components/PDFExport';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as ReceiptIcon,
  Campaign as CampaignIcon,
  PushPin as PinIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
  DeleteOutline as DeleteOutlineIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

export function AgentDashboardPage() {
  const { user, agentDetails } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';
  const showCreateAction = searchParams.get('action') === 'create';

  // Subscribed Data States
  const [myNotifications, setMyNotifications] = useState<Notification[]>([]);
  const [allViews, setAllViews] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Notification for Read Receipts Tab
  const [selectedNotifId, setSelectedNotifId] = useState<string>('');
  const [notifReceipts, setNotifReceipts] = useState<NotificationView[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState<boolean>(false);

  // Create/Edit Dialog States
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  
  // Form fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<Notification['type']>('General');
  const [priority, setPriority] = useState<Notification['priority']>('Medium');
  const [targetBranch, setTargetBranch] = useState<string>('All');
  const [targetYear, setTargetYear] = useState<string>('All');
  const [targetSection, setTargetSection] = useState<string>('All');
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  
  // Attachment fields
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [existingAttachment, setExistingAttachment] = useState<Notification['attachment']>(null);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Load subscriptions for active agent
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Subscribe to notifications created by this agent
    const unsubNotifs = dbService.subscribeNotifications({}, (data) => {
      const filtered = data.filter(n => n.createdBy === user.uid);
      setMyNotifications(filtered);
    });

    // Subscribe to all notification views
    const unsubViews = dbService.subscribeAllNotificationViews((data) => {
      setAllViews(data);
      setLoading(false);
    });

    return () => {
      unsubNotifs();
      unsubViews();
    };
  }, [user]);

  // Handle open dialog action query params
  useEffect(() => {
    if (showCreateAction) {
      handleOpenCreateDialog();
      // Remove action param to avoid dialog reopening
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [showCreateAction]);

  // Subscribe to read receipts when selected notification changes
  useEffect(() => {
    if (!selectedNotifId) {
      setNotifReceipts([]);
      return;
    }

    setReceiptsLoading(true);
    const unsubscribe = dbService.subscribeNotificationViews(selectedNotifId, (views) => {
      setNotifReceipts(views);
      setReceiptsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedNotifId]);

  const handleOpenCreateDialog = () => {
    setEditingNotif(null);
    setTitle('');
    setDescription('');
    setType('General');
    setPriority('Medium');
    setTargetBranch('All');
    setTargetYear('All');
    setTargetSection('All');
    setIsPinned(false);
    setExpiryDate('');
    setAttachedFile(null);
    setExistingAttachment(null);
    setUploadProgress(0);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (notif: Notification) => {
    setEditingNotif(notif);
    setTitle(notif.title);
    setDescription(notif.description);
    setType(notif.type);
    setPriority(notif.priority);
    setTargetBranch(notif.targetBranch);
    setTargetYear(notif.targetYear);
    setTargetSection(notif.targetSection);
    setIsPinned(!!notif.isPinned);
    setExpiryDate(notif.expiryDate || '');
    setAttachedFile(null);
    setExistingAttachment(notif.attachment || null);
    setUploadProgress(0);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setExistingAttachment(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setExistingAttachment(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setFormError("Title and Description are required.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      let attachmentPayload = existingAttachment;

      // Handle upload if new file is selected
      if (attachedFile) {
        setUploadProgress(20);
        const downloadUrl = await storageService.uploadFile(attachedFile, `attachments/${user?.uid}`);
        setUploadProgress(90);
        attachmentPayload = {
          name: attachedFile.name,
          url: downloadUrl,
          type: attachedFile.type
        };
      }

      const notifData: any = {
        title,
        description,
        type,
        priority,
        createdBy: user?.uid || 'agent',
        createdByName: agentDetails?.name || user?.displayName || 'Faculty Agent',
        targetBranch,
        targetYear,
        targetSection,
        isPinned,
        expiryDate: expiryDate || null
      };

      if (attachmentPayload !== undefined) {
        notifData.attachment = attachmentPayload;
      }

      if (editingNotif) {
        await dbService.updateNotification(editingNotif.id, notifData);
      } else {
        await dbService.createNotification(notifData);
      }

      setDialogOpen(false);
    } catch (e: any) {
      setFormError(e.message || "Failed to submit. Please try again.");
    } finally {
      setFormLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await dbService.deleteNotification(id);
        if (selectedNotifId === id) {
          setSelectedNotifId('');
        }
      } catch (e) {
        console.error("Failed to delete notification:", e);
      }
    }
  };

  // Compile Chart data for Agent
  const compileChartData = () => {
    const typesMap: Record<string, number> = {
      Placement: 0, Events: 0, Results: 0, Hackathons: 0,
      Internships: 0, Workshops: 0, Exams: 0, Scholarships: 0, General: 0
    };
    const prioritiesMap: Record<string, number> = { Low: 0, Medium: 0, High: 0 };

    myNotifications.forEach(n => {
      const typeVal = typesMap[n.type];
      if (typeVal !== undefined) {
        typesMap[n.type] = typeVal + 1;
      }
      const priorityVal = prioritiesMap[n.priority];
      if (priorityVal !== undefined) {
        prioritiesMap[n.priority] = priorityVal + 1;
      }
    });

    const typeChartData = Object.keys(typesMap).map(key => ({ name: key, value: typesMap[key] ?? 0 }));
    const priorityChartData = ['Low', 'Medium', 'High'].map(key => ({ name: key, value: prioritiesMap[key] ?? 0 }));

    return { typeChartData, priorityChartData };
  };

  const { typeChartData, priorityChartData } = compileChartData();

  // Metrics summaries
  const totalMyNotifs = myNotifications.length;
  const totalMyViews = allViews.filter(v => myNotifications.some(n => n.id === v.notificationId)).length;
  const pinnedMyNotifs = myNotifications.filter(n => n.isPinned).length;
  const engagementIndex = totalMyNotifs > 0 ? (totalMyViews / totalMyNotifs).toFixed(1) : '0';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Faculty Agent Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Publish notices, schedule notifications, configure student target settings, and view read receipts.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{ fontWeight: 600 }}
        >
          Create Notice
        </Button>
      </Box>

      {/* Overview Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="700">My Broadcasts</Typography>
              <Typography variant="h3" fontWeight="800" sx={{ my: 1 }}>{totalMyNotifs}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Active announcements</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="700">Total Student Views</Typography>
              <Typography variant="h3" fontWeight="800" sx={{ my: 1 }}>{totalMyViews}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Read logs accumulated</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="700">Pinned Notices</Typography>
              <Typography variant="h3" fontWeight="800" sx={{ my: 1 }}>{pinnedMyNotifs}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Sticky alerts at top feed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight="700">Read Index</Typography>
              <Typography variant="h3" fontWeight="800" sx={{ my: 1 }}>{engagementIndex}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Average views per post</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Button 
          variant={activeTab === 'posts' ? 'contained' : 'text'} 
          onClick={() => setSearchParams({ tab: 'posts' })}
          sx={{ mr: 1, borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          My Posts
        </Button>
        <Button 
          variant={activeTab === 'receipts' ? 'contained' : 'text'} 
          onClick={() => setSearchParams({ tab: 'receipts' })}
          sx={{ mr: 1, borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          Read Receipts
        </Button>
        <Button 
          variant={activeTab === 'analytics' ? 'contained' : 'text'} 
          onClick={() => setSearchParams({ tab: 'analytics' })}
          sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          Analytics
        </Button>
      </Box>

      {/* --- POSTS TAB --- */}
      {activeTab === 'posts' && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Active Broadcast Logs ({myNotifications.length})
            </Typography>
            {myNotifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                You have not published any notifications. Click "Create Notice" to get started.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Targets (B/Y/S)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myNotifications.map((notif) => (
                      <TableRow key={notif.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {notif.isPinned && <PinIcon color="primary" fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />}
                          <span style={{ verticalAlign: 'middle' }}>{notif.title}</span>
                        </TableCell>
                        <TableCell>
                          <Chip label={notif.type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={notif.priority.toUpperCase()} 
                            size="small" 
                            color={notif.priority === 'High' ? 'error' : notif.priority === 'Medium' ? 'warning' : 'info'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          {notif.targetBranch} / Y{notif.targetYear} / S{notif.targetSection}
                        </TableCell>
                        <TableCell>{new Date(notif.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Read Receipts">
                            <IconButton 
                              onClick={() => {
                                setSelectedNotifId(notif.id);
                                setSearchParams({ tab: 'receipts' });
                              }} 
                              color="primary" 
                              size="small"
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Post">
                            <IconButton onClick={() => handleOpenEditDialog(notif)} color="secondary" size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Post">
                            <IconButton onClick={() => handleDeleteNotif(notif.id)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- READ RECEIPTS TAB --- */}
      {activeTab === 'receipts' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>
                  Select Broadcast Notice
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {myNotifications.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No publications available.</Typography>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {myNotifications.map((notif) => (
                      <Button
                        key={notif.id}
                        variant={selectedNotifId === notif.id ? "contained" : "outlined"}
                        onClick={() => setSelectedNotifId(notif.id)}
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          py: 1.25,
                          borderRadius: '8px'
                        }}
                      >
                        <Typography variant="body2" fontWeight="700" noWrap sx={{ width: '100%' }}>
                          {notif.title}
                        </Typography>
                      </Button>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="700">
                    Read Receipts Log ({notifReceipts.length} Views)
                  </Typography>
                  {selectedNotifId && notifReceipts.length > 0 && (
                    <Box display="flex" gap={1}>
                      <CSVExport 
                        data={notifReceipts} 
                        headers={[
                          { label: 'Student Roll ID', key: 'studentId' },
                          { label: 'Student Name', key: 'studentName' },
                          { label: 'Viewed Timestamp', key: 'viewedAt' },
                          { label: 'Access Device', key: 'device' }
                        ]}
                        filename={`receipts_${selectedNotifId}`}
                      />
                      <PDFExport
                        data={notifReceipts}
                        headers={[
                          { label: 'Roll ID', key: 'studentId' },
                          { label: 'Student Name', key: 'studentName' },
                          { label: 'Viewed Timestamp', key: 'viewedAt' },
                          { label: 'Access Device', key: 'device' }
                        ]}
                        filename={`receipts_${selectedNotifId}`}
                        title="Notification Read Receipts Log"
                        subtitle={`Audit list for Notice ID: ${selectedNotifId}`}
                      />
                    </Box>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {!selectedNotifId ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                    <CampaignIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Select a broadcast notice from the panel to view its read receipts.
                    </Typography>
                  </Box>
                ) : receiptsLoading ? (
                  <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                  </Box>
                ) : notifReceipts.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                    <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      No student has read this notification yet.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Roll ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Viewed At</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Device Profile</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notifReceipts.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell sx={{ fontWeight: 600 }}>{r.studentName}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{r.studentId}</TableCell>
                            <TableCell>{new Date(r.viewedAt).toLocaleString()}</TableCell>
                            <TableCell>{r.device}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <AnalyticsCharts typeData={typeChartData} priorityData={priorityChartData} />
      )}

      {/* COMPOSE DIALOG (Create/Edit) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingNotif ? "Modify Broadcast Announcement" : "Create Broadcast Announcement"}
          </DialogTitle>
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}
            
            <TextField
              label="Broadcast Title"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Placement Drive: TechCore"
              InputProps={{ style: { borderRadius: 10 } }}
            />
            
            <TextField
              label="Announcement Description"
              required
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information regarding dates, links, eligibility criteria..."
              InputProps={{ style: { borderRadius: 10 } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={type}
                  onChange={(e) => setType(e.target.value as Notification['type'])}
                  InputProps={{ style: { borderRadius: 10 } }}
                >
                  {['Placement', 'Events', 'Results', 'Hackathons', 'Internships', 'Workshops', 'Exams', 'Scholarships', 'General'].map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Priority Level"
                  fullWidth
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Notification['priority'])}
                  InputProps={{ style: { borderRadius: 10 } }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Target Settings */}
            <Typography variant="subtitle2" fontWeight="700" sx={{ mt: 1 }}>
              Granular Student Target Constraints
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Branch"
                  fullWidth
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  InputProps={{ style: { borderRadius: 10 } }}
                >
                  <MenuItem value="All">All Branches</MenuItem>
                  <MenuItem value="CSE">CSE</MenuItem>
                  <MenuItem value="ECE">ECE</MenuItem>
                  <MenuItem value="MECH">MECH</MenuItem>
                  <MenuItem value="CIVIL">CIVIL</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Year"
                  fullWidth
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  InputProps={{ style: { borderRadius: 10 } }}
                >
                  <MenuItem value="All">All Years</MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Section"
                  fullWidth
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  InputProps={{ style: { borderRadius: 10 } }}
                >
                  <MenuItem value="All">All Sections</MenuItem>
                  <MenuItem value="A">Section A</MenuItem>
                  <MenuItem value="B">Section B</MenuItem>
                  <MenuItem value="C">Section C</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date/Time"
                  type="datetime-local"
                  fullWidth
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ style: { borderRadius: 10 } }}
                  helperText="Leave blank for no expiration"
                />
              </Grid>
              <Grid item xs={6} display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Pin announcement to top feed"
                  sx={{ ml: 0.5 }}
                />
              </Grid>
            </Grid>

            {/* File Upload Attachment Row */}
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight="700">
              Notice Attachment (PDF / JPG)
            </Typography>

            {existingAttachment && (
              <Box display="flex" alignItems="center" gap={1} p={1.5} bgcolor="action.hover" borderRadius={2}>
                <FileIcon color="primary" />
                <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                  {existingAttachment.name}
                </Typography>
                <IconButton size="small" onClick={handleRemoveAttachment} color="error">
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            )}

            {attachedFile && (
              <Box display="flex" alignItems="center" gap={1} p={1.5} bgcolor="action.hover" borderRadius={2}>
                <FileIcon color="primary" />
                <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                  {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                </Typography>
                <IconButton size="small" onClick={handleRemoveAttachment} color="error">
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            )}

            {!attachedFile && !existingAttachment && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '10px' }}
              >
                Upload Attachment File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                />
              </Button>
            )}

            {uploadProgress > 0 && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Uploading file: {uploadProgress}%
                </Typography>
              </Box>
            )}

          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formLoading}
              sx={{ fontWeight: 600 }}
            >
              {formLoading ? <CircularProgress size={20} color="inherit" /> : editingNotif ? "Save Modifications" : "Publish Broadcast"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
}
