const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
