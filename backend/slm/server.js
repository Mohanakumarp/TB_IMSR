const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from backend/.env if present
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.SLM_PORT || 8000;

// Middleware
app.use(cors()); // Allows your React Native app to make requests here
app.use(express.json()); // Allows Express to read JSON data from the mobile app

// Import our chat route
const chatRoutes = require('./routes/chat');
app.use('/api', chatRoutes);

// A simple check to ensure the server is alive
app.get('/', (req, res) => {
  res.send('PSGIMSR Backend is actively running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});