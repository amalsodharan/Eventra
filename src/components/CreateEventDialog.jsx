import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Typography,
  IconButton,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SportsIcon from '@mui/icons-material/Sports';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationPicker from './LocationPicker';
import eventApi from '../services/eventApi';

const steps = ['Event Details', 'Select Location', 'Review & Create'];

const CreateEventDialog = ({ open, onClose, onEventCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    role: 'user',
    event_name: '',
    desc: '',
    location: '',
    landmark_name: '',
    user_name: '',
    email: '',
    start_date: '',
    end_date: ''
  });

  const [locationData, setLocationData] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (location) => {
    setLocationData(location);
    setFormData({
      ...formData,
      location: location.coordinates,
      landmark_name: location.name || ''
    });
    setActiveStep(2);
  };

  const handleNext = () => {
    setError(null);
    
    if (activeStep === 0) {
      if (!formData.event_name || !formData.desc || !formData.user_name || 
          !formData.email || !formData.start_date) {
        setError('Please fill in all required fields');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    if (activeStep === 1 && !formData.location) {
      setError('Please select a location');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        end_date: formData.end_date || '0000-00-00'
      };
      
      const newEvent = await eventApi.createEvent(eventData);
      onEventCreated(newEvent);
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      role: 'user',
      event_name: '',
      desc: '',
      location: '',
      landmark_name: '',
      user_name: '',
      email: '',
      start_date: '',
      end_date: ''
    });
    setLocationData(null);
    setActiveStep(0);
    setError(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Event Type"
              >
                <MenuItem value="user">Public Event</MenuItem>
                <MenuItem value="admin">Official Event</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Event Name"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              placeholder="e.g., Annual Basketball Championship"
              variant="outlined"
            />

            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Event Description"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Describe your sports event..."
              variant="outlined"
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Organizer Information
            </Typography>

            <TextField
              fullWidth
              required
              label="Organizer Name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Your full name"
              variant="outlined"
            />

            <TextField
              fullWidth
              required
              type="email"
              label="Contact Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="organizer@example.com"
              variant="outlined"
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Event Schedule
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                type="date"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Stack>
          </Box>
        );

      case 1:
        return (
          <LocationPicker onLocationSelect={handleLocationSelect} />
        );

      case 2:
        return (
          <Box>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Event Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a73e8' }}>
                    {formData.role === 'admin' ? 'Official Event' : 'Public Event'}
                  </Typography>
                </Box>

                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Event Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    {formData.event_name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {formData.desc}
                  </Typography>
                </Box>

                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Organizer
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formData.user_name}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {formData.email}
                  </Typography>
                </Box>

                <Divider />
                
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formData.start_date}
                    </Typography>
                  </Box>
                  
                  {formData.end_date && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        End Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formData.end_date}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider />
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Location
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon color="error" fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {locationData?.name || formData.location}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
        color: 'white',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SportsIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Create Sports Event
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Stack>
          <IconButton 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleCloseDialog}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(135deg, #34a853 0%, #5bb974 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2d8e47 0%, #34a853 100%)',
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventDialog;
