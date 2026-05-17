const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  updateUser,
  deleteUser,
  getAllTracks,
  toggleTrackPublished,
  getAllPlaylists,
  deletePlaylistAsAdmin,
} = require('../controllers/adminController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);

router.patch('/users/:id/status', toggleUserStatus);

router.patch('/users/:id/role', updateUserRole);

router.patch('/users/:id', updateUser);

router.delete('/users/:id', deleteUser);

router.get('/tracks', getAllTracks);

router.patch('/tracks/:id/published', toggleTrackPublished);

router.get('/playlists', getAllPlaylists);

router.delete('/playlists/:id', deletePlaylistAsAdmin);

module.exports = router;