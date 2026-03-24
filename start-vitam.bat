@echo off
setlocal
echo ========================================================
echo        VITAM AI CAMPUS OPERATING SYSTEM LAUNCHER
echo ========================================================
echo.
echo Initiating Enterprise Startup Sequence...

echo [1/4] Verifying Root Launcher Dependencies...
if not exist node_modules (
  call npm.cmd install --silent
)

echo [2/4] Verifying Backend Dependencies...
pushd server
if not exist node_modules (
  call npm.cmd install --silent
)
popd

echo [3/4] Verifying Frontend Dependencies...
pushd client
if not exist node_modules (
  call npm.cmd install --silent
)
popd

echo [4/4] Launching Backend on Port 5100 and Frontend on Port 5173...
echo.
echo ========================================================
echo The application is now LIVE. 
echo Open your browser to: http://localhost:5173
echo ========================================================
echo.
call npm.cmd run dev
