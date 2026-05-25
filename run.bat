@echo off
title ProManage Runner
cls

:menu
cls
echo ===================================================
echo             ProManage Runner (Windows)
echo ===================================================
echo.
echo Please select how you want to run the project:
echo.
echo [1] Run with Docker (Recommended - Needs Docker Desktop)
echo [2] Run Locally (Frontend + Backend in separate windows)
echo [3] Exit
echo.
echo ===================================================
set /p choice="Enter choice (1, 2, or 3): "

if "%choice%"=="1" goto docker
if "%choice%"=="2" goto local
if "%choice%"=="3" goto exit
goto invalid

:docker
echo.
echo Checking if Docker Daemon is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is NOT running! Please start Docker Desktop first.
    echo.
    pause
    goto menu
)
echo [OK] Docker is running. Starting ProManage services...
echo.
docker-compose up --build
goto exit

:local
echo.
echo Starting backend server in a new window...
start "ProManage Backend" cmd /k "cd backend && npm start"
echo Starting frontend dev server in a new window...
start "ProManage Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo [SUCCESS] Both backend and frontend are starting up!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000
echo.
pause
goto exit

:invalid
echo.
echo Invalid choice. Please try again.
echo.
pause
goto menu

:exit
echo.
echo Thank you for using ProManage!
echo.
timeout /t 3 >nul
exit
