const express = require('express');
const {
  createPlaylist,
  getMyPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
} = require('../controllers/playlistController');

const authenticate = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');

const router = express.Router();

router.post('/', authenticate, createPlaylist);

router.get('/me', authenticate, getMyPlaylists);

router.get('/public', getPublicPlaylists);

router.get('/:id', optionalAuthenticate, getPlaylistById);

router.put('/:id', authenticate, updatePlaylist);

router.post('/:id/tracks', authenticate, addTrackToPlaylist);

router.delete('/:id/tracks/:trackId', authenticate, removeTrackFromPlaylist);

router.delete('/:id', authenticate, deletePlaylist);

module.exports = router;