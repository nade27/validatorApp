require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
