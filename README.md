# Event Organizer App - Frontend

A React-based event management application with interactive map integration using OpenStreetMap and Leaflet.

## Features

- 📅 Create and manage events with detailed information
- 🗺️ Interactive map view with event markers
- 📍 Location picker with search functionality using OpenStreetMap
- 📋 List view for browsing all events
- 🎨 Material-UI components for a clean, modern interface
- 🔄 Real-time event creation and display
- 📱 Responsive design

## Tech Stack

- **React 18** with Vite
- **Material-UI (MUI)** for UI components
- **React Router** for routing
- **Leaflet + React-Leaflet** for interactive maps
- **OpenStreetMap** for map tiles and geocoding
- **Zustand** for state management
- **Axios** for API calls
- **date-fns** for date formatting

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `https://apieventra.vercel.app`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── EventMap.jsx           # Map view component
│   ├── EventList.jsx          # List view component
│   ├── LocationPicker.jsx     # Location selection component
│   └── CreateEventDialog.jsx  # Event creation dialog
├── pages/
│   └── Dashboard.jsx          # Main dashboard page
├── services/
│   ├── eventApi.js           # API service for events
│   └── geocodingService.js   # Geocoding service for OpenStreetMap
├── store/
│   └── eventStore.js         # Zustand state management
├── App.jsx                   # Main app component
└── main.jsx                  # Entry point
```

## API Integration

The app connects to your backend API at `https://apieventra.vercel.app/api/events`

### Expected API Endpoints

**GET /api/events**
- Returns array of all events

**POST /api/events**
- Creates a new event
- Request body:
```json
{
  "role": "user|admin",
  "event_name": "string",
  "desc": "string",
  "location": "lat,lng",
  "user_name": "string",
  "email": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD" (optional)
}
```

## Usage

### Creating an Event

1. Click the blue **"+"** floating action button
2. Fill in event details:
   - Role (user/admin)
   - Event name
   - Description
   - Your name
   - Email
   - Start date
   - End date (optional)
3. Click **Next** to select location
4. Search for a location or click on the map
5. Click **Confirm Location**
6. Review details and click **Create Event**

### Viewing Events

- **Map View**: See all events as markers on an interactive map
  - Click markers to see event details in a popup
- **List View**: Browse events in a detailed list format
  - Click events for more information

### Toggle Views

Use the toggle buttons in the top-right corner to switch between Map and List views.

## Location Format

Events store locations as coordinates in the format: `"latitude,longitude"`

Example: `"28.6139,77.2090"` (New Delhi)

## Features in Detail

### Location Picker
- Search for places using OpenStreetMap Nominatim API
- Click anywhere on the map to select a location
- Real-time coordinate display
- Location name resolution

### Event Map
- OpenStreetMap base layer
- Custom red markers for events
- Interactive popups with full event details
- Auto-zoom to fit all event markers
- Click markers to view event information

### Event List
- Organized display of all events
- Event cards with avatars and icons
- Color-coded role badges
- Date formatting with date-fns
- Click to view details

## Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Environment Configuration

The app uses Vite's proxy configuration to forward API requests:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'https://apieventra.vercel.app',
    changeOrigin: true,
  }
}
```

To change the backend URL, update `vite.config.js`.

## Troubleshooting

### Map not displaying
- Ensure Leaflet CSS is loaded in `index.html`
- Check browser console for errors
- Verify internet connection for OpenStreetMap tiles

### API connection issues
- Ensure backend is running on `https://apieventra.vercel.app`
- Check CORS configuration on backend
- Verify API endpoints match expected format

### Location search not working
- OpenStreetMap Nominatim has rate limits
- Ensure you have internet connection
- Check browser console for API errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
