require('dotenv').config();
const jwt = require('jsonwebtoken');
const { requirePermissions } = require('./src/middleware/rbac');
const { authMiddleware } = require('./src/middleware/auth');

// Mock request và response
function testMiddleware() {
  console.log('=== TESTING MIDDLEWARE ===\n');
  
  // Tạo token giả
  const token = jwt.sign(
    { 
      id: 'test-user',
      roles: ['Admin'],
      permissions: ['MENU_VIEW', 'MENU_CREATE', 'MENU_UPDATE']
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );
  
  console.log('Generated test token');
  
  // Test 1: Auth middleware
  console.log('\n--- Test 1: Auth Middleware ---');
  const req1 = {
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  const res1 = {
    status: (code) => {
      console.log(`Response status: ${code}`);
      return {
        json: (data) => {
          console.log('Response data:', data);
          return res1;
        }
      };
    }
  };
  
  authMiddleware(req1, res1, () => {
    console.log('Auth middleware passed!');
    console.log('req.user:', req1.user);
    
    // Test 2: Permission middleware - có quyền
    console.log('\n--- Test 2: Permission Middleware (có quyền MENU_VIEW) ---');
    const req2 = { user: req1.user };
    const res2 = {
      status: (code) => {
        console.log(`Response status: ${code}`);
        return {
          json: (data) => {
            console.log('Response data:', data);
            return res2;
          }
        };
      }
    };
    
    requirePermissions(['MENU_VIEW'])(req2, res2, () => {
      console.log('Permission check passed! ✓');
    });
    
    // Test 3: Permission middleware - KHÔNG có quyền
    console.log('\n--- Test 3: Permission Middleware (KHÔNG có quyền ORDER_VOID) ---');
    const req3 = { user: req1.user };
    const res3 = {
      status: (code) => {
        console.log(`Response status: ${code}`);
        return {
          json: (data) => {
            console.log('Response data:', data);
            return res3;
          }
        };
      }
    };
    
    requirePermissions(['ORDER_VOID'])(req3, res3, () => {
      console.log('Permission check passed! (This should NOT happen)');
    });
  });
}

testMiddleware();
