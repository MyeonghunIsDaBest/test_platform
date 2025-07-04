@echo off
echo ========================================
echo   Yoru's Random Test Platform Setup
echo ========================================
echo.

echo [1/6] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker found

echo.
echo [2/6] Starting PostgreSQL database...
docker-compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start database
    pause
    exit /b 1
)
echo ✅ Database started

echo.
echo [3/6] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [4/6] Setting up database...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Failed to run database migrations
    pause
    exit /b 1
)

call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database setup complete

echo.
echo [5/6] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [6/6] Setup complete!
echo.
echo ========================================
echo   🎉 Setup Successful!
echo ========================================
echo.
echo To start the development servers:
echo.
echo Backend:  cd backend  ^&^& npm run dev
echo Frontend: cd frontend ^&^& npm run dev
echo.
echo Test accounts:
echo Admin:    admin@yoru-test-platform.com / admin123456
echo Customer: john.doe@example.com / customer123
echo Professional: sarah.johnson@example.com / professional123
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000
echo.
pause
