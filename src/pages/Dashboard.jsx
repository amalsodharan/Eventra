import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Fab,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Slide,
  useScrollTrigger,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsIcon from '@mui/icons-material/Sports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import EventMap from '../components/EventMap';
import EventList from '../components/EventList';
import CreateEventDialog from '../components/CreateEventDialog';
import LoadingAnimation from '../components/LoadingAnimation';
import useEventStore from '../store/eventStore';
import eventApi from '../services/eventApi';
import authService from '../services/authService';
import logo from '../assets/logo.png';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [view, setView] = useState('map');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const { events, loading, error, setEvents, setLoading, setError, setSelectedEvent } = useEventStore();

  const user = authService.getUser();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventApi.getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message || 'Failed to load events', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) setView(newView);
  };

  // Called after CreateEventDialog succeeds — refresh map/list
  const handleEventCreated = async () => {
    setSnackbar({ open: true, message: 'Sports event created successfully! 🎉', severity: 'success' });
    await fetchEvents();
  };

  // Called after EditEventDialog succeeds — refresh map/list
  const handleEventUpdated = async () => {
    setSnackbar({ open: true, message: 'Event updated successfully! ✏️', severity: 'success' });
    await fetchEvents();
  };

  // Called after delete succeeds — refresh map/list
  const handleEventDeleted = async () => {
    setSnackbar({ open: true, message: 'Event deleted successfully! 🗑️', severity: 'info' });
    await fetchEvents();
  };

  const handleEventClick = (event) => setSelectedEvent(event);
  const handleMarkerClick = (event) => setSelectedEvent(event);
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { handleMenuClose(); onLogout(); };

  const getUpcomingEventsCount = () => {
    const now = new Date();
    return events.filter(event => {
      try { return new Date(event.start_date) >= now; }
      catch { return false; }
    }).length;
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#1A1A2E' }}>
      <HideOnScroll>
        <AppBar
          position="sticky" elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 100%)',
            borderBottom: '2px solid rgba(108, 99, 255, 0.5)',
            borderRadius: 0,
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src={logo} alt="Eventra Logo" sx={{ width: 50, height: 50, objectFit: 'contain' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 500, color: 'white', lineHeight: 1.2, letterSpacing: '1px' }}>
                  Eventra
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Play. Host. Discover.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={2} sx={{ mr: 3, display: { xs: 'none', md: 'flex' } }}>
              <Chip
                icon={<SportsIcon />}
                label={`${events.length} Total Events`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <Chip
                icon={<TrendingUpIcon />}
                label={`${getUpcomingEventsCount()} Upcoming`}
                sx={{ bgcolor: 'rgba(52, 168, 83, 0.9)', color: 'white', fontWeight: 600 }}
              />
            </Stack>

            <Tooltip title="Refresh Events">
              <IconButton
                color="inherit" onClick={fetchEvents} disabled={loading}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, mr: 2 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <ToggleButtonGroup
              value={view} exclusive onChange={handleViewChange}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 2, mr: 2,
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.8)', border: 'none', px: 2, py: 1,
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600 },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                },
              }}
            >
              <ToggleButton value="map"><MapIcon sx={{ mr: 1, fontSize: 20 }} />Map</ToggleButton>
              <ToggleButton value="list"><ViewListIcon sx={{ mr: 1, fontSize: 20 }} />List</ToggleButton>
            </ToggleButtonGroup>

            {/* User Avatar Menu */}
            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, p: 0.5 }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(108, 99, 255, 0.8)', fontSize: '0.9rem', fontWeight: 700 }}>
                  {user?.email?.[0]?.toUpperCase() || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: '#0F0E17', border: '1px solid rgba(108, 99, 255, 0.3)',
                  borderRadius: '12px', mt: 1, minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Signed in as
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFE', fontWeight: 600, mt: 0.25 }}>
                  {user?.email || 'User'}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(108, 99, 255, 0.2)' }} />
              {user?.role === 'admin' && (
                <MenuItem
                  onClick={() => { handleMenuClose(); navigate('/admin'); }}
                  sx={{ color: '#8B85FF', py: 1.5, px: 2, gap: 1.5, '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.1)' } }}
                >
                  <StorageIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Query Runner</Typography>
                </MenuItem>
              )}
              <MenuItem
                onClick={handleLogout}
                sx={{ color: '#FF6584', py: 1.5, px: 2, gap: 1.5, '&:hover': { bgcolor: 'rgba(255, 101, 132, 0.1)' } }}
              >
                <LogoutIcon fontSize="small" />
                <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            height: 'calc(100vh - 180px)', overflow: 'hidden',
            borderRadius: 1, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(108, 99, 255, 0.3)', bgcolor: '#1A1A2E',
          }}
        >
          {loading ? (
            <LoadingAnimation message="Loading Sports Events..." />
          ) : (
            <>
              {view === 'map' ? (
                <EventMap
                  events={events}
                  onMarkerClick={handleMarkerClick}
                  onEventUpdated={handleEventUpdated}
                  onEventDeleted={handleEventDeleted}
                />
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#0F0E17' }}>
                  <EventList
                    events={events}
                    onEventClick={handleEventClick}
                    onEventUpdated={handleEventUpdated}
                    onEventDeleted={handleEventDeleted}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      {/* FAB */}
      <Tooltip title="Create New Sports Event" placement="left">
        <Fab
          color="primary" aria-label="add event"
          sx={{
            position: 'fixed', bottom: 32, right: 32, width: 64, height: 64,
            background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
            boxShadow: '0 8px 24px rgba(108, 99, 255, 0.5)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF6584 0%, #6C63FF 100%)',
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 12px 32px rgba(108, 99, 255, 0.7)',
            },
            transition: 'all 0.3s ease',
          }}
          onClick={() => setDialogOpen(true)}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>

      <CreateEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <Snackbar
        open={snackbar.open} autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar} severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
