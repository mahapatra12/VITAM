#!/bin/bash
set -e

echo "========================================================"
echo "       VITAM AI CAMPUS OPERATING SYSTEM LAUNCHER"
echo "========================================================"
echo ""
echo "Initiating Enterprise Startup Sequence..."

echo "[1/4] Verifying root launcher dependencies..."
if [ ! -d node_modules ]; then
  npm install --silent
fi

echo "[2/4] Verifying backend dependencies..."
if [ ! -d server/node_modules ]; then
  (
    cd server
    npm install --silent
  )
fi

echo "[3/4] Verifying frontend dependencies..."
if [ ! -d client/node_modules ]; then
  (
    cd client
    npm install --silent
  )
fi

echo "[4/4] Launching backend on port 5100 and frontend on port 5173..."
echo ""
echo "========================================================"
echo "The application is now LIVE. "
echo "Open your browser to: http://localhost:5173"
echo "========================================================"
echo ""
npm run dev
