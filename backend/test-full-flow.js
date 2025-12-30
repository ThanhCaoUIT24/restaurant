require('dotenv').config();
const axios = require('axios');

// Start simple test server
const express = require('express');
const app = express();

// Import middleware
const { authMiddleware } = require('./src/middleware/auth');
const { requirePermissions } = require('./src/middleware/rbac');
const { PERMISSIONS } = require('./src/utils/permissions');

app.use(express.json());

// Test route với auth + permission
app.get('/test/menu', 
  authMiddleware,
  requirePermissions([PERMISSIONS.MENU_VIEW]),
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Bạn có quyền MENU_VIEW!',
      user: req.user 
    });
  }
);

app.get('/test/admin', 
  authMiddleware,
  requirePermissions(['ADMIN_MANAGE']),
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Bạn có quyền ADMIN_MANAGE!',
      user: req.user 
    });
  }
);

const server = app.listen(3456, async () => {
  console.log('Test server started on port 3456\n');
  
  try {
    // Get token from login
    const authService = require('./src/services/auth.service');
    const loginResult = await authService.login({
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResult.accessToken;
    console.log('Logged in successfully');
    console.log('User permissions:', loginResult.user.permissions);
    console.log();
    
    // Test 1: Gọi endpoint yêu cầu MENU_VIEW (admin có quyền này)
    console.log('--- Test 1: GET /test/menu (cần MENU_VIEW) ---');
    try {
      const res1 = await axios.get('http://localhost:3456/test/menu', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Success:', res1.data.message);
      console.log('  User in request:', res1.data.user.id);
      console.log('  Permissions:', res1.data.user.permissions.length, 'permissions');
    } catch (err) {
      console.log('✗ Failed:', err.response?.data || err.message);
    }
    
    console.log();
    
    // Test 2: Gọi endpoint yêu cầu ADMIN_MANAGE (cần kiểm tra xem có quyền không)
    console.log('--- Test 2: GET /test/admin (cần ADMIN_MANAGE) ---');
    try {
      const res2 = await axios.get('http://localhost:3456/test/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Success:', res2.data.message);
    } catch (err) {
      console.log('✗ Failed:', err.response?.data || err.message);
    }
    
    console.log();
    
    // Test 3: Gọi mà không có token
    console.log('--- Test 3: GET /test/menu (không có token) ---');
    try {
      const res3 = await axios.get('http://localhost:3456/test/menu');
      console.log('✓ Success (không nên xảy ra):', res3.data);
    } catch (err) {
      console.log('✗ Failed (expected):', err.response?.data || err.message);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    const { prisma } = require('./src/config/db');
    await prisma.$disconnect();
    server.close();
    console.log('\nTest server closed');
  }
});
