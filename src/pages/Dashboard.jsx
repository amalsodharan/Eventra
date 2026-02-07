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
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Slide,
  useScrollTrigger
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventMap from '../components/EventMap';
import EventList from '../components/EventList';
import CreateEventDialog from '../components/CreateEventDialog';
import useEventStore from '../store/eventStore';
import eventApi from '../services/eventApi';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Dashboard = () => {
  const [view, setView] = useState('map');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { events, loading, error, setEvents, setLoading, setError, addEvent, setSelectedEvent } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await eventApi.getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
      
      if (!Array.isArray(data)) {
        console.warn('Expected array of events, got:', data);
      }
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load events',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleCreateEvent = () => {
    setDialogOpen(true);
  };

  const handleEventCreated = (newEvent) => {
    addEvent(newEvent);
    setSnackbar({
      open: true,
      message: 'Sports event created successfully! 🎉',
      severity: 'success'
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getUpcomingEventsCount = () => {
    const now = new Date();
    return events.filter(event => {
      try {
        const eventDate = new Date(event.start_date);
        return eventDate >= now;
      } catch {
        return false;
      }
    }).length;
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                component="img"
                src="src/assets/logo.png"
                alt="Eventra Logo"
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'contain',
                }}
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1.2,
                    letterSpacing: '0.5px',
                  }}
                >
                  Eventra
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.95)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Play. Host. Discover.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Stats */}
            <Stack direction="row" spacing={2} sx={{ mr: 3, display: { xs: 'none', md: 'flex' } }}>
              <Chip
                icon={<SportsIcon />}
                label={`${events.length} Total Events`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <Chip
                icon={<TrendingUpIcon />}
                label={`${getUpcomingEventsCount()} Upcoming`}
                sx={{
                  bgcolor: 'rgba(52, 168, 83, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
            </Stack>
            
            <Tooltip title="Refresh Events">
              <IconButton 
                color="inherit" 
                onClick={fetchEvents} 
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                  },
                  mr: 2,
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.35)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                },
              }}
            >
              <ToggleButton value="map">
                <MapIcon sx={{ mr: 1, fontSize: 20 }} />
                Map
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon sx={{ mr: 1, fontSize: 20 }} />
                List
              </ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(234, 67, 53, 0.15)',
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            height: 'calc(100vh - 180px)', 
            overflow: 'hidden',
            borderRadius: 1,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              gap: 2,
            }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                Loading Sports Events...
              </Typography>
            </Box>
          ) : (
            <>
              {view === 'map' ? (
                <EventMap events={events} onMarkerClick={handleMarkerClick} />
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#fafafa' }}>
                  <EventList events={events} onEventClick={handleEventClick} />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Tooltip title="Create New Sports Event" placement="left">
        <Fab
          color="primary"
          aria-label="add event"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            boxShadow: '0 8px 24px rgba(26, 115, 232, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1557b0 0%, #1a73e8 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 12px 32px rgba(26, 115, 232, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
          onClick={handleCreateEvent}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
