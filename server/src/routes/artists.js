const express = require('express');
const {
  getAllArtists,
  getArtistProfile,
  getArtistTracks,
  getMyArtistProfile,
  updateArtistProfile,
  followArtist,
  getFollowingArtists,
} = require('../controllers/artistController');

const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllArtists);

router.get('/following/me', authenticate, getFollowingArtists);

router.get('/profile/me', authenticate, getMyArtistProfile);

router.put(
  '/profile/me',
  authenticate,
  upload.single('avatar'),
  updateArtistProfile
);

router.get('/:id', getArtistProfile);

router.get('/:id/tracks', getArtistTracks);

router.post('/:id/follow', authenticate, followArtist);

module.exports = router;