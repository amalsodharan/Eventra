import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import geocodingService from '../services/geocodingService';

// Custom icon for selection
const selectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={selectIcon} />
  ) : null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || { lat: 12.992917, lng: 80.2218964 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await geocodingService.searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const newPosition = { lat: result.lat, lng: result.lon };
    setPosition(newPosition);
    setSelectedLocation(result.name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (position) {
      onLocationSelect({
        coordinates: `${position.lat},${position.lng}`,
        name: selectedLocation || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
      });
    }
  };

  return (
    <Box>
      {/* Search Section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching}
            startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            Search
          </Button>
        </Box>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
            <List dense>
              {searchResults.map((result, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSelectResult(result)}
                >
                  <ListItemText
                    primary={result.name}
                    secondary={result.type}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Map */}
      <Box sx={{ height: 400, mb: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </Box>

      {/* Selected Location Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Selected Location:
        </Typography>
        <Typography variant="body1">
          {selectedLocation || `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`}
        </Typography>
      </Box>

      {/* Confirm Button */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleConfirm}
        disabled={!position}
      >
        Confirm Location
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click on the map to select a location or search for a place
      </Typography>
    </Box>
  );
};

export default LocationPicker;
