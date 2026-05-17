const pool = require('../config/db');

const getAllArtists = async (req, res) => {
  try {
    const [artists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at AS created_at,
        u.email,
        COUNT(DISTINCT af.user_id) AS follower_count,
        COUNT(DISTINCT t.id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.download_count), 0) AS total_downloads,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM artist_profiles ap
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN artist_followers af ON ap.id = af.artist_id
       LEFT JOIN tracks t
        ON ap.id = t.artist_id
        AND t.is_published = TRUE
       WHERE u.role = 'artist'
        AND u.is_active = TRUE
       GROUP BY
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at,
        u.email
       ORDER BY u.created_at DESC`
    );

    return res.json({
      success: true,
      artists,
    });
  } catch (error) {
    console.error('Get all artists error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading artists.',
      error: error.message,
    });
  }
};

const getMyArtistProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [artists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at AS created_at,
        u.email,
        COUNT(DISTINCT af.user_id) AS follower_count,
        COUNT(DISTINCT t.id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.download_count), 0) AS total_downloads,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM artist_profiles ap
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN artist_followers af ON ap.id = af.artist_id
       LEFT JOIN tracks t
        ON ap.id = t.artist_id
       WHERE ap.user_id = ?
        AND u.role = 'artist'
       GROUP BY
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at,
        u.email
       LIMIT 1`,
      [userId]
    );

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found.',
      });
    }

    return res.json({
      success: true,
      artist: artists[0],
    });
  } catch (error) {
    console.error('Get my artist profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading artist profile.',
      error: error.message,
    });
  }
};

const getArtistProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [artists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at AS created_at,
        u.email,
        COUNT(DISTINCT af.user_id) AS follower_count,
        COUNT(DISTINCT t.id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.download_count), 0) AS total_downloads,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM artist_profiles ap
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN artist_followers af ON ap.id = af.artist_id
       LEFT JOIN tracks t
        ON ap.id = t.artist_id
        AND t.is_published = TRUE
       WHERE ap.id = ?
        AND u.role = 'artist'
        AND u.is_active = TRUE
       GROUP BY
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at,
        u.email
       LIMIT 1`,
      [id]
    );

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found.',
      });
    }

    return res.json({
      success: true,
      artist: artists[0],
    });
  } catch (error) {
    console.error('Get artist profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading artist profile.',
      error: error.message,
    });
  }
};

const getArtistTracks = async (req, res) => {
  try {
    const { id } = req.params;

    const [tracks] = await pool.query(
      `SELECT
        t.id,
        t.artist_id,
        t.genre_id,
        t.title,
        t.lyrics,
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
        g.name AS genre_name
       FROM tracks t
       INNER JOIN artist_profiles ap ON t.artist_id = ap.id
       LEFT JOIN genres g ON t.genre_id = g.id
       INNER JOIN users u ON ap.user_id = u.id
       WHERE t.artist_id = ?
        AND t.is_published = TRUE
        AND u.is_active = TRUE
       ORDER BY t.created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.error('Get artist tracks error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading artist tracks.',
      error: error.message,
    });
  }
};

const updateArtistProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, bio, country } = req.body;

    if (!display_name || !display_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Display name is required.',
      });
    }

    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [artists] = await pool.query(
      `SELECT
        id,
        avatar_url
       FROM artist_profiles
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found.',
      });
    }

    const artist = artists[0];

    if (avatarUrl) {
      await pool.query(
        `UPDATE artist_profiles
         SET display_name = ?,
             bio = ?,
             country = ?,
             avatar_url = ?
         WHERE user_id = ?`,
        [display_name.trim(), bio || null, country || null, avatarUrl, userId]
      );
    } else {
      await pool.query(
        `UPDATE artist_profiles
         SET display_name = ?,
             bio = ?,
             country = ?
         WHERE user_id = ?`,
        [display_name.trim(), bio || null, country || null, userId]
      );
    }

    const [updatedArtists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at AS created_at,
        u.email,
        COUNT(DISTINCT af.user_id) AS follower_count,
        COUNT(DISTINCT t.id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.download_count), 0) AS total_downloads,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM artist_profiles ap
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN artist_followers af ON ap.id = af.artist_id
       LEFT JOIN tracks t ON ap.id = t.artist_id
       WHERE ap.id = ?
       GROUP BY
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at,
        u.email
       LIMIT 1`,
      [artist.id]
    );

    return res.json({
      success: true,
      message: 'Artist profile updated successfully.',
      artist: updatedArtists[0],
    });
  } catch (error) {
    console.error('Update artist profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating artist profile.',
      error: error.message,
    });
  }
};

const followArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const listenerUserId = req.user.id;

    const [artists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id
       FROM artist_profiles ap
       INNER JOIN users u ON ap.user_id = u.id
       WHERE ap.id = ?
        AND u.role = 'artist'
        AND u.is_active = TRUE
       LIMIT 1`,
      [id]
    );

    if (artists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found.',
      });
    }

    const artist = artists[0];

    if (Number(artist.user_id) === Number(listenerUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow your own artist profile.',
      });
    }

    const [existingFollow] = await pool.query(
      `SELECT
        artist_id,
        user_id
       FROM artist_followers
       WHERE artist_id = ?
        AND user_id = ?
       LIMIT 1`,
      [id, listenerUserId]
    );

    if (existingFollow.length > 0) {
      await pool.query(
        `DELETE FROM artist_followers
         WHERE artist_id = ?
          AND user_id = ?`,
        [id, listenerUserId]
      );

      const [[countResult]] = await pool.query(
        `SELECT COUNT(*) AS follower_count
         FROM artist_followers
         WHERE artist_id = ?`,
        [id]
      );

      return res.json({
        success: true,
        following: false,
        message: 'Artist unfollowed successfully.',
        artist: {
          id: Number(id),
          follower_count: Number(countResult.follower_count || 0),
        },
      });
    }

    await pool.query(
      `INSERT INTO artist_followers (artist_id, user_id)
       VALUES (?, ?)`,
      [id, listenerUserId]
    );

    const [[countResult]] = await pool.query(
      `SELECT COUNT(*) AS follower_count
       FROM artist_followers
       WHERE artist_id = ?`,
      [id]
    );

    return res.json({
      success: true,
      following: true,
      message: 'Artist followed successfully.',
      artist: {
        id: Number(id),
        follower_count: Number(countResult.follower_count || 0),
      },
    });
  } catch (error) {
    console.error('Follow artist error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating follow status.',
      error: error.message,
    });
  }
};

const getFollowingArtists = async (req, res) => {
  try {
    const userId = req.user.id;

    const [artists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at AS created_at,
        u.email,
        COUNT(DISTINCT af2.user_id) AS follower_count,
        COUNT(DISTINCT t.id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.download_count), 0) AS total_downloads,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM artist_followers af
       INNER JOIN artist_profiles ap ON af.artist_id = ap.id
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN artist_followers af2 ON ap.id = af2.artist_id
       LEFT JOIN tracks t
        ON ap.id = t.artist_id
        AND t.is_published = TRUE
       WHERE af.user_id = ?
        AND u.role = 'artist'
        AND u.is_active = TRUE
       GROUP BY
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.created_at,
        u.email
       ORDER BY u.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      artists,
    });
  } catch (error) {
    console.error('Get following artists error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading followed artists.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllArtists,
  getMyArtistProfile,
  getArtistProfile,
  getArtistTracks,
  updateArtistProfile,
  followArtist,
  getFollowingArtists,
};