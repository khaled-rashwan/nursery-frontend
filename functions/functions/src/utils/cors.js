// functions/functions/src/utils/cors.js
const cors = require('cors');

// Define your CORS options
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://gen-alpha-school-49349.web.app',
    'https://gen-alpha-school-49349.firebaseapp.com',
    'https://nursery-f-git-1120bb-khaled-abdelrazek-rashwan-rasheds-projects.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

// Helper function to set CORS headers manually for Firebase Functions (legacy, for functions that are not yet updated)
const setCorsHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Helper function to handle OPTIONS pre-flight requests (legacy)
const handleCorsOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true; // Indicates that the request was handled
  }
  return false; // Indicates that the request was not handled
};

module.exports = {
  corsMiddleware,
  setCorsHeaders,
  handleCorsOptions,
};
