import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavigationIcon from '@mui/icons-material/Navigation';
import LandscapeIcon from '@mui/icons-material/Landscape';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { format } from 'date-fns';
import authService from '../services/authService';
import eventApi from '../services/eventApi';
import EditEventDialog from './EditEventDialog';

const EventList = ({ events, onEventClick, onEventUpdated, onEventDeleted }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const currentUserId = authService.getCurrentUserId();
  const isOwner = (event) => event.user_id && currentUserId && event.user_id === currentUserId;

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return 'TBA';
    try { return format(new Date(dateStr), 'MMM dd, yyyy'); }
    catch { return dateStr; }
  };

  const parseLocation = (locationStr) => {
    if (!locationStr) return null;
    const parts = locationStr.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
  };

  const handleNavigate = (event, e) => {
    e.stopPropagation();
    const coords = parseLocation(event.location);
    if (coords) window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
  };

  const handleEditClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await eventApi.deleteEvent(selectedEvent.id);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      onEventDeleted(); // triggers fetchEvents in Dashboard
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (role) => role === 'admin' ? '#6C63FF' : '#16F4D0';

  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[index % gradients.length];
  };

  if (events.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', p: 4 }}>
        <Box sx={{
          width: 140, height: 140, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, boxShadow: '0 12px 40px rgba(108, 99, 255, 0.4)',
        }}>
          <EmojiEventsIcon sx={{ fontSize: 70, color: 'white' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFE', mb: 1 }}>No Events Yet</Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Be the first to create an exciting sports event and bring the community together!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {events.map((event, index) => {
            const coords = parseLocation(event.location);
            const owned = isOwner(event);

            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    bgcolor: '#1A1A2E',
                    border: owned
                      ? '1px solid rgba(108, 99, 255, 0.4)'
                      : '1px solid rgba(255, 255, 254, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '16px',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.01)',
                      boxShadow: owned
                        ? '0 20px 60px rgba(108, 99, 255, 0.3)'
                        : '0 20px 60px rgba(0,0,0,0.4)',
                      borderColor: owned ? 'rgba(108, 99, 255, 0.6)' : 'rgba(255,255,255,0.15)',
                    },
                    '&::before': {
                      content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                      height: 5, background: getGradient(index),
                    },
                  }}
                  onClick={() => onEventClick && onEventClick(event)}
                >
                  {/* Gradient Header */}
                  <Box sx={{
                    background: getGradient(index), height: 130,
                    position: 'relative', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    <Box sx={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />

                    <Box sx={{
                      width: 72, height: 72, borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 1,
                    }}>
                      <SportsIcon sx={{ fontSize: 36, color: 'white' }} />
                    </Box>

                    {owned && (
                      <Chip
                        label="Your Event" size="small"
                        sx={{
                          position: 'absolute', top: 10, left: 10, zIndex: 2,
                          bgcolor: 'rgba(108, 99, 255, 0.85)', color: 'white',
                          fontWeight: 700, fontSize: '0.65rem', height: 22,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}
                      />
                    )}

                    <Chip
                      label={event.role === 'admin' ? 'OFFICIAL' : 'PUBLIC'} size="small"
                      sx={{
                        position: 'absolute', top: 10, right: 10, zIndex: 2,
                        bgcolor: getRoleColor(event.role),
                        color: event.role === 'admin' ? 'white' : '#0F0E17',
                        fontWeight: 800, fontSize: '0.6rem',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 800, color: '#FFFFFE', mb: 0.5, lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {event.event_name}
                    </Typography>

                    <Typography variant="body2" sx={{
                      color: '#A7A9BE', mb: 1.5, lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {event.desc}
                    </Typography>

                    <Stack spacing={1.2}>
                      {/* Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, borderRadius: '10px', bgcolor: 'rgba(108, 99, 255, 0.08)', border: '1px solid rgba(108, 99, 255, 0.15)' }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CalendarTodayIcon sx={{ fontSize: 15, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFE', fontSize: '0.82rem' }}>
                            {formatDate(event.start_date)}
                            {event.end_date && event.end_date !== '0000-00-00' && ` – ${formatDate(event.end_date)}`}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Landmark */}
                      {event.landmark_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, borderRadius: '10px', bgcolor: 'rgba(22, 244, 208, 0.06)', border: '1px solid rgba(22, 244, 208, 0.15)' }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#16F4D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <LandscapeIcon sx={{ fontSize: 15, color: '#0F0E17' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Landmark</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFE', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {event.landmark_name}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Organizer */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, borderRadius: '10px', bgcolor: 'rgba(255, 101, 132, 0.06)', border: '1px solid rgba(255, 101, 132, 0.15)' }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#FF6584', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <PersonIcon sx={{ fontSize: 15, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organizer</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFE', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.user_name}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      fullWidth variant="contained"
                      startIcon={<NavigationIcon />}
                      onClick={(e) => handleNavigate(event, e)}
                      disabled={!coords}
                      sx={{
                        borderRadius: '10px', py: 1.1, fontWeight: 700, fontSize: '0.85rem', flex: 1,
                        background: coords ? 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)' : 'rgba(255,255,255,0.05)',
                        boxShadow: coords ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                        color: coords ? 'white' : '#A7A9BE',
                        '&:hover': {
                          background: coords ? 'linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)' : undefined,
                          transform: coords ? 'translateY(-1px)' : 'none',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Navigate
                    </Button>

                    {owned && (
                      <>
                        <Tooltip title="Edit event">
                          <IconButton
                            size="small"
                            onClick={(e) => handleEditClick(event, e)}
                            sx={{
                              bgcolor: 'rgba(108, 99, 255, 0.15)', border: '1px solid rgba(108, 99, 255, 0.3)',
                              color: '#8B85FF', borderRadius: '10px', width: 36, height: 36,
                              '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.3)', color: '#FFFFFE' },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete event">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteClick(event, e)}
                            sx={{
                              bgcolor: 'rgba(255, 101, 132, 0.1)', border: '1px solid rgba(255, 101, 132, 0.3)',
                              color: '#FF6584', borderRadius: '10px', width: 36, height: 36,
                              '&:hover': { bgcolor: 'rgba(255, 101, 132, 0.25)', color: '#FFFFFE' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Edit Dialog */}
      <EditEventDialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        onEventUpdated={() => {
          setEditDialogOpen(false);
          setSelectedEvent(null);
          onEventUpdated(); // triggers fetchEvents in Dashboard
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0F0E17', borderRadius: '20px',
            border: '1px solid rgba(255, 101, 132, 0.3)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              bgcolor: 'rgba(255, 101, 132, 0.15)',
              border: '1px solid rgba(255, 101, 132, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <WarningAmberIcon sx={{ color: '#FF6584', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFE' }}>Delete Event</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          {deleteError && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)' }}>
              <Typography variant="body2" sx={{ color: '#ff6b6b' }}>{deleteError}</Typography>
            </Box>
          )}
          <Typography sx={{ color: '#A7A9BE', lineHeight: 1.7 }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ color: '#FFFFFE', fontWeight: 700 }}>"{selectedEvent?.event_name}"</Box>?
            {' '}This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)} disabled={deleting}
            sx={{ color: '#A7A9BE', borderRadius: '12px', px: 3, border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete} disabled={deleting} variant="contained"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{
              borderRadius: '12px', px: 3, fontWeight: 700,
              background: 'linear-gradient(135deg, #FF6584 0%, #E5476A 100%)',
              boxShadow: '0 6px 20px rgba(255, 101, 132, 0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #FF8FA3 0%, #FF6584 100%)' },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventList;
