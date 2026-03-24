@echo off
echo ========================================================
echo        VITAM AI CAMPUS OS: PRODUCTION PUBLISHER
echo ========================================================
echo.
echo [1/4] Installing Root Monorepo Dependencies...
call npm install concurrently --silent

echo [2/4] Executing Deep Build Sequence...
echo This will compile the React 18 SPA into optimized production static files.
call npm run build

echo [3/4] Activating NodeJS Production API...
echo Server running on Port 5055 with React Static Integration.
echo.
echo ========================================================
echo PUBLISHING COMPLETE.
echo Your application is now live as a unified MERN stack.
echo Open your browser to: http://localhost:5055
echo ========================================================
echo.
set PUBLISH_MODE=true
call npm start
