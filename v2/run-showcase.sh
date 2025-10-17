#!/bin/bash
# Showcase Runner Script
# Helps start both the main app and showcase page

echo "🚀 Starting Commute Cost Calculator Showcase..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🔧 Starting Next.js development server..."
echo "   The app will be available at: http://localhost:3000"
echo ""

# Start the development server in the background
npm run dev &
DEV_PID=$!

# Wait a moment for the server to start
sleep 3

echo "🎨 Opening showcase page..."
echo "   The showcase will open in your default browser"
echo ""

# Try to open the showcase page
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "showcase/index.html"
elif command -v open &> /dev/null; then
    # macOS
    open "showcase/index.html"
elif command -v start &> /dev/null; then
    # Windows
    start "showcase/index.html"
else
    echo "📁 Please manually open: showcase/index.html"
fi

echo ""
echo "✅ Showcase is now running!"
echo "   - Main app: http://localhost:3000"
echo "   - Showcase: showcase/index.html"
echo ""
echo "Press Ctrl+C to stop the development server"

# Wait for user to stop the server
wait $DEV_PID
