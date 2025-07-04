@echo off
echo ========================================
echo   Starting Yoru's Random Test Platform
echo ========================================
echo.

echo [1/4] Checking if database exists...
echo Please make sure you have created the database 'yoru_test_platform_db' in phpMyAdmin
echo URL: http://localhost/phpmyadmin
echo.
pause

echo [2/4] Setting up backend database...
cd backend
call npx prisma generate
call npx prisma db push
call npm run db:seed

echo.
echo [3/4] Starting backend server...
start cmd /k "npm run dev"

echo.
echo [4/4] Starting frontend server...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo   🎉 Development servers starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause
