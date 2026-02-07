import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavigationIcon from '@mui/icons-material/Navigation';
import LandscapeIcon from '@mui/icons-material/Landscape';
import { format } from 'date-fns';

const EventList = ({ events, onEventClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return 'TBA';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const parseLocation = (locationStr) => {
    if (!locationStr) return null;
    
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

  const handleNavigate = (event, e) => {
    e.stopPropagation();
    const coords = parseLocation(event.location);
    if (coords) {
      // Open Google Maps with directions
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
        '_blank'
      );
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#1a73e8' : '#34a853';
  };

  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[index % gradients.length];
  };

  if (events.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        p: 4 
      }}>
        <Box
          sx={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 70, color: 'white' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
          No Events Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
          Be the first to create an exciting sports event and bring the community together!
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Play. Host. Discover.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {events.map((event, index) => {
          const coords = parseLocation(event.location);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: getGradient(index),
                  },
                  borderRadius: 3,
                }}
                onClick={() => onEventClick && onEventClick(event)}
              >
                {/* Enhanced Header with Gradient */}
                <Box
                  sx={{
                    background: getGradient(index),
                    height: 140,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                    },
                  }}
                >
                  {/* Decorative circles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      right: -30,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      left: -20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                  />
                  
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      zIndex: 1,
                    }}
                  >
                    <SportsIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Chip
                    label={event.role === 'admin' ? 'OFFICIAL' : 'PUBLIC'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: getRoleColor(event.role),
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: `2px solid ${getRoleColor(event.role)}`,
                      zIndex: 1,
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Event Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: '#1a1a1a',
                      mb: 1.5,
                      lineHeight: 1.3,
                      minHeight: 56,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '1.1rem',
                    }}
                  >
                    {event.event_name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#5f6368',
                      mb: 2.5,
                      lineHeight: 1.6,
                      minHeight: 66,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.desc}
                  </Typography>

                  {/* Event Details */}
                  <Stack spacing={1.5}>
                    {/* Date */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: '#1a73e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 600, fontSize: '0.7rem' }}>
                          EVENT DATE
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.85rem' }}>
                          {formatDate(event.start_date)}
                          {event.end_date && event.end_date !== '0000-00-00' && 
                            ` - ${formatDate(event.end_date)}`}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Landmark (if exists) */}
                    {event.landmark_name && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#f0f7ff',
                          border: '1px solid #d0e7ff',
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: '#4285f4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LandscapeIcon sx={{ fontSize: 18, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 600, fontSize: '0.7rem' }}>
                            LANDMARK
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: '#1a1a1a',
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textWrap: 'auto'
                            }}
                          >
                            {event.landmark_name}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Organizer */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#f0fff4',
                        border: '1px solid #c6f6d5',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: '#34a853',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 600, fontSize: '0.7rem' }}>
                          ORGANIZER
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1a1a1a',
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {event.user_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<NavigationIcon />}
                    onClick={(e) => handleNavigate(event, e)}
                    disabled={!coords}
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      background: coords 
                        ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)'
                        : '#e0e0e0',
                      boxShadow: coords ? '0 4px 12px rgba(26, 115, 232, 0.3)' : 'none',
                      '&:hover': {
                        background: coords 
                          ? 'linear-gradient(135deg, #1557b0 0%, #1a73e8 100%)'
                          : '#e0e0e0',
                        boxShadow: coords ? '0 6px 20px rgba(26, 115, 232, 0.4)' : 'none',
                        transform: coords ? 'translateY(-2px)' : 'none',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Navigate to Event
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EventList;
