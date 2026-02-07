import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const LoadingAnimation = ({ message = 'Loading Events...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        position: 'relative',
        background: 'radial-gradient(circle at center, rgba(108, 99, 255, 0.05) 0%, transparent 70%)',
      }}
    >
      {/* Rotating rings */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: '3px solid rgba(108, 99, 255, 0.2)',
          animation: `${rotate} 8s linear infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '3px solid rgba(255, 101, 132, 0.2)',
          animation: `${rotate} 6s linear infinite reverse`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '3px solid rgba(22, 244, 208, 0.2)',
          animation: `${rotate} 4s linear infinite`,
        }}
      />

      {/* Main Icon Container */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(108, 99, 255, 0.4), 0 0 40px rgba(255, 101, 132, 0.3)',
          animation: `${float} 3s ease-in-out infinite`,
          position: 'relative',
          zIndex: 1,
          mb: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -5,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584, #16F4D0)',
            opacity: 0.5,
            filter: 'blur(20px)',
            animation: `${pulse} 2s ease-in-out infinite`,
          },
        }}
      >
        <SportsIcon sx={{ fontSize: 60, color: 'white', zIndex: 1 }} />
      </Box>

      {/* Loading Text */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#FFFFFE',
          mb: 3,
          letterSpacing: '1px',
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>

      {/* Animated Loading Dots */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              animation: `${pulse} 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>

      {/* Loading Bar */}
      <Box
        sx={{
          width: 280,
          height: 6,
          bgcolor: 'rgba(26, 26, 46, 0.8)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(108, 99, 255, 0.3)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '200%',
            background: 'linear-gradient(90deg, transparent, #6C63FF, #FF6584, transparent)',
            backgroundSize: '50% 100%',
            animation: `${shimmer} 2s infinite`,
          }}
        />
      </Box>

      {/* Subtitle */}
      <Typography
        variant="body2"
        sx={{
          mt: 3,
          color: '#A7A9BE',
          fontStyle: 'italic',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
        }}
      >
        Play. Host. Discover.
      </Typography>
    </Box>
  );
};

export default LoadingAnimation;