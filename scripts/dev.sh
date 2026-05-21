#!/bin/bash
# CloudClick local dev runner — no Docker
set -e
trap "kill 0" EXIT

echo "🚀 Starting CloudClick dev environment..."

# Start Flask API
cd apps/api
source venv/Scripts/activate # using Scripts for windows compat or bin for linux, let's use the cross-compat way if possible, or just standard Linux
export FLASK_ENV=development
flask run --port=5000 --reload &
API_PID=$!
echo "✅ Flask API started (PID: $API_PID)"

# Start Next.js
cd ../web
npm run dev &
WEB_PID=$!
echo "✅ Next.js started (PID: $WEB_PID)"

echo ""
echo "📡 API:      http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
