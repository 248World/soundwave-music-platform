const pool = require('../config/db');

const createPlaylist = async (req, res) => {
  try {
    const { name, description, is_public } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO playlists (user_id, name, description, is_public)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        description || null,
        is_public === false || is_public === 'false' ? false : true,
      ]
    );

    const [playlists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        COUNT(pt.track_id) AS total_tracks
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.id = ?
       GROUP BY
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Playlist created successfully.',
      playlist: playlists[0],
    });
  } catch (error) {
    console.error('Create playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while creating playlist.',
    });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;

    const [playlists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        COUNT(pt.track_id) AS total_tracks
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.user_id = ?
       GROUP BY
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      playlists,
    });
  } catch (error) {
    console.error('Get my playlists error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading playlists.',
    });
  }
};

const getPublicPlaylists = async (req, res) => {
  try {
    const [playlists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.email AS owner_email,
        COUNT(pt.track_id) AS total_tracks
       FROM playlists p
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.is_public = TRUE
       GROUP BY
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.email
       ORDER BY p.created_at DESC`
    );

    return res.json({
      success: true,
      playlists,
    });
  } catch (error) {
    console.error('Get public playlists error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading public playlists.',
    });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const [playlists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.email AS owner_email
       FROM playlists p
       INNER JOIN users u ON p.user_id = u.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    const playlist = playlists[0];
    const isOwner = Number(playlist.user_id) === Number(userId);

    if (!playlist.is_public && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This playlist is private.',
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
        t.created_at,
        pt.added_at,
        ap.id AS artist_id,
        ap.display_name AS artist_name,
        g.name AS genre_name
       FROM playlist_tracks pt
       INNER JOIN tracks t ON pt.track_id = t.id
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE pt.playlist_id = ? AND t.is_published = TRUE
       ORDER BY pt.added_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      playlist: {
        ...playlist,
        is_owner: isOwner,
        total_tracks: tracks.length,
      },
      tracks,
    });
  } catch (error) {
    console.error('Get playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading playlist.',
    });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_public } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required.',
      });
    }

    const [playlists] = await pool.query(
      `SELECT id, user_id
       FROM playlists
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    const playlist = playlists[0];

    if (Number(playlist.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own playlists.',
      });
    }

    await pool.query(
      `UPDATE playlists
       SET name = ?,
           description = ?,
           is_public = ?
       WHERE id = ?`,
      [
        name.trim(),
        description || null,
        is_public === false || is_public === 'false' ? false : true,
        id,
      ]
    );

    const [updatedPlaylists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        COUNT(pt.track_id) AS total_tracks
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.id = ?
       GROUP BY
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Playlist updated successfully.',
      playlist: updatedPlaylists[0],
    });
  } catch (error) {
    console.error('Update playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating playlist.',
    });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { track_id } = req.body;
    const userId = req.user.id;

    if (!track_id) {
      return res.status(400).json({
        success: false,
        message: 'Track ID is required.',
      });
    }

    const [playlists] = await pool.query(
      `SELECT id, user_id
       FROM playlists
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    const playlist = playlists[0];

    if (Number(playlist.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only add tracks to your own playlists.',
      });
    }

    const [tracks] = await pool.query(
      `SELECT id
       FROM tracks
       WHERE id = ? AND is_published = TRUE
       LIMIT 1`,
      [track_id]
    );

    if (tracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Track not found or not published.',
      });
    }

    const [existingTracks] = await pool.query(
      `SELECT playlist_id
       FROM playlist_tracks
       WHERE playlist_id = ? AND track_id = ?
       LIMIT 1`,
      [id, track_id]
    );

    if (existingTracks.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This track is already in the playlist.',
      });
    }

    await pool.query(
      `INSERT INTO playlist_tracks (playlist_id, track_id)
       VALUES (?, ?)`,
      [id, track_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Track added to playlist successfully.',
    });
  } catch (error) {
    console.error('Add track to playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while adding track to playlist.',
    });
  }
};

const removeTrackFromPlaylist = async (req, res) => {
  try {
    const { id, trackId } = req.params;
    const userId = req.user.id;

    const [playlists] = await pool.query(
      `SELECT id, user_id
       FROM playlists
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    const playlist = playlists[0];

    if (Number(playlist.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove tracks from your own playlists.',
      });
    }

    await pool.query(
      `DELETE FROM playlist_tracks
       WHERE playlist_id = ? AND track_id = ?`,
      [id, trackId]
    );

    return res.json({
      success: true,
      message: 'Track removed from playlist successfully.',
    });
  } catch (error) {
    console.error('Remove track from playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while removing track from playlist.',
    });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [playlists] = await pool.query(
      `SELECT id, user_id
       FROM playlists
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found.',
      });
    }

    const playlist = playlists[0];

    if (Number(playlist.user_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own playlists.',
      });
    }

    await pool.query('DELETE FROM playlists WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Playlist deleted successfully.',
    });
  } catch (error) {
    console.error('Delete playlist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting playlist.',
    });
  }
};

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
};