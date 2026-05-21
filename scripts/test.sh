#!/bin/bash
set -e
echo "🧪 Running backend tests..."
cd apps/api && source venv/Scripts/activate && pytest tests/ -v --tb=short

echo "🧪 Running frontend tests..."
cd ../web && npm test -- --watchAll=false --passWithNoTests

echo "✅ All tests passed"
