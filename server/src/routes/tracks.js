const express = require('express');
const {
  uploadTrack,
  getTracks,
  getMyTracks,
  getSingleTrack,
  updateTrack,
  increasePlayCount,
  downloadTrack,
  downloadTrackFile,
  toggleLikeTrack,
  getMyLikedTracks,
  getMyLikedTrackIds,
  getTrackComments,
  addTrackComment,
  deleteTrackComment,
  deleteTrack,
} = require('../controllers/trackController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getTracks);

router.get('/my-tracks', authenticate, authorize('artist'), getMyTracks);

router.get('/liked/me', authenticate, getMyLikedTracks);

router.get('/liked-ids/me', authenticate, getMyLikedTrackIds);

router.delete('/comments/:commentId', authenticate, deleteTrackComment);

router.get('/:id/comments', getTrackComments);

router.post('/:id/comments', authenticate, addTrackComment);

router.get('/:id/download-file', downloadTrackFile);

router.get('/:id', getSingleTrack);

router.put(
  '/:id',
  authenticate,
  authorize('artist', 'admin'),
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  updateTrack
);

router.patch('/:id/play', increasePlayCount);

router.patch('/:id/download', downloadTrack);

router.patch('/:id/like', authenticate, toggleLikeTrack);

router.delete('/:id', authenticate, authorize('artist', 'admin'), deleteTrack);

router.post(
  '/upload',
  authenticate,
  authorize('artist'),
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadTrack
);

module.exports = router;