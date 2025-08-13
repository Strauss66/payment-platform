#!/bin/bash

echo "🚀 Starting School Platform Application..."
echo "=========================================="

# Check if MySQL is running
echo "🔍 Checking MySQL connection..."
if mysql -u root -p'Dude8866?' -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL is running and accessible"
else
    echo "❌ MySQL is not running or not accessible"
    echo "Please start MySQL service first:"
    echo "  - macOS: brew services start mysql"
    echo "  - Linux: sudo systemctl start mysql"
    echo "  - Windows: Start MySQL service from Services"
    exit 1
fi

# Check if database exists
echo "🔍 Checking database..."
if mysql -u root -p'Dude8866?' -e "USE my_db;" >/dev/null 2>&1; then
    echo "✅ Database 'my_db' exists"
else
    echo "⚠️  Database 'my_db' does not exist, creating..."
    mysql -u root -p'Dude8866?' -e "CREATE DATABASE IF NOT EXISTS my_db;"
    echo "✅ Database 'my_db' created"
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "✅ All dependencies installed"

# Start the application
echo "🚀 Starting the application..."
echo "Backend will run on http://localhost:5001"
echo "Frontend will run on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev
