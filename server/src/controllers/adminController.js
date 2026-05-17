const pool = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [[userStats]] = await pool.query(
      `SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'artist' THEN 1 ELSE 0 END) AS total_artists,
        SUM(CASE WHEN role = 'listener' THEN 1 ELSE 0 END) AS total_listeners,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_users,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS disabled_users
       FROM users`
    );

    const [[trackStats]] = await pool.query(
      `SELECT
        COUNT(*) AS total_tracks,
        SUM(CASE WHEN is_published = TRUE THEN 1 ELSE 0 END) AS published_tracks,
        SUM(CASE WHEN is_published = FALSE THEN 1 ELSE 0 END) AS hidden_tracks,
        COALESCE(SUM(play_count), 0) AS total_plays,
        COALESCE(SUM(download_count), 0) AS total_downloads,
        COALESCE(SUM(like_count), 0) AS total_likes
       FROM tracks`
    );

    const [[commentStats]] = await pool.query(
      `SELECT COUNT(*) AS total_comments FROM comments`
    );

    const [[playlistStats]] = await pool.query(
      `SELECT
        COUNT(*) AS total_playlists,
        SUM(CASE WHEN is_public = TRUE THEN 1 ELSE 0 END) AS public_playlists,
        SUM(CASE WHEN is_public = FALSE THEN 1 ELSE 0 END) AS private_playlists
       FROM playlists`
    );

    const [recentUsers] = await pool.query(
      `SELECT id, email, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const [recentTracks] = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.is_published,
        t.created_at,
        ap.display_name AS artist_name
       FROM tracks t
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       ORDER BY t.created_at DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      stats: {
        total_users: Number(userStats.total_users || 0),
        total_artists: Number(userStats.total_artists || 0),
        total_listeners: Number(userStats.total_listeners || 0),
        active_users: Number(userStats.active_users || 0),
        disabled_users: Number(userStats.disabled_users || 0),

        total_tracks: Number(trackStats.total_tracks || 0),
        published_tracks: Number(trackStats.published_tracks || 0),
        hidden_tracks: Number(trackStats.hidden_tracks || 0),
        total_plays: Number(trackStats.total_plays || 0),
        total_downloads: Number(trackStats.total_downloads || 0),
        total_likes: Number(trackStats.total_likes || 0),

        total_comments: Number(commentStats.total_comments || 0),

        total_playlists: Number(playlistStats.total_playlists || 0),
        public_playlists: Number(playlistStats.public_playlists || 0),
        private_playlists: Number(playlistStats.private_playlists || 0),
      },
      recentUsers,
      recentTracks,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading admin stats.',
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading users.',
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be disabled from here.',
      });
    }

    const newStatus = !user.is_active;

    await pool.query(
      `UPDATE users
       SET is_active = ?
       WHERE id = ?`,
      [newStatus, id]
    );

    const [updatedUsers] = await pool.query(
      `SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: newStatus
        ? 'User account approved successfully.'
        : 'User account disabled successfully.',
      user: updatedUsers[0],
    });
  } catch (error) {
    console.error('Toggle user status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating user status.',
    });
  }
};

const ensureArtistProfileExists = async (connection, userId, email) => {
  const [profiles] = await connection.query(
    `SELECT id
     FROM artist_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (profiles.length === 0) {
    const defaultDisplayName = email.split('@')[0];

    await connection.query(
      `INSERT INTO artist_profiles (user_id, display_name, country)
       VALUES (?, ?, ?)`,
      [userId, defaultDisplayName, null]
    );
  }
};

const updateUserRole = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['listener', 'artist'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be listener or artist.',
      });
    }

    const [users] = await connection.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin role cannot be changed from here.',
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET role = ?
       WHERE id = ?`,
      [role, id]
    );

    if (role === 'artist') {
      await ensureArtistProfileExists(connection, id, user.email);
    }

    await connection.commit();

    const [updatedUsers] = await connection.query(
      `SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'User role updated successfully.',
      user: updatedUsers[0],
    });
  } catch (error) {
    await connection.rollback();

    console.error('Update user role error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating user role.',
    });
  } finally {
    connection.release();
  }
};

const updateUser = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { email, role, is_active } = req.body;

    const allowedRoles = ['listener', 'artist'];

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be listener or artist.',
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Approval status must be true or false.',
      });
    }

    const [users] = await connection.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be edited from here.',
      });
    }

    const [duplicateUsers] = await connection.query(
      `SELECT id
       FROM users
       WHERE email = ?
       AND id <> ?
       LIMIT 1`,
      [email.trim(), id]
    );

    if (duplicateUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another account already uses this email.',
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET email = ?, role = ?, is_active = ?
       WHERE id = ?`,
      [email.trim(), role, is_active, id]
    );

    if (role === 'artist') {
      await ensureArtistProfileExists(connection, id, email.trim());
    }

    await connection.commit();

    const [updatedUsers] = await connection.query(
      `SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'User account updated successfully.',
      user: updatedUsers[0],
    });
  } catch (error) {
    await connection.rollback();

    console.error('Update user error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating user account.',
    });
  } finally {
    connection.release();
  }
};

const deleteUser = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    const [users] = await connection.query(
      `SELECT id, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be deleted from here.',
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM refresh_tokens
       WHERE user_id = ?`,
      [id]
    );

    await connection.query(
      `DELETE FROM users
       WHERE id = ?`,
      [id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'User account deleted successfully.',
    });
  } catch (error) {
    await connection.rollback();

    console.error('Delete user error:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message:
          'This user has related data. Disable the account instead, or add cascade delete rules to your database.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting user account.',
    });
  } finally {
    connection.release();
  }
};

const getAllTracks = async (req, res) => {
  try {
    const [tracks] = await pool.query(
      `SELECT
        t.id,
        t.artist_id,
        t.genre_id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.play_count,
        t.download_count,
        t.like_count,
        t.is_downloadable,
        t.is_published,
        t.created_at,
        t.updated_at,
        ap.display_name AS artist_name,
        u.email AS artist_email,
        g.name AS genre_name
       FROM tracks t
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN genres g ON t.genre_id = g.id
       ORDER BY t.created_at DESC`
    );

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Get all tracks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading tracks.',
    });
  }
};

const toggleTrackPublished = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      `SELECT id, title, is_published
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
    const newStatus = !track.is_published;

    await pool.query(
      `UPDATE tracks
       SET is_published = ?
       WHERE id = ?`,
      [newStatus, id]
    );

    const [updatedTracks] = await pool.query(
      `SELECT id, title, is_published
       FROM tracks
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: newStatus
        ? 'Track published successfully.'
        : 'Track hidden successfully.',
      track: updatedTracks[0],
    });
  } catch (error) {
    console.error('Toggle track published error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating track status.',
    });
  }
};

const getAllPlaylists = async (req, res) => {
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
        u.role AS owner_role,
        COUNT(pt.track_id) AS total_tracks
       FROM playlists p
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       GROUP BY
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.email,
        u.role
       ORDER BY p.created_at DESC`
    );

    return res.json({
      success: true,
      playlists,
    });
  } catch (error) {
    console.error('Get all playlists error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading playlists.',
    });
  }
};

const deletePlaylistAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [playlists] = await pool.query(
      `SELECT id, name
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

    await pool.query(
      `DELETE FROM playlists
       WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Playlist deleted successfully by admin.',
    });
  } catch (error) {
    console.error('Delete playlist as admin error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting playlist.',
    });
  }
};

module.exports = {
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
};