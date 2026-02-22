import React, { useState, useEffect } from 'react';
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
  Typography,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationPicker from './LocationPickerEnhanced';
import eventApi from '../services/eventApi';

const steps = ['Event Details', 'Update Location', 'Review & Save'];

const EditEventDialog = ({ open, onClose, event, onEventUpdated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    role: 'user',
    event_name: '',
    desc: '',
    landmark_name: '',
    user_name: '',
    email: '',
    start_date: '',
    end_date: '',
  });

  const [locationData, setLocationData] = useState(null);

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        role: event.role || 'user',
        event_name: event.event_name || '',
        desc: event.desc || '',
        landmark_name: event.landmark_name || '',
        user_name: event.user_name || '',
        email: event.email || '',
        start_date: event.start_date || '',
        end_date: event.end_date === '0000-00-00' ? '' : (event.end_date || ''),
      });
      // Pre-populate existing location
      if (event.location) {
        setLocationData({
          coordinates: event.location,
          name: event.landmark_name || event.location,
        });
      }
      setActiveStep(0);
      setError(null);
    }
  }, [event]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLocationSelect = (location) => {
    setLocationData(location);
    setFormData((prev) => ({
      ...prev,
      location: location.coordinates,
      landmark_name: location.name || '',
    }));
    setActiveStep(2);
  };

  const handleNext = () => {
    setError(null);
    if (activeStep === 0) {
      if (!formData.event_name || !formData.desc || !formData.user_name || !formData.email || !formData.start_date) {
        setError('Please fill in all required fields');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    if (activeStep === 1 && !locationData) {
      setError('Please select a location');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        end_date: formData.end_date || '0000-00-00',
        location: locationData?.coordinates || event.location,
        landmark_name: locationData?.name || formData.landmark_name,
      };
      await eventApi.updateEvent(event.id, payload);
      onEventUpdated(); // triggers fetchEvents in Dashboard
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setActiveStep(0);
    setError(null);
    onClose();
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(108, 99, 255, 0.2)',
      transition: 'all 0.3s ease',
      '& fieldset': { border: 'none' },
      '&:hover': {
        border: '1px solid rgba(108, 99, 255, 0.45)',
        backgroundColor: 'rgba(108, 99, 255, 0.06)',
      },
      '&.Mui-focused': {
        border: '1px solid #6C63FF',
        boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.12)',
      },
    },
    '& .MuiInputLabel-root': { color: '#A7A9BE' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8B85FF' },
    '& input, & textarea': { color: '#FFFFFE' },
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#A7A9BE' }}>Event Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Event Type"
                sx={{
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(108, 99, 255, 0.2)',
                  color: '#FFFFFE',
                  '& fieldset': { border: 'none' },
                  '& .MuiSvgIcon-root': { color: '#A7A9BE' },
                }}
              >
                <MenuItem value="user">Public Event</MenuItem>
                <MenuItem value="admin">Official Event</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth required
              label="Event Name"
              name="event_name"
              value={formData.event_name}
              onChange={handleChange}
              sx={inputSx}
            />

            <TextField
              fullWidth required multiline rows={3}
              label="Event Description"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              sx={inputSx}
            />

            <Divider sx={{ borderColor: 'rgba(108, 99, 255, 0.15)' }} />

            <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Organizer Info
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth required
                label="Organizer Name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                sx={inputSx}
              />
              <TextField
                fullWidth required
                label="Contact Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={inputSx}
              />
            </Stack>

            <Divider sx={{ borderColor: 'rgba(108, 99, 255, 0.15)' }} />

            <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Schedule
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth required
                type="date"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </Stack>
          </Box>
        );

      case 1:
        return (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialPosition={
              locationData?.coordinates
                ? (() => {
                    const parts = locationData.coordinates.split(',');
                    return parts.length === 2
                      ? { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) }
                      : undefined;
                  })()
                : undefined
            }
          />
        );

      case 2:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'rgba(108, 99, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(108, 99, 255, 0.2)',
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Event Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#8B85FF', mt: 0.25 }}>
                  {formData.role === 'admin' ? 'Official Event' : 'Public Event'}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(108,99,255,0.15)' }} />

              <Box>
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Event Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFE', mt: 0.25 }}>
                  {formData.event_name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: '#A7A9BE', mt: 0.25, lineHeight: 1.6 }}>
                  {formData.desc}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(108,99,255,0.15)' }} />

              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Organizer
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFE', mt: 0.25 }}>
                    {formData.user_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8B85FF' }}>{formData.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Dates
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFE', mt: 0.25 }}>
                    {formData.start_date}
                    {formData.end_date && ` → ${formData.end_date}`}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ borderColor: 'rgba(108,99,255,0.15)' }} />

              <Box>
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Location
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                  <LocationOnIcon sx={{ color: '#FF6584', fontSize: 18 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFE' }}>
                    {locationData?.name || event?.location || 'No location set'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
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
          bgcolor: '#0F0E17',
          border: '1px solid rgba(108, 99, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, px: 3, pt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(108, 99, 255, 0.4)',
              }}
            >
              <EditIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFE', lineHeight: 1.2 }}>
                Edit Event
              </Typography>
              <Typography variant="caption" sx={{ color: '#A7A9BE' }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: '#A7A9BE', '&:hover': { color: '#FFFFFE', bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 3,
            '& .MuiStepLabel-label': { color: '#A7A9BE' },
            '& .MuiStepLabel-label.Mui-active': { color: '#FFFFFE', fontWeight: 700 },
            '& .MuiStepLabel-label.Mui-completed': { color: '#8B85FF' },
            '& .MuiStepIcon-root': { color: 'rgba(108,99,255,0.3)' },
            '& .MuiStepIcon-root.Mui-active': { color: '#6C63FF' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#6C63FF' },
            '& .MuiStepConnector-line': { borderColor: 'rgba(108,99,255,0.2)' },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mb: 2.5, borderRadius: '12px',
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#ff6b6b',
            }}
          >
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleCloseDialog}
          sx={{
            color: '#A7A9BE', borderRadius: '12px', px: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#FFFFFE' },
          }}
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            sx={{
              color: '#A7A9BE', borderRadius: '12px', px: 3,
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#FFFFFE' },
            }}
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
              borderRadius: '12px', px: 4, fontWeight: 700,
              background: 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)',
              boxShadow: '0 6px 20px rgba(108, 99, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              borderRadius: '12px', px: 4, fontWeight: 700,
              background: 'linear-gradient(135deg, #16F4D0 0%, #0DD1B0 100%)',
              color: '#0F0E17',
              boxShadow: '0 6px 20px rgba(22, 244, 208, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4DF6DC 0%, #16F4D0 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;
