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
  useScrollTrigger
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsIcon from '@mui/icons-material/Sports';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventMap from '../components/EventMap';
import EventList from '../components/EventList';
import CreateEventDialog from '../components/CreateEventDialog';
import LoadingAnimation from '../components/LoadingAnimation';
import useEventStore from '../store/eventStore';
import eventApi from '../services/eventApi';
import logo from '../assets/logo.png';

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
      message: 'Event created successfully! 🎉',
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
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#ecf0f1' }}>
      {/* App Bar */}
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            borderBottom: '3px solid #e74c3c',
            borderRadius: 0,
          }}
        >
          <Toolbar sx={{ py: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Eventra Logo"
                sx={{
                  width: 55,
                  height: 55,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                }}
              />
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1.1,
                    letterSpacing: '1px',
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  Eventra
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#ecf0f1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    letterSpacing: '2px',
                    fontFamily: '"Lato", sans-serif',
                    textTransform: 'uppercase',
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
                label={`${events.length} Total`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 700,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  fontFamily: '"Lato", sans-serif',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                  }
                }}
              />
              <Chip
                icon={<TrendingUpIcon />}
                label={`${getUpcomingEventsCount()} Upcoming`}
                sx={{
                  bgcolor: '#27ae60',
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: '"Lato", sans-serif',
                  border: '2px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: '#229954',
                  }
                }}
              />
            </Stack>
            
            <Tooltip title="Refresh Events">
              <IconButton 
                color="inherit" 
                onClick={fetchEvents} 
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.5s ease',
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
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '2px solid rgba(255,255,255,0.2)',
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.7)',
                  border: 'none',
                  px: 3,
                  py: 1,
                  fontFamily: '"Lato", sans-serif',
                  fontWeight: 700,
                  '&.Mui-selected': {
                    bgcolor: '#e74c3c',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#c0392b',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
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
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
              border: '2px solid #e74c3c',
              fontFamily: '"Lato", sans-serif',
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            height: 'calc(100vh - 220px)', 
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(44, 62, 80, 0.15)',
            border: '3px solid #bdc3c7',
          }}
        >
          {loading ? (
            <LoadingAnimation message="Loading Sports Events..." />
          ) : (
            <>
              {view === 'map' ? (
                <EventMap events={events} onMarkerClick={handleMarkerClick} />
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8f9fa' }}>
                  <EventList events={events} onEventClick={handleEventClick} />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Tooltip title="Create New Event" placement="left">
        <Fab
          color="primary"
          aria-label="add event"
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            width: 70,
            height: 70,
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            boxShadow: '0 8px 32px rgba(231, 76, 60, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 12px 48px rgba(231, 76, 60, 0.6)',
            },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={handleCreateEvent}
        >
          <AddIcon sx={{ fontSize: 36 }} />
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
            fontWeight: 700,
            fontFamily: '"Lato", sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
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