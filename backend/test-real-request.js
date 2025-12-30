require('dotenv').config();

// Hướng dẫn sử dụng script này:
// 1. Đảm bảo backend đang chạy
// 2. Chạy: node test-real-request.js
// 3. Xem log để debug

async function testRealRequest() {
  console.log('=== TESTING REAL API REQUEST ===\n');
  
  // Lấy token từ login
  const authService = require('./src/services/auth.service');
  const loginResult = await authService.login({
    username: 'admin',
    password: 'admin123'
  });
  
  const token = loginResult.accessToken;
  console.log('✓ Logged in successfully');
  console.log('  Token (first 50 chars):', token.substring(0, 50) + '...');
  console.log('  User permissions:', loginResult.user.permissions.length);
  console.log();
  
  // Giả lập một HTTP request
  const express = require('express');
  const app = express();
  const { authMiddleware } = require('./src/middleware/auth');
  const { requirePermissions } = require('./src/middleware/rbac');
  const { PERMISSIONS } = require('./src/utils/permissions');
  
  app.use(express.json());
  
  // Test endpoint giống như menu routes
  app.get('/api/menu/dishes', 
    authMiddleware,
    requirePermissions([PERMISSIONS.MENU_VIEW]),
    (req, res) => {
      res.json({ 
        success: true,
        message: 'Access granted!',
        userId: req.user.id
      });
    }
  );
  
  const server = app.listen(3333, async () => {
    console.log('Test server listening on port 3333\n');
    
    // Sử dụng http module để test
    const http = require('http');
    
    console.log('--- Making request to /api/menu/dishes ---');
    console.log('Headers: Authorization: Bearer <token>');
    console.log();
    
    const options = {
      hostname: 'localhost',
      port: 3333,
      path: '/api/menu/dishes',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`Response Status: ${res.statusCode}`);
      console.log('Response Headers:', res.headers);
      console.log();
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:', data);
        console.log();
        
        if (res.statusCode === 200) {
          console.log('✓ SUCCESS! Backend accepted the request with proper permissions');
        } else if (res.statusCode === 401) {
          console.log('✗ FAILED: 401 Unauthorized - Token not valid or missing');
        } else if (res.statusCode === 403) {
          console.log('✗ FAILED: 403 Forbidden - User lacks required permissions');
        } else {
          console.log('? UNEXPECTED status code');
        }
        
        cleanup();
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      cleanup();
    });
    
    req.end();
  });
  
  async function cleanup() {
    console.log('\nClosing connections...');
    const { prisma } = require('./src/config/db');
    await prisma.$disconnect();
    server.close();
    console.log('Done!');
  }
}

testRealRequest().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
