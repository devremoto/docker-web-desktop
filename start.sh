# Start Docker Web Desktop Application

echo "Starting Docker Web Desktop Application..."
echo ""

echo "Starting Backend Server..."
cd backend
node src/server.js &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend Development Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:3000"
echo "Frontend: Will be available shortly at the URL shown above"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID