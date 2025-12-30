@echo off
echo ================================================================
echo      QUICK PERMISSION CHECK - RESTAURANT MANAGEMENT
echo ================================================================
echo.

echo 1. Checking if backend is running...
curl -s http://localhost:4000/api/auth/login >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Backend is running on port 4000
) else (
    echo    [ERROR] Backend is NOT running!
    echo    Start backend: cd backend ^&^& npm run dev
    exit /b 1
)

echo.
echo 2. Running comprehensive permission check...
cd backend
node diagnose-permissions.js
if %errorlevel% neq 0 (
    echo    [ERROR] Permission check failed!
    exit /b 1
)

echo.
echo ================================================================
echo                    CHECK COMPLETE
echo ================================================================
echo.
echo If all checks passed, the backend is working correctly.
echo.
echo If you have frontend issues:
echo   1. Open browser DevTools Console (F12)
echo   2. Run: localStorage.clear(); location.href = '/login';
echo   3. Login again with admin/admin123
echo.
echo For detailed debug:
echo   - Open debug-permissions.html in browser
echo   - Or check DEBUG_FULL_FLOW.md
echo.
pause
