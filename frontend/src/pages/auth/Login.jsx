import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  alpha,
  Tooltip,
  Fade,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Visibility, 
  VisibilityOff, 
  Restaurant, 
  DarkMode, 
  LightMode,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../../auth/authContext';
import { useThemeMode } from '../../theme/ThemeContext';

// Beautiful restaurant background image
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

const Login = () => {
  const { login } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const getFieldError = (field) => {
    if (!touched[field]) return '';
    if (!form[field]) return field === 'username' ? 'Vui lòng nhập tên đăng nhập' : 'Vui lòng nhập mật khẩu';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    
    if (!form.username || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError('Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: isDark 
              ? 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 100%)'
              : 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
            backdropFilter: 'blur(2px)',
          },
        }}
      />

      {/* Theme Toggle Button */}
      <Tooltip title={isDark ? 'Chế độ sáng' : 'Chế độ tối'} arrow>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
              transform: 'rotate(180deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>

      {/* Left side - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', color: 'white', maxWidth: 500 }}>
            <Box
              component={motion.div}
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              sx={{
                width: 140,
                height: 140,
                mx: 'auto',
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <Restaurant sx={{ fontSize: 70, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h1" 
              fontWeight={800} 
              sx={{ 
                mb: 2,
                fontSize: { md: '3rem', lg: '4rem' },
                textShadow: '2px 2px 20px rgba(0,0,0,0.5)',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              L'Ami RMS
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9, 
                mb: 4, 
                fontWeight: 300,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Restaurant Management System
            </Typography>
            
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.95, 
                  lineHeight: 1.8,
                  fontWeight: 400,
                  fontStyle: 'italic',
                }}
              >
                "Quản lý nhà hàng dễ dàng, nhanh chóng và chính xác."
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2, 
                  opacity: 0.7,
                }}
              >
                Hệ thống toàn diện cho đơn hàng, bàn, thực đơn, kho hàng, nhân sự và báo cáo doanh thu.
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Floating decorative elements */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            component={motion.div}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.3,
            }}
            sx={{
              position: 'absolute',
              width: 60 + i * 25,
              height: 60 + i * 25,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              top: `${15 + i * 12}%`,
              left: `${5 + i * 12}%`,
            }}
          />
        ))}
      </Box>

      {/* Right side - Login form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 520px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 5 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          component={motion.div}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: isDark 
              ? 'rgba(30, 30, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: isDark 
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo for mobile */}
          <Box 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              alignItems: 'center', 
              gap: 1.5, 
              mb: 4,
              justifyContent: 'center',
            }}
          >
            <Box
              component={motion.div}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.4)',
              }}
            >
              <Restaurant sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary">
              L'Ami RMS
            </Typography>
          </Box>

          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              mb: 1,
              background: isDark 
                ? 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)'
                : 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Đăng nhập
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Chào mừng bạn quay lại! Vui lòng đăng nhập để tiếp tục.
          </Typography>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    animation: 'shake 0.5s ease-in-out',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                    },
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <TextField
              name="username"
              label="Tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('username')}
              helperText={getFieldError('username')}
              fullWidth
              autoFocus
              placeholder="Nhập tên đăng nhập"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 20px rgba(46, 125, 50, 0.25)',
                  },
                },
              }}
            />
            
            <TextField
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('password')}
              helperText={getFieldError('password')}
              fullWidth
              placeholder="Nhập mật khẩu"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 20px rgba(46, 125, 50, 0.25)',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <motion.div
                        key={showPassword ? 'visible' : 'hidden'}
                        initial={{ rotateY: 90 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </motion.div>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Ghi nhớ đăng nhập</Typography>}
              />
              <Tooltip 
                title="Liên hệ quản trị viên để đặt lại mật khẩu" 
                arrow 
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 300 }}
              >
                <Link
                  href="#"
                  variant="body2"
                  underline="hover"
                  sx={{ 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: 'primary.dark',
                    },
                  }}
                >
                  Quên mật khẩu?
                  <Info sx={{ fontSize: 16, opacity: 0.7 }} />
                </Link>
              </Tooltip>
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={loading}
              loadingIndicator="Đang đăng nhập..."
              fullWidth
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  boxShadow: '0 6px 25px rgba(46, 125, 50, 0.5)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
                },
              }}
            >
              Đăng nhập
            </LoadingButton>
          </Stack>
        </Paper>

        <Typography 
          variant="body2" 
          sx={{ 
            mt: 4, 
            color: 'rgba(255,255,255,0.7)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          © 2024 L'Ami Restaurant Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
