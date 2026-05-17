const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;

  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  const fullPath = path.join(__dirname, '../../', cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const getUploadedFilePath = (fileUrl) => {
  if (!fileUrl) return null;

  const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  return path.join(__dirname, '../../', cleanPath);
};

const createSafeDownloadName = (title, audioUrl) => {
  const extension = path.extname(audioUrl || '') || '.mp3';

  const safeTitle = String(title || 'soundwave-track')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ');

  return `${safeTitle || 'soundwave-track'}${extension}`;
};

const getArtistIdForUser = async (userId) => {
  const [artists] = await pool.query(
    'SELECT id FROM artist_profiles WHERE user_id = ? LIMIT 1',
    [userId]
  );

  return artists.length > 0 ? artists[0].id : null;
};

const uploadTrack = async (req, res) => {
  try {
    const { title, genre_id, lyrics, is_downloadable } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Track title is required.',
      });
    }

    if (!req.files || !req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required.',
      });
    }

    const artistId = await getArtistIdForUser(req.user.id);

    if (!artistId) {
      return res.status(403).json({
        success: false,
        message: 'Only artists can upload tracks.',
      });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    const audioUrl = `/uploads/audio/${audioFile.filename}`;
    const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO tracks
       (artist_id, genre_id, title, cover_url, audio_url, lyrics, is_downloadable, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        artistId,
        genre_id || null,
        title.trim(),
        coverUrl,
        audioUrl,
        lyrics || null,
        is_downloadable === 'false' ? false : true,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Track uploaded successfully.',
      track: {
        id: result.insertId,
        title: title.trim(),
        audio_url: audioUrl,
        cover_url: coverUrl,
      },
    });
  } catch (error) {
    console.error('Upload track error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while uploading track.',
    });
  }
};

const getTracks = async (req, res) => {
  try {
    const [tracks] = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.play_count,
        t.download_count,
        t.like_count,
        t.is_downloadable,
        t.created_at,
        ap.id AS artist_id,
        ap.display_name AS artist_name,
        g.name AS genre_name
       FROM tracks t
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.is_published = TRUE
       ORDER BY t.created_at DESC`
    );

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Get tracks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching tracks.',
    });
  }
};

const getMyTracks = async (req, res) => {
  try {
    const artistId = await getArtistIdForUser(req.user.id);

    if (!artistId) {
      return res.status(403).json({
        success: false,
        message: 'Only artists can view their uploaded tracks.',
      });
    }

    const [tracks] = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.play_count,
        t.download_count,
        t.like_count,
        t.is_downloadable,
        t.is_published,
        t.lyrics,
        t.genre_id,
        t.created_at,
        g.name AS genre_name
       FROM tracks t
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.artist_id = ?
       ORDER BY t.created_at DESC`,
      [artistId]
    );

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Get my tracks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your tracks.',
    });
  }
};

const getSingleTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      `SELECT 
        t.*,
        ap.id AS artist_id,
        ap.display_name AS artist_name,
        g.name AS genre_name
       FROM tracks t
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.id = ?
       LIMIT 1`,
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    return res.json({
      success: true,
      track: tracks[0],
    });
  } catch (error) {
    console.error('Get single track error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching track.',
    });
  }
};

const updateTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre_id, lyrics, is_downloadable, is_published } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Track title is required.',
      });
    }

    const artistId = await getArtistIdForUser(req.user.id);

    if (!artistId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only artists or admins can update tracks.',
      });
    }

    let query = 'SELECT * FROM tracks WHERE id = ? LIMIT 1';
    let params = [id];

    if (req.user.role === 'artist') {
      query = 'SELECT * FROM tracks WHERE id = ? AND artist_id = ? LIMIT 1';
      params = [id, artistId];
    }

    const [tracks] = await pool.query(query, params);

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found or you do not own this track.',
      });
    }

    const existingTrack = tracks[0];

    let newCoverUrl = existingTrack.cover_url;

    if (req.files && req.files.cover && req.files.cover.length > 0) {
      const coverFile = req.files.cover[0];
      newCoverUrl = `/uploads/covers/${coverFile.filename}`;

      if (existingTrack.cover_url) {
        deleteUploadedFile(existingTrack.cover_url);
      }
    }

    await pool.query(
      `UPDATE tracks
       SET title = ?,
           genre_id = ?,
           lyrics = ?,
           is_downloadable = ?,
           is_published = ?,
           cover_url = ?
       WHERE id = ?`,
      [
        title.trim(),
        genre_id || null,
        lyrics || null,
        is_downloadable === 'false' || is_downloadable === false ? false : true,
        is_published === 'false' || is_published === false ? false : true,
        newCoverUrl,
        id,
      ]
    );

    const [updatedTracks] = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.play_count,
        t.download_count,
        t.like_count,
        t.is_downloadable,
        t.is_published,
        t.lyrics,
        t.genre_id,
        t.created_at,
        g.name AS genre_name
       FROM tracks t
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Track updated successfully.',
      track: updatedTracks[0],
    });
  } catch (error) {
    console.error('Update track error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating track.',
    });
  }
};

const increasePlayCount = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      'SELECT id, play_count FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    await pool.query(
      'UPDATE tracks SET play_count = play_count + 1 WHERE id = ?',
      [id]
    );

    const [updatedTracks] = await pool.query(
      'SELECT id, play_count FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({
      success: true,
      message: 'Play count updated.',
      track: updatedTracks[0],
    });
  } catch (error) {
    console.error('Increase play count error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating play count.',
    });
  }
};

const downloadTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      `SELECT 
        id,
        title,
        audio_url,
        download_count,
        is_downloadable,
        is_published
       FROM tracks
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const track = tracks[0];

    if (!track.is_published) {
      return res.status(403).json({
        success: false,
        message: 'This track is not published.',
      });
    }

    if (!track.is_downloadable) {
      return res.status(403).json({
        success: false,
        message: 'Downloads are disabled for this track.',
      });
    }

    await pool.query(
      'UPDATE tracks SET download_count = download_count + 1 WHERE id = ?',
      [id]
    );

    const [updatedTracks] = await pool.query(
      'SELECT id, download_count FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({
      success: true,
      message: 'Download count updated.',
      track: {
        id: updatedTracks[0].id,
        download_count: updatedTracks[0].download_count,
        download_url: `/api/tracks/${id}/download-file`,
        title: track.title,
      },
    });
  } catch (error) {
    console.error('Download track error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while preparing download.',
    });
  }
};

const downloadTrackFile = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      `SELECT 
        id,
        title,
        audio_url,
        is_downloadable,
        is_published
       FROM tracks
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const track = tracks[0];

    if (!track.is_published) {
      return res.status(403).json({
        success: false,
        message: 'This track is not published.',
      });
    }

    if (!track.is_downloadable) {
      return res.status(403).json({
        success: false,
        message: 'Downloads are disabled for this track.',
      });
    }

    const filePath = getUploadedFilePath(track.audio_url);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Audio file not found on server.',
      });
    }

    const downloadName = createSafeDownloadName(track.title, track.audio_url);

    return res.download(filePath, downloadName);
  } catch (error) {
    console.error('Download track file error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while downloading track.',
    });
  }
};

const toggleLikeTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [tracks] = await pool.query(
      'SELECT id, like_count FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const [existingLikes] = await pool.query(
      'SELECT user_id FROM likes WHERE user_id = ? AND track_id = ? LIMIT 1',
      [userId, id]
    );

    let liked = false;

    if (existingLikes.length > 0) {
      await pool.query(
        'DELETE FROM likes WHERE user_id = ? AND track_id = ?',
        [userId, id]
      );

      await pool.query(
        'UPDATE tracks SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
        [id]
      );

      liked = false;
    } else {
      await pool.query('INSERT INTO likes (user_id, track_id) VALUES (?, ?)', [
        userId,
        id,
      ]);

      await pool.query(
        'UPDATE tracks SET like_count = like_count + 1 WHERE id = ?',
        [id]
      );

      liked = true;
    }

    const [updatedTracks] = await pool.query(
      'SELECT id, like_count FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({
      success: true,
      message: liked ? 'Track liked.' : 'Track unliked.',
      liked,
      track: updatedTracks[0],
    });
  } catch (error) {
    console.error('Toggle like error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while liking track.',
    });
  }
};

const getMyLikedTracks = async (req, res) => {
  try {
    const userId = req.user.id;

    const [tracks] = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.play_count,
        t.download_count,
        t.like_count,
        t.is_downloadable,
        t.created_at,
        ap.id AS artist_id,
        ap.display_name AS artist_name,
        g.name AS genre_name
       FROM likes l
       INNER JOIN tracks t ON l.track_id = t.id
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE l.user_id = ? AND t.is_published = TRUE
       ORDER BY l.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Get liked tracks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching liked tracks.',
    });
  }
};

const getMyLikedTrackIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const [likes] = await pool.query(
      `SELECT track_id
       FROM likes
       WHERE user_id = ?`,
      [userId]
    );

    const likedTrackIds = likes.map((like) => like.track_id);

    return res.json({
      success: true,
      likedTrackIds,
    });
  } catch (error) {
    console.error('Get liked track ids error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching liked track ids.',
    });
  }
};

const getTrackComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      'SELECT id FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const [comments] = await pool.query(
      `SELECT
        c.id,
        c.user_id,
        c.track_id,
        c.body,
        c.created_at,
        u.email,
        ap.display_name AS artist_name
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       LEFT JOIN artist_profiles ap ON ap.user_id = u.id
       WHERE c.track_id = ? AND c.is_flagged = FALSE
       ORDER BY c.created_at DESC`,
      [id]
    );

    const formattedComments = comments.map((comment) => ({
      ...comment,
      author_name: comment.artist_name || comment.email,
    }));

    return res.json({
      success: true,
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Get comments error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching comments.',
    });
  }
};

const addTrackComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const userId = req.user.id;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty.',
      });
    }

    const [tracks] = await pool.query(
      'SELECT id FROM tracks WHERE id = ? LIMIT 1',
      [id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO comments (user_id, track_id, body)
       VALUES (?, ?, ?)`,
      [userId, id, body.trim()]
    );

    const [comments] = await pool.query(
      `SELECT
        c.id,
        c.user_id,
        c.track_id,
        c.body,
        c.created_at,
        u.email,
        ap.display_name AS artist_name
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       LEFT JOIN artist_profiles ap ON ap.user_id = u.id
       WHERE c.id = ?
       LIMIT 1`,
      [result.insertId]
    );

    const comment = comments[0];

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: {
        ...comment,
        author_name: comment.artist_name || comment.email,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding comment.',
    });
  }
};

const deleteTrackComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const [comments] = await pool.query(
      'SELECT id, user_id FROM comments WHERE id = ? LIMIT 1',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const comment = comments[0];

    if (comment.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments.',
      });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    return res.json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('Delete comment error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting comment.',
    });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const artistId = await getArtistIdForUser(req.user.id);

    if (!artistId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only artists or admins can delete tracks.',
      });
    }

    let query = 'SELECT * FROM tracks WHERE id = ? LIMIT 1';
    let params = [id];

    if (req.user.role === 'artist') {
      query = 'SELECT * FROM tracks WHERE id = ? AND artist_id = ? LIMIT 1';
      params = [id, artistId];
    }

    const [tracks] = await pool.query(query, params);

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found or you do not own this track.',
      });
    }

    const track = tracks[0];

    await pool.query('DELETE FROM tracks WHERE id = ?', [id]);

    deleteUploadedFile(track.audio_url);
    deleteUploadedFile(track.cover_url);

    return res.json({
      success: true,
      message: 'Track deleted successfully.',
    });
  } catch (error) {
    console.error('Delete track error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting track.',
    });
  }
};

module.exports = {
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
};