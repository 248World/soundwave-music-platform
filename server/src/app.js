const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/tracks');
const artistRoutes = require('./routes/artists');
const playlistRoutes = require('./routes/playlists');
const adminRoutes = require('./routes/admin');
const discoverRoutes = require('./routes/discover');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SoundWave API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discover', discoverRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error.',
  });
});

app.listen(PORT, () => {
  console.log(`SoundWave server running on port ${PORT}`);
});