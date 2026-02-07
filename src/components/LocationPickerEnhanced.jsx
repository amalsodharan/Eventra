import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  Fade,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import geocodingService from '../services/geocodingService';

// Custom icon for selection
const selectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });
  return null;
}

// Component to update map view when position changes
function MapUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, {
        duration: 1.5
      });
    }
  }, [position, map]);
  
  return null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || { lat: 12.992917, lng: 80.2218964 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);

  // Live search as user types
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await geocodingService.searchLocation(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    const newPosition = { lat: result.lat, lng: result.lon };
    setPosition(newPosition);
    setSelectedLocation(result.name);
    setSearchQuery(result.name);
    setShowResults(false);
    setSearchResults([]);
    
    setTimeout(() => {
      onLocationSelect({
        coordinates: `${newPosition.lat},${newPosition.lng}`,
        name: result.name
      });
    }, 100);
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setSelectedLocation(null);
    setSearchQuery('');
  };

  return (
    <Box>
      {/* Search Section */}
      <Box sx={{ mb: 3, position: 'relative' }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Type to search for a location..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#A7A9BE' }} />
              </InputAdornment>
            ),
            endAdornment: searching && (
              <InputAdornment position="end">
                <CircularProgress size={20} sx={{ color: '#6C63FF' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Live Search Results */}
        <Fade in={showResults && searchResults.length > 0}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: 300,
              overflow: 'auto',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
            }}
          >
            <List dense disablePadding>
              {searchResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => handleSelectResult(result)}
                    sx={{
                      py: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(108, 99, 255, 0.1)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationOnIcon sx={{ color: '#FF6584', fontSize: 24 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, color: '#FFFFFE' }}>
                          {result.name.split(',')[0]}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#A7A9BE' }}>
                          {result.name}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Fade>
      </Box>

      {/* Map */}
      <Box 
        sx={{ 
          height: 450, 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(108, 99, 255, 0.3)',
        }}
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler setPosition={handlePositionChange} />
          {position && (
            <Marker position={[position.lat, position.lng]} icon={selectIcon} />
          )}
          <MapUpdater position={position} />
        </MapContainer>
      </Box>

      {/* Selected Location Display */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          bgcolor: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(108, 99, 255, 0.3)',
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <MyLocationIcon sx={{ color: '#16F4D0', mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#A7A9BE', 
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Selected Location
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#FFFFFE',
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {selectedLocation || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography 
        variant="caption" 
        sx={{ 
          color: '#A7A9BE',
          display: 'block',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        Search for a location or click on the map to pin your event
      </Typography>
    </Box>
  );
};

export default LocationPicker;