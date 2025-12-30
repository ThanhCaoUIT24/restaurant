require('dotenv').config();
const axios = require('axios');
const authService = require('./src/services/auth.service');

async function testSpecificEndpoints() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           TEST CÁC ENDPOINT CỤ THỂ VỚI ADMIN             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Login để lấy token
    console.log('1️⃣  Đang login với admin account...');
    const loginResult = await authService.login({
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResult.accessToken;
    console.log(`✅ Login thành công`);
    console.log(`   Permissions: ${loginResult.user.permissions.length}`);
    console.log('');

    const baseURL = 'http://localhost:4000/api';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test các endpoints quan trọng
    const tests = [
      { name: 'Menu - List Dishes', method: 'get', url: '/menu/dishes', permission: 'MENU_VIEW' },
      { name: 'Menu - List Categories', method: 'get', url: '/menu/categories', permission: 'MENU_VIEW' },
      { name: 'Orders - List', method: 'get', url: '/orders', permission: 'ORDER_VIEW' },
      { name: 'Tables - List', method: 'get', url: '/tables', permission: 'TABLE_VIEW' },
      { name: 'Inventory - List Stock', method: 'get', url: '/inventory/stock', permission: 'STOCK_VIEW' },
      { name: 'Purchase - List Orders', method: 'get', url: '/purchase/orders', permission: 'PO_VIEW' },
      { name: 'Customers - List', method: 'get', url: '/customers', permission: 'CUSTOMER_VIEW' },
      { name: 'Reservations - List', method: 'get', url: '/reservations', permission: 'RESERVATION_VIEW' },
      { name: 'Reports - Sales', method: 'get', url: '/reports/sales?startDate=2025-01-01&endDate=2025-12-31', permission: 'REPORT_VIEW' },
      { name: 'HR - Employees', method: 'get', url: '/hr/employees', permission: 'HR_VIEW' },
      { name: 'Admin - Roles', method: 'get', url: '/admin/roles', permission: 'ACCOUNT_MANAGE' },
      { name: 'Admin - Permissions', method: 'get', url: '/admin/permissions', permission: 'ACCOUNT_MANAGE' },
      { name: 'KDS - Orders', method: 'get', url: '/kds/orders', permission: 'KDS_VIEW' },
      { name: 'Void Requests - List', method: 'get', url: '/void-requests?status=PENDING', permission: 'ORDER_VOID_APPROVE' },
    ];

    console.log('2️⃣  Testing endpoints...\n');
    console.log('─'.repeat(80));
    
    let passed = 0;
    let failed = 0;
    const failedTests = [];

    for (const test of tests) {
      try {
        const response = await axios({
          method: test.method,
          url: baseURL + test.url,
          headers,
          validateStatus: () => true // Don't throw on any status
        });

        const status = response.status;
        let result = '';
        
        if (status === 200 || status === 304) {
          result = '✅ PASS';
          passed++;
        } else if (status === 401) {
          result = '❌ FAIL (401 Unauthorized)';
          failed++;
          failedTests.push({ ...test, status, reason: 'Token invalid' });
        } else if (status === 403) {
          result = '❌ FAIL (403 Forbidden)';
          failed++;
          failedTests.push({ ...test, status, reason: 'No permission', detail: response.data });
        } else if (status === 404) {
          result = '⚠️  WARN (404 Not Found)';
        } else {
          result = `⚠️  ${status}`;
        }

        console.log(`${result.padEnd(25)} | ${test.name.padEnd(30)} | ${test.permission}`);
      } catch (error) {
        console.log(`❌ ERROR              | ${test.name.padEnd(30)} | ${error.message}`);
        failed++;
        failedTests.push({ ...test, reason: error.message });
      }
    }

    console.log('─'.repeat(80));
    console.log('');

    // Tóm tắt
    console.log('📊 KẾT QUẢ:');
    console.log(`   Passed: ${passed}/${tests.length}`);
    console.log(`   Failed: ${failed}/${tests.length}`);
    console.log('');

    if (failedTests.length > 0) {
      console.log('❌ CÁC ENDPOINT BỊ LỖI:');
      console.log('─'.repeat(80));
      failedTests.forEach(test => {
        console.log(`\n🔴 ${test.name}`);
        console.log(`   URL: ${test.url}`);
        console.log(`   Required Permission: ${test.permission}`);
        console.log(`   Status: ${test.status || 'Error'}`);
        console.log(`   Reason: ${test.reason}`);
        if (test.detail) {
          console.log(`   Detail:`, JSON.stringify(test.detail, null, 2));
        }
      });
      console.log('');
    } else {
      console.log('✅ TẤT CẢ ENDPOINTS HOẠT ĐỘNG CHÍNH XÁC!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testSpecificEndpoints();
