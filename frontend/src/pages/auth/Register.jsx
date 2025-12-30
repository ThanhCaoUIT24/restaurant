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
  Link,
  Alert,
  Tooltip,
  Fade,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Visibility, 
  VisibilityOff, 
  Restaurant, 
  DarkMode, 
  LightMode,
  Person,
  Phone,
  Lock,
  AccountCircle,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { useThemeMode } from '../../theme/ThemeContext';
import { register as registerApi } from '../../api/auth.api';

// Beautiful restaurant background image
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

const Register = () => {
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    hoTen: '', 
    soDienThoai: '' 
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const getFieldError = (field) => {
    if (!touched[field]) return '';
    
    switch (field) {
      case 'hoTen':
        if (!form.hoTen) return 'Vui lòng nhập họ tên';
        if (form.hoTen.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
        return '';
      case 'username':
        if (!form.username) return 'Vui lòng nhập tên đăng nhập';
        if (form.username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
        if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
        return '';
      case 'password':
        if (!form.password) return 'Vui lòng nhập mật khẩu';
        if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      case 'confirmPassword':
        if (!form.confirmPassword) return 'Vui lòng xác nhận mật khẩu';
        if (form.confirmPassword !== form.password) return 'Mật khẩu xác nhận không khớp';
        return '';
      case 'soDienThoai':
        if (form.soDienThoai && !/^[0-9]{10,11}$/.test(form.soDienThoai)) {
          return 'Số điện thoại phải có 10-11 chữ số';
        }
        return '';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    return (
      form.hoTen.length >= 2 &&
      form.username.length >= 3 &&
      form.password.length >= 6 &&
      form.confirmPassword === form.password &&
      (form.soDienThoai === '' || /^[0-9]{10,11}$/.test(form.soDienThoai))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ 
      hoTen: true, 
      username: true, 
      password: true, 
      confirmPassword: true,
      soDienThoai: true 
    });
    
    if (!isFormValid()) {
      setError('Vui lòng kiểm tra lại thông tin đăng ký.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await registerApi({
        username: form.username,
        password: form.password,
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai || undefined,
      });
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (err.response) {
        // Server responded with error
        message = err.response.data?.message 
          || err.response.data?.details?.[0]?.message 
          || message;
      } else if (err.request) {
        // Request was made but no response
        message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
      } else {
        // Something else went wrong
        message = err.message || message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = mode === 'dark';

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper
          component={motion.div}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: isDark 
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          </motion.div>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Đăng ký thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Đang chuyển hướng đến trang đăng nhập...
          </Typography>
        </Paper>
      </Box>
    );
  }

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

      {/* Back to Login Button */}
      <Tooltip title="Quay lại đăng nhập" arrow>
        <IconButton
          component={RouterLink}
          to="/login"
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>

      {/* Left side - Branding */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
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
                }}
              >
                🎉 Tham gia cùng chúng tôi!
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2, 
                  opacity: 0.7,
                }}
              >
                Đăng ký tài khoản để trải nghiệm hệ thống quản lý nhà hàng hiện đại và chuyên nghiệp.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Right side - Register form */}
      <Box
        sx={{
          flex: { xs: 1, lg: '0 0 550px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 4 },
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
            maxWidth: 480,
            p: { xs: 3, sm: 4 },
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
              display: { xs: 'flex', lg: 'none' }, 
              alignItems: 'center', 
              gap: 1.5, 
              mb: 3,
              justifyContent: 'center',
            }}
          >
            <Box
              component={motion.div}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.4)',
              }}
            >
              <Restaurant sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="primary">
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
            Đăng ký tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tạo tài khoản mới để bắt đầu sử dụng hệ thống
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

          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <TextField
              name="hoTen"
              label="Họ và tên *"
              value={form.hoTen}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('hoTen')}
              helperText={getFieldError('hoTen')}
              fullWidth
              autoFocus
              placeholder="Nhập họ và tên"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
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

            {/* Username */}
            <TextField
              name="username"
              label="Tên đăng nhập *"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('username')}
              helperText={getFieldError('username')}
              fullWidth
              placeholder="Nhập tên đăng nhập"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="action" />
                  </InputAdornment>
                ),
              }}
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

            {/* Phone Number */}
            <TextField
              name="soDienThoai"
              label="Số điện thoại"
              value={form.soDienThoai}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('soDienThoai')}
              helperText={getFieldError('soDienThoai') || 'Không bắt buộc'}
              fullWidth
              placeholder="Nhập số điện thoại"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
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
            
            {/* Password */}
            <TextField
              name="password"
              label="Mật khẩu *"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('password')}
              helperText={getFieldError('password') || 'Ít nhất 6 ký tự'}
              fullWidth
              placeholder="Nhập mật khẩu"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
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

            {/* Confirm Password */}
            <TextField
              name="confirmPassword"
              label="Xác nhận mật khẩu *"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!getFieldError('confirmPassword')}
              helperText={getFieldError('confirmPassword')}
              fullWidth
              placeholder="Nhập lại mật khẩu"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <motion.div
                        key={showConfirmPassword ? 'visible' : 'hidden'}
                        initial={{ rotateY: 90 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </motion.div>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={loading}
              loadingIndicator="Đang đăng ký..."
              fullWidth
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                py: 1.5,
                mt: 1,
                fontSize: '1rem',
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
              Đăng ký
            </LoadingButton>
          </Stack>

          {/* Login link */}
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{' '}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              >
                Đăng nhập ngay
              </Link>
            </Typography>
          </Box>
        </Paper>

        <Typography 
          variant="body2" 
          sx={{ 
            mt: 3, 
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

export default Register;
