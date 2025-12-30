#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🔍 QUICK PERMISSION CHECK - RESTAURANT MANAGEMENT     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
if curl -s http://localhost:4000/api/auth/login -o /dev/null 2>&1; then
    echo "    ✅ Backend is running on port 4000"
else
    echo "    ❌ Backend is NOT running!"
    echo "    → Start backend: cd backend && npm run dev"
    exit 1
fi

# Check database connection
echo ""
echo "2️⃣  Checking database connection..."
cd backend
node -e "
const { prisma } = require('./src/config/db');
prisma.\$connect()
  .then(() => { console.log('    ✅ Database connected'); process.exit(0); })
  .catch(() => { console.log('    ❌ Database connection failed'); process.exit(1); });
" || exit 1

# Check admin permissions
echo ""
echo "3️⃣  Checking admin permissions..."
node -e "
const { prisma } = require('./src/config/db');
(async () => {
  const admin = await prisma.vaiTro.findFirst({
    where: { ten: 'Admin' },
    include: { quyen: { include: { quyen: true } } }
  });
  const count = admin?.quyen?.length || 0;
  console.log('    Admin has ' + count + ' permissions');
  if (count >= 30) {
    console.log('    ✅ Admin permissions look good');
  } else {
    console.log('    ❌ Admin permissions seem low');
  }
  await prisma.\$disconnect();
  process.exit(0);
})();
"

# Test login
echo ""
echo "4️⃣  Testing admin login..."
node diagnose-permissions.js 2>&1 | grep -q "SUCCESS"
if [ $? -eq 0 ]; then
    echo "    ✅ Admin login works"
else
    echo "    ❌ Admin login failed"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ CHECK COMPLETE                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "If all checks passed, the backend is working correctly."
echo "If you have frontend issues:"
echo "  1. Clear browser localStorage"
echo "  2. Login again"
echo "  3. Check browser console for errors"
echo ""
echo "For detailed debug, open: debug-permissions.html"
