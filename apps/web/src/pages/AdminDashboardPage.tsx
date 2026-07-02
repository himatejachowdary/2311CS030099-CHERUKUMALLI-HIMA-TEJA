import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dbService, authService, Student, Agent, Notification, NotificationView } from '../config/firebase';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { CSVExport } from '../components/CSVExport';
import { PDFExport } from '../components/PDFExport';
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
  Switch,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  Notifications as NotificationsIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Subscribed Data States
  const [agents, setAgents] = useState<Agent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [views, setViews] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Agent Form States
  const [agentDialogOpen, setAgentDialogOpen] = useState<boolean>(false);
  const [agentName, setAgentName] = useState<string>('');
  const [agentEmail, setAgentEmail] = useState<string>('');
  const [agentDept, setAgentDept] = useState<string>('');
  const [agentPassword, setAgentPassword] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Load subscriptions
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to all notifications (empty filters)
    const unsubNotifs = dbService.subscribeNotifications({}, (data) => {
      setNotifications(data);
    });

    // Subscribe to agents list
    const unsubAgents = dbService.subscribeAgents((data) => {
      setAgents(data);
    });

    // Subscribe to students list
    const unsubStudents = dbService.subscribeStudents((data) => {
      setStudents(data);
    });

    // Subscribe to all notification views
    const unsubViews = dbService.subscribeAllNotificationViews((data) => {
      setViews(data);
      setLoading(false);
    });

    return () => {
      unsubNotifs();
      unsubAgents();
      unsubStudents();
      unsubViews();
    };
  }, []);

  // Form Submission: Create Agent
  const handleCreateAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !agentEmail || !agentDept || !agentPassword) {
      setFormError("All fields are required.");
      return;
    }
    if (agentPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await authService.createAgent({
        name: agentName,
        email: agentEmail,
        department: agentDept
      }, agentPassword);

      // Reset
      setAgentName('');
      setAgentEmail('');
      setAgentDept('');
      setAgentPassword('');
      setAgentDialogOpen(false);
    } catch (e: any) {
      setFormError(e.message || "Failed to create agent. Email may be already in use.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleAgentStatus = async (agent: Agent) => {
    try {
      const newStatus = agent.status === 'active';
      await authService.disableAgent(agent.id, newStatus);
    } catch (e) {
      console.error("Failed to alter agent status:", e);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      try {
        await authService.deleteAgent(id);
      } catch (e) {
        console.error("Failed to delete agent:", e);
      }
    }
  };

  // Compile Analytics Datasets
  const compileChartData = () => {
    // 1. Notification Categories
    const typesMap: Record<string, number> = {
      Placement: 0, Events: 0, Results: 0, Hackathons: 0, 
      Internships: 0, Workshops: 0, Exams: 0, Scholarships: 0, General: 0
    };
    
    // 2. Priorities
    const prioritiesMap: Record<string, number> = {
      Low: 0, Medium: 0, High: 0
    };

    notifications.forEach(n => {
      const typeVal = typesMap[n.type];
      if (typeVal !== undefined) {
        typesMap[n.type] = typeVal + 1;
      }
      const priorityVal = prioritiesMap[n.priority];
      if (priorityVal !== undefined) {
        prioritiesMap[n.priority] = priorityVal + 1;
      }
    });

    const typeChartData = Object.keys(typesMap).map(key => ({
      name: key,
      value: typesMap[key] ?? 0
    }));

    const priorityChartData = ['Low', 'Medium', 'High'].map(key => ({
      name: key,
      value: prioritiesMap[key] ?? 0
    }));

    return { typeChartData, priorityChartData };
  };

  const { typeChartData, priorityChartData } = compileChartData();

  // Metrics summary
  const totalNotificationsCount = notifications.length;
  const totalAgentsCount = agents.length;
  const totalStudentsCount = students.length;
  const totalViewsCount = views.length;
  
  // Engagement rates
  const averageViewsPerNotif = totalNotificationsCount > 0 
    ? (totalViewsCount / totalNotificationsCount).toFixed(1) 
    : '0';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={45} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Title Header */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Administration Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage agents, audit notifications, and view platform engagement statistics.
          </Typography>
        </Box>
        {activeTab === 'agents' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAgentDialogOpen(true)}
            sx={{ fontWeight: 600 }}
          >
            Create Faculty Agent
          </Button>
        )}
      </Box>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <Grid container spacing={3}>
          {/* Key Metrics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Broadcasts" 
              value={totalNotificationsCount} 
              sub="Notifications generated" 
              icon={<NotificationsIcon color="primary" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Agents" 
              value={totalAgentsCount} 
              sub="Department authors" 
              icon={<BadgeIcon color="secondary" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Students" 
              value={totalStudentsCount} 
              sub="Enrolled platform users" 
              icon={<PeopleIcon color="info" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Avg views/Notif" 
              value={averageViewsPerNotif} 
              sub="Read engagement index" 
              icon={<TrendingUpIcon color="success" />} 
            />
          </Grid>

          {/* Charts section */}
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <AnalyticsCharts typeData={typeChartData} priorityData={priorityChartData} />
            </Box>
          </Grid>

          {/* Recent Platform Activities */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Recent Notifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {notifications.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No notifications published yet.</Typography>
                ) : (
                  <List>
                    {notifications.slice(0, 5).map((notif) => (
                      <ListItem key={notif.id} disableGutters sx={{ alignItems: 'flex-start', py: 1 }}>
                        <ListItemText
                          primary={notif.title}
                          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" color="primary.main" fontWeight="600" component="span">
                                {notif.type} • {notif.priority}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                By {notif.createdByName} on {new Date(notif.createdAt).toLocaleDateString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Recent Student Activity (Read Receipts)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {views.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No notifications read yet.</Typography>
                ) : (
                  <List>
                    {views.slice(0, 5).map((v) => (
                      <ListItem key={v.id} disableGutters sx={{ py: 1 }}>
                        <ListItemText
                          primary={`${v.studentName} opened a notification`}
                          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" color="text.secondary">
                                Device: {v.device} • Viewed at {new Date(v.viewedAt).toLocaleTimeString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* --- AGENTS TAB --- */}
      {activeTab === 'agents' && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="700">
                Registered Faculty Agents ({agents.length})
              </Typography>
              <Box display="flex" gap={1}>
                <CSVExport 
                  data={agents} 
                  headers={[
                    { label: 'Agent ID', key: 'id' },
                    { label: 'Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Department', key: 'department' },
                    { label: 'Status', key: 'status' },
                    { label: 'Created At', key: 'createdAt' }
                  ]}
                  filename="campus_agents_report"
                />
                <PDFExport
                  data={agents}
                  headers={[
                    { label: 'Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Department', key: 'department' },
                    { label: 'Status', key: 'status' }
                  ]}
                  filename="campus_agents_report"
                  title="Registered Faculty Agents Report"
                  subtitle="Detailed department layout of notification creators"
                />
              </Box>
            </Box>
            
            {agents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No campus agents created yet. Click "Create Faculty Agent" to initialize one.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Enable/Disable</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{agent.name}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>
                          <Chip label={agent.department} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={agent.status.toUpperCase()} 
                            size="small" 
                            color={agent.status === 'active' ? 'success' : 'error'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={agent.status === 'active'}
                            onChange={() => handleToggleAgentStatus(agent)}
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleDeleteAgent(agent.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
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

      {/* --- STUDENTS TAB --- */}
      {activeTab === 'students' && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="700">
                Registered Students Directory ({students.length})
              </Typography>
              <Box display="flex" gap={1}>
                <CSVExport 
                  data={students} 
                  headers={[
                    { label: 'Student ID', key: 'id' },
                    { label: 'Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Branch', key: 'branch' },
                    { label: 'Year', key: 'year' },
                    { label: 'Section', key: 'section' },
                    { label: 'Registered At', key: 'createdAt' }
                  ]}
                  filename="campus_students_directory"
                />
                <PDFExport
                  data={students}
                  headers={[
                    { label: 'Student ID', key: 'id' },
                    { label: 'Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Branch', key: 'branch' },
                    { label: 'Year', key: 'year' },
                    { label: 'Sec', key: 'section' }
                  ]}
                  filename="campus_students_directory"
                  title="Registered Students Directory"
                  subtitle="Consolidated roll sheets by target branches and academic grades"
                />
              </Box>
            </Box>

            {students.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No students enrolled in the system directory yet.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Roll ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Branch</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Academic Year</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Section</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell align="center">
                          <Chip label={student.branch} size="small" color="primary" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="center">Year {student.year}</TableCell>
                        <TableCell align="center">Sec {student.section}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- NOTIFICATIONS TAB --- */}
      {activeTab === 'notifications' && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Notification Audit Log ({notifications.length})
            </Typography>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No notifications logged.
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
                      <TableCell sx={{ fontWeight: 700 }}>Publisher</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications.map((notif) => (
                      <TableRow key={notif.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{notif.title}</TableCell>
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
                          {notif.targetBranch} / Year {notif.targetYear} / Sec {notif.targetSection}
                        </TableCell>
                        <TableCell>{notif.createdByName}</TableCell>
                        <TableCell>{new Date(notif.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="700">
                Engagement & System Reports
              </Typography>
              <Box display="flex" gap={1}>
                <CSVExport
                  data={views}
                  headers={[
                    { label: 'View ID', key: 'id' },
                    { label: 'Notification ID', key: 'notificationId' },
                    { label: 'Student ID', key: 'studentId' },
                    { label: 'Student Name', key: 'studentName' },
                    { label: 'Viewed At', key: 'viewedAt' },
                    { label: 'Device Info', key: 'device' }
                  ]}
                  filename="campus_engagement_views"
                  buttonLabel="Download Views CSV"
                />
                <PDFExport
                  data={views}
                  headers={[
                    { label: 'Student Name', key: 'studentName' },
                    { label: 'Viewed At', key: 'viewedAt' },
                    { label: 'Device Info', key: 'device' }
                  ]}
                  filename="campus_engagement_views"
                  title="Notification Read Receipts Audit"
                  subtitle="Logged student engagement timelines"
                  buttonLabel="Download Views PDF"
                />
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>
              Notification Read Receipt Feeds ({views.length} logs)
            </Typography>

            {views.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No read receipt entries logged on notifications.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Roll ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Notification ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Device / Browser</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Read Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {views.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{v.studentName}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.studentId}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{v.notificationId}</TableCell>
                        <TableCell>{v.device}</TableCell>
                        <TableCell>{new Date(v.viewedAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE AGENT DIALOG */}
      <Dialog open={agentDialogOpen} onClose={() => setAgentDialogOpen(false)} PaperProps={{ style: { borderRadius: 16 } }}>
        <Box component="form" onSubmit={handleCreateAgentSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Create Faculty Agent Account</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: { sm: 400 } }}>
            {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}
            
            <TextField
              label="Full Name"
              required
              fullWidth
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Dr. Ananya Sen"
              InputProps={{ style: { borderRadius: 10 } }}
            />
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
              placeholder="e.g. ananya@campus.edu"
              InputProps={{ style: { borderRadius: 10 } }}
            />
            <TextField
              select
              label="Faculty Department"
              required
              fullWidth
              value={agentDept}
              onChange={(e) => setAgentDept(e.target.value)}
              InputProps={{ style: { borderRadius: 10 } }}
            >
              <MenuItem value="CSE">Computer Science (CSE)</MenuItem>
              <MenuItem value="ECE">Electronics & Comm (ECE)</MenuItem>
              <MenuItem value="MECH">Mechanical Eng (MECH)</MenuItem>
              <MenuItem value="CIVIL">Civil Eng (CIVIL)</MenuItem>
              <MenuItem value="MATH">Mathematics (MATH)</MenuItem>
              <MenuItem value="CHEM">Chemistry (CHEM)</MenuItem>
            </TextField>
            <TextField
              label="Initial Password"
              type="password"
              required
              fullWidth
              value={agentPassword}
              onChange={(e) => setAgentPassword(e.target.value)}
              placeholder="Min 6 characters"
              InputProps={{ style: { borderRadius: 10 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setAgentDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formLoading}
              sx={{ fontWeight: 600 }}
            >
              {formLoading ? <CircularProgress size={20} color="inherit" /> : "Provision Account"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

// Subcomponent: Metric Display Card
interface StatCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, sub, icon }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="700">
            {title}
          </Typography>
          <Box sx={{ 
            bgcolor: 'action.hover', 
            borderRadius: '8px', 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', my: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight="600">
          {sub}
        </Typography>
      </CardContent>
    </Card>
  );
}
