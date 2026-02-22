import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Box, Typography, Chip, Stack, Divider,
  Button, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SportsIcon from '@mui/icons-material/Sports';
import NavigationIcon from '@mui/icons-material/Navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import 'leaflet/dist/leaflet.css';
import authService from '../services/authService';
import eventApi from '../services/eventApi';
import EditEventDialog from './EditEventDialog';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createSportsIcon = (isOwned) =>
  L.divIcon({
    className: 'custom-sports-marker',
    html: `
      <div style="
        background: ${isOwned
          ? 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)'
          : 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)'};
        width: 40px; height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: ${isOwned
          ? '0 4px 12px rgba(108,99,255,0.6)'
          : '0 4px 12px rgba(26,115,232,0.4)'};
        display: flex; align-items: center; justify-content: center;
      ">
        <svg style="transform:rotate(45deg);width:20px;height:20px;" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>`,
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
  });

function MapBounds({ events }) {
  const map = useMap();
  useEffect(() => {
    if (events.length > 0) {
      const valid = events.filter(e => parseCoords(e.location));
      if (valid.length > 0) {
        map.fitBounds(valid.map(e => { const c = parseCoords(e.location); return [c.lat, c.lng]; }), { padding: [50, 50] });
      }
    }
  }, [events, map]);
  return null;
}

const parseCoords = (locationStr) => {
  if (!locationStr) return null;
  const parts = locationStr.split(',');
  if (parts.length === 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
};

const EventMap = ({ events, onMarkerClick, onEventUpdated, onEventDeleted }) => {
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

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <style>{`
        .custom-sports-marker { background: transparent; border: none; }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.5) !important;
          padding: 0 !important;
          background: #0F0E17 !important;
          border: 1px solid rgba(108, 99, 255, 0.3) !important;
          overflow: hidden !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: 340px !important; }
        .leaflet-popup-content p { margin: 0 !important; }
        .leaflet-popup-tip { background: #0F0E17 !important; }
        .leaflet-popup-close-button {
          color: #A7A9BE !important; font-size: 20px !important;
          padding: 8px !important; top: 8px !important; right: 8px !important; z-index: 10;
        }
        .leaflet-popup-close-button:hover { color: #FFFFFE !important; background: rgba(255,255,255,0.08); border-radius: 6px; }
        .leaflet-popup-content::-webkit-scrollbar { width: 4px; }
        .leaflet-popup-content::-webkit-scrollbar-track { background: #0F0E17; }
        .leaflet-popup-content::-webkit-scrollbar-thumb { background: #6C63FF; border-radius: 2px; }
      `}</style>

      <MapContainer center={[12.992917, 80.2218964]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds events={events} />

        {events.map((event) => {
          const coords = parseCoords(event.location);
          if (!coords) return null;
          const owned = isOwner(event);

          return (
            <Marker
              key={event.id}
              position={[coords.lat, coords.lng]}
              icon={createSportsIcon(owned)}
              eventHandlers={{ click: () => onMarkerClick && onMarkerClick(event) }}
            >
              <Popup maxWidth={340}>
                <Box sx={{ bgcolor: '#0F0E17', borderRadius: '16px', overflow: 'hidden' }}>
                  {/* Gradient Header */}
                  <Box sx={{
                    background: owned
                      ? 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)'
                      : 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                    p: 2.5, pb: 2,
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{
                        width: 48, height: 48, borderRadius: '12px',
                        bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}>
                        <SportsIcon sx={{ color: 'white', fontSize: 26 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }} flexWrap="wrap" gap={0.5}>
                          <Chip
                            label={event.role === 'admin' ? 'OFFICIAL' : 'PUBLIC'} size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                          />
                          {owned && (
                            <Chip label="YOUR EVENT" size="small"
                              sx={{ bgcolor: 'rgba(255,255,255,0.35)', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.3, wordBreak: 'break-word' }}>
                          {event.event_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Body */}
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="body2" sx={{ color: '#A7A9BE', mb: 2, lineHeight: 1.6 }}>
                      {event.desc}
                    </Typography>

                    <Stack spacing={1.2}>
                      {/* Date */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: '#8B85FF' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFE', fontSize: '0.85rem' }}>
                            {formatDate(event.start_date)}
                            {event.end_date && event.end_date !== '0000-00-00' && ` – ${formatDate(event.end_date)}`}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Landmark */}
                      {event.landmark_name && (
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(22,244,208,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: '#16F4D0' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Landmark</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFE', fontSize: '0.85rem', wordBreak: 'break-word', lineHeight: 1.4 }}>
                              {event.landmark_name}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                      {/* Organizer */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(255,101,132,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#FF6584' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organizer</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFE', fontSize: '0.85rem' }}>{event.user_name}</Typography>
                        </Box>
                      </Stack>

                      {/* Email */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(251,188,4,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#fbbc04' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#6C63FF', fontSize: '0.82rem', wordBreak: 'break-all' }}>{event.email}</Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        size="small" variant="contained"
                        startIcon={<NavigationIcon sx={{ fontSize: 14 }} />}
                        onClick={() => {
                          const c = parseCoords(event.location);
                          if (c) window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank');
                        }}
                        sx={{
                          flex: 1, borderRadius: '10px', py: 0.9, fontWeight: 700, fontSize: '0.78rem',
                          background: 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)',
                          boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
                          '&:hover': { background: 'linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)' },
                        }}
                      >
                        Navigate
                      </Button>

                      {owned && (
                        <>
                          <Tooltip title="Edit event">
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedEvent(event); setEditDialogOpen(true); }}
                              sx={{
                                bgcolor: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                                color: '#8B85FF', borderRadius: '10px', width: 34, height: 34,
                                '&:hover': { bgcolor: 'rgba(108,99,255,0.3)' },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete event">
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedEvent(event); setDeleteError(null); setDeleteDialogOpen(true); }}
                              sx={{
                                bgcolor: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
                                color: '#FF6584', borderRadius: '10px', width: 34, height: 34,
                                '&:hover': { bgcolor: 'rgba(255,101,132,0.25)' },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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

      {/* Delete Confirmation */}
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
    </Box>
  );
};

export default EventMap;
