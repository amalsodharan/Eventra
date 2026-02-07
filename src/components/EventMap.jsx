import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Chip, Paper, Stack, Divider } from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SportsIcon from '@mui/icons-material/Sports';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom sports event marker
const createSportsIcon = () => {
  return L.divIcon({
    className: 'custom-sports-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px;" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to fit map bounds to all markers
function MapBounds({ events }) {
  const map = useMap();

  useEffect(() => {
    if (events.length > 0) {
      const validEvents = events.filter(event => {
        const coords = parseLocationString(event.location);
        return coords !== null;
      });

      if (validEvents.length > 0) {
        const bounds = validEvents.map(event => {
          const coords = parseLocationString(event.location);
          return [coords.lat, coords.lng];
        });
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [events, map]);

  return null;
}

// Parse location string (format: "lat,lng" or "location_name")
const parseLocationString = (locationStr) => {
  if (!locationStr) return null;
  
  // Check if it's coordinates format "lat,lng"
  const coords = locationStr.split(',');
  if (coords.length === 2) {
    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  return null;
};

const EventMap = ({ events, onMarkerClick }) => {
  const [center, setCenter] = useState([12.992917, 80.2218964]); // Default: Chennai center
  const [zoom, setZoom] = useState(12);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return 'No end date';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <style>
        {`
          .custom-sports-marker {
            background: transparent;
            border: none;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            padding: 0 !important;
            background: #2a2a3e;
            overflow: visible !important;
          }
          .leaflet-popup-content {
            margin: 0 !important;
            width: 360px !important;
            max-height: 600px;
            overflow-y: auto;
          }
          .leaflet-popup-content p {
            margin: 0 !important;
          }
          .leaflet-popup-content::-webkit-scrollbar {
            width: 6px;
          }
          .leaflet-popup-content::-webkit-scrollbar-track {
            background: #1e1e2e;
          }
          .leaflet-popup-content::-webkit-scrollbar-thumb {
            background: #4285f4;
            border-radius: 3px;
          }
          .leaflet-popup-tip {
            background: #2a2a3e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .leaflet-popup-close-button {
            color: #9ca3af !important;
            font-size: 20px !important;
            padding: 4px 8px !important;
            top: 12px !important;
            right: 12px !important;
            width: 28px !important;
            height: 28px !important;
          }
          .leaflet-popup-close-button:hover {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
        `}
      </style>
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds events={events} />

        {events.map((event) => {
          const coords = parseLocationString(event.location);
          if (!coords) return null;

          return (
            <Marker
              key={event.id}
              position={[coords.lat, coords.lng]}
              icon={createSportsIcon()}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(event)
              }}
            >
              <Popup maxWidth={360} className="sports-event-popup">
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: '#2a2a3e',
                  borderRadius: 2
                }}>
                  {/* Header with Icon */}
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
                      }}
                    >
                      <SportsIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#ffffff',
                          mb: 0.75,
                          lineHeight: 1.3,
                          fontSize: '1.1rem'
                        }}
                      >
                        {event.event_name}
                      </Typography>
                      <Chip 
                        label={event.role.toUpperCase()} 
                        size="small" 
                        sx={{
                          bgcolor: event.role === 'admin' ? '#1a73e8' : '#34a853',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                          letterSpacing: '0.5px'
                        }}
                      />
                    </Box>
                  </Stack>
                  
                  {/* Description */}
                  {event.desc && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#9ca3af',
                        mb: 2,
                        lineHeight: 1.6,
                        fontSize: '0.875rem'
                      }}
                    >
                      {event.desc}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2, borderColor: '#3a3a4e' }} />
                  
                  {/* Event Details */}
                  <Stack spacing={1.75}>
                    {/* Start Date */}
                    <Stack direction="row" spacing={1.75} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(26, 115, 232, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#4285f4' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b7280', 
                            display: 'block', 
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            mb: 0.25,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Start Date
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#ffffff',
                            fontSize: '0.9rem'
                          }}
                        >
                          {formatDate(event.start_date)}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {/* End Date */}
                    {event.end_date && event.end_date !== '0000-00-00' && (
                      <Stack direction="row" spacing={1.75} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(234, 67, 53, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 18, color: '#ea4335' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b7280', 
                              display: 'block', 
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              mb: 0.25,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            End Date
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#ffffff',
                              fontSize: '0.9rem'
                            }}
                          >
                            {formatDate(event.end_date)}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                    
                    {/* Landmark */}
                    {event.landmark_name && (
                      <>
                        <Divider sx={{ my: 0.75, borderColor: '#3a3a4e' }} />
                        <Stack direction="row" spacing={1.75} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              bgcolor: 'rgba(66, 133, 244, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <LocationOnIcon sx={{ fontSize: 18, color: '#4285f4' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6b7280', 
                                display: 'block', 
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                mb: 0.25,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Landmark
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#ffffff',
                                fontSize: '0.9rem',
                                wordBreak: 'break-word',
                                lineHeight: 1.4
                              }}
                            >
                              {event.landmark_name}
                            </Typography>
                          </Box>
                        </Stack>
                      </>
                    )}
                    
                    <Divider sx={{ my: 0.75, borderColor: '#3a3a4e' }} />
                    
                    {/* Organizer */}
                    <Stack direction="row" spacing={1.75} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(52, 168, 83, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18, color: '#34a853' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b7280', 
                            display: 'block', 
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            mb: 0.25,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Organizer
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#ffffff',
                            fontSize: '0.9rem'
                          }}
                        >
                          {event.user_name}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {/* Contact */}
                    <Stack direction="row" spacing={1.75} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(251, 188, 4, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 18, color: '#fbbc04' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b7280', 
                            display: 'block', 
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            mb: 0.25,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Contact
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#4285f4',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all'
                          }}
                        >
                          {event.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default EventMap;