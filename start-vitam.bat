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

echo [4/4] Launching one-click orchestrator...
echo.
echo ========================================================
echo This launcher waits for readiness, selects free local ports,
echo and then opens the active VITAM workspace automatically on
echo a passkey-safe localhost URL.
echo ========================================================
echo.
call npm.cmd run launch
