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
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 0;
          }
          .leaflet-popup-content {
            margin: 0;
            width: 320px !important;
          }
          .leaflet-popup-tip {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
              <Popup maxWidth={320} className="sports-event-popup">
                <Box sx={{ p: 2 }}>
                  {/* Header with Icon */}
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SportsIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#1a1a1a',
                          mb: 0.5,
                          lineHeight: 1.2
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
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                  </Stack>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#5f6368',
                      mb: 2,
                      lineHeight: 1.6
                    }}
                  >
                    {event.desc}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Event Details */}
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CalendarTodayIcon sx={{ fontSize: 18, color: '#1a73e8' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', fontSize: '0.7rem' }}>
                          Start Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {formatDate(event.start_date)}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {event.end_date && event.end_date !== '0000-00-00' && (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#ea4335' }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', fontSize: '0.7rem' }}>
                            End Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            {formatDate(event.end_date)}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {event.landmark_name && (
                      <>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <LocationOnIcon sx={{ fontSize: 18, color: '#4285f4' }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', fontSize: '0.7rem' }}>
                              Landmark
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                              {event.landmark_name}
                            </Typography>
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 1 }} />
                      </>
                    )}
                    
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PersonIcon sx={{ fontSize: 18, color: '#34a853' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', fontSize: '0.7rem' }}>
                          Organizer
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {event.user_name}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <EmailIcon sx={{ fontSize: 18, color: '#fbbc04' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', fontSize: '0.7rem' }}>
                          Contact
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a73e8' }}>
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
