import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Fade,
  Slide,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SportsIcon from '@mui/icons-material/Sports';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import authService from '../services/authService';

const FloatingOrb = ({ size, top, left, right, bottom, color, delay }) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(80px)',
      opacity: 0.35,
      top,
      left,
      right,
      bottom,
      animation: `orbFloat ${3 + delay}s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }}
  />
);

const AuthPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.login(loginData.email, loginData.password);
      setSuccess('Welcome back! Redirecting...');
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { email, password, first_name, last_name, phone } = registerData;
    if (!email || !password || !first_name || !last_name || !phone) {
      setError('Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.register({
        email,
        password,
        first_name,
        last_name,
        phone: Number(phone),
      });
      setSuccess('Account created! Welcome to Eventra!');
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(108, 99, 255, 0.25)',
      transition: 'all 0.3s ease',
      '& fieldset': { border: 'none' },
      '&:hover': {
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
        border: '1px solid rgba(108, 99, 255, 0.5)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        border: '1px solid #6C63FF',
        boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.15)',
      },
    },
    '& .MuiInputLabel-root': { color: '#A7A9BE' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8B85FF' },
    '& input': { color: '#FFFFFE' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1A1A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '@keyframes orbFloat': {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '100%': { transform: 'translateY(-30px) scale(1.05)' },
        },
        '@keyframes shimmerLine': {
          '0%': { opacity: 0, transform: 'scaleX(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'scaleX(1)' },
        },
        '@keyframes fadeSlideUp': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes pulseGlow': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(108, 99, 255, 0.3), 0 0 80px rgba(255, 101, 132, 0.15)' },
          '50%': { boxShadow: '0 0 60px rgba(108, 99, 255, 0.5), 0 0 120px rgba(255, 101, 132, 0.25)' },
        },
      }}
    >
      {/* Ambient background orbs */}
      <FloatingOrb size={500} top="-100px" left="-150px" color="radial-gradient(circle, #6C63FF, transparent)" delay={0} />
      <FloatingOrb size={400} bottom="-100px" right="-100px" color="radial-gradient(circle, #FF6584, transparent)" delay={1.5} />
      <FloatingOrb size={300} top="40%" left="60%" color="radial-gradient(circle, #16F4D0, transparent)" delay={3} />

      {/* Grid texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(108, 99, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 99, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Split layout */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: '1000px',
          minHeight: '600px',
          mx: 3,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
          animation: mounted ? 'fadeSlideUp 0.6s ease forwards' : 'none',
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* Left panel — brand */}
        <Box
          sx={{
            flex: '0 0 42%',
            background: 'linear-gradient(145deg, #6C63FF 0%, #4A3FA8 40%, #2D1B69 80%, #0F0E17 100%)',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 5,
            position: 'relative',
            overflow: 'hidden',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
        >
          {/* Decorative circles */}
          <Box sx={{
            position: 'absolute', width: 350, height: 350, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
          <Box sx={{
            position: 'absolute', width: 260, height: 260, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />

          {/* Icon */}
          <Box
            sx={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 3, zIndex: 1,
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            }}
          >
            <SportsIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>

          <Typography
            sx={{
              fontFamily: '"Public Sans", sans-serif',
              fontSize: '3rem', fontWeight: 800,
              color: 'white', letterSpacing: '2px',
              zIndex: 1, mb: 1,
            }}
          >
            EVENTRA
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '4px', fontSize: '0.75rem',
              textTransform: 'uppercase', fontWeight: 500,
              zIndex: 1, mb: 5,
            }}
          >
            Play. Host. Discover.
          </Typography>

          <Divider sx={{ width: '60%', borderColor: 'rgba(255,255,255,0.2)', mb: 4 }} />

          <Box sx={{ zIndex: 1, textAlign: 'center' }}>
            {[
              { icon: '🗺️', text: 'Discover nearby sports events' },
              { icon: '🏆', text: 'Host and organize events' },
              { icon: '👥', text: 'Connect with athletes' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right panel — form */}
        <Box
          sx={{
            flex: 1,
            bgcolor: '#0F0E17',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, sm: 5 },
            overflowY: 'auto',
          }}
        >
          {/* Tab switcher */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              p: '4px',
              mb: 4,
              border: '1px solid rgba(108, 99, 255, 0.2)',
            }}
          >
            {['login', 'register'].map((tab) => (
              <Box
                key={tab}
                onClick={() => switchMode(tab)}
                sx={{
                  flex: 1, py: 1.5, borderRadius: '10px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: mode === tab
                    ? 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)'
                    : 'transparent',
                  boxShadow: mode === tab ? '0 4px 15px rgba(108, 99, 255, 0.4)' : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700, fontSize: '0.9rem',
                    color: mode === tab ? 'white' : '#A7A9BE',
                    textTransform: 'capitalize', letterSpacing: '0.5px',
                  }}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Heading */}
          <Fade in key={mode}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800, color: '#FFFFFE',
                  mb: 0.5, letterSpacing: '-0.5px',
                  fontFamily: '"Public Sans", sans-serif',
                }}
              >
                {mode === 'login' ? 'Welcome back' : 'Join Eventra'}
              </Typography>
              <Typography sx={{ color: '#A7A9BE', mb: 3.5, fontSize: '0.95rem' }}>
                {mode === 'login'
                  ? 'Sign in to access your events and dashboard'
                  : 'Create your account and start discovering sports events'}
              </Typography>

              {/* Alerts */}
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)', color: '#ff6b6b' }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  severity="success"
                  sx={{ mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(22, 244, 208, 0.1)', border: '1px solid rgba(22, 244, 208, 0.3)', color: '#16F4D0' }}
                >
                  {success}
                </Alert>
              )}

              {/* Login Form */}
              {mode === 'login' && (
                <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth label="Email Address" name="email" type="email"
                    value={loginData.email} onChange={handleLoginChange}
                    placeholder="you@example.com" sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth label="Password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password} onChange={handleLoginChange}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#A7A9BE' }}>
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit" fullWidth variant="contained"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      py: 1.8, borderRadius: '14px', fontWeight: 700,
                      fontSize: '1rem', letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)',
                      boxShadow: '0 8px 24px rgba(108, 99, 255, 0.45)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)',
                        boxShadow: '0 12px 32px rgba(108, 99, 255, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Box>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth label="First Name" name="first_name"
                      value={registerData.first_name} onChange={handleRegisterChange}
                      sx={inputSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth label="Last Name" name="last_name"
                      value={registerData.last_name} onChange={handleRegisterChange}
                      sx={inputSx}
                    />
                  </Box>
                  <TextField
                    fullWidth label="Email Address" name="email" type="email"
                    value={registerData.email} onChange={handleRegisterChange}
                    placeholder="you@example.com" sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth label="Phone Number" name="phone" type="tel"
                    value={registerData.phone} onChange={handleRegisterChange}
                    placeholder="10-digit number" sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth label="Password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password} onChange={handleRegisterChange}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: '#A7A9BE' }}>
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit" fullWidth variant="contained"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      py: 1.8, borderRadius: '14px', fontWeight: 700,
                      fontSize: '1rem', letterSpacing: '0.5px', mt: 0.5,
                      background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                      boxShadow: '0 8px 24px rgba(108, 99, 255, 0.45)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8B85FF 0%, #FF8FA3 100%)',
                        boxShadow: '0 12px 32px rgba(108, 99, 255, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              )}

              <Typography
                sx={{
                  mt: 3, textAlign: 'center', color: '#A7A9BE',
                  fontSize: '0.85rem',
                }}
              >
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <Box
                  component="span"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  sx={{
                    color: '#8B85FF', fontWeight: 700, cursor: 'pointer',
                    '&:hover': { color: '#6C63FF', textDecoration: 'underline' },
                  }}
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </Box>
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthPage;
