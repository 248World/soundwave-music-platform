const pool = require('../config/db');

const getHomeDiscovery = async (req, res) => {
  try {
    const [topArtists] = await pool.query(
      `SELECT
        ap.id,
        ap.user_id,
        ap.display_name,
        ap.bio,
        ap.avatar_url,
        ap.country,
        u.email,
        u.created_at AS created_at,
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
        u.email,
        u.created_at
       ORDER BY follower_count DESC, total_plays DESC, total_tracks DESC
       LIMIT 6`
    );

    const [popularPlaylists] = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_public,
        p.created_at,
        p.updated_at,
        u.email AS owner_email,
        COUNT(DISTINCT pt.track_id) AS total_tracks,
        COALESCE(SUM(t.play_count), 0) AS total_plays,
        COALESCE(SUM(t.like_count), 0) AS total_likes
       FROM playlists p
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       LEFT JOIN tracks t
        ON pt.track_id = t.id
        AND t.is_published = TRUE
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
       ORDER BY total_tracks DESC, total_plays DESC, p.created_at DESC
       LIMIT 6`
    );

    const [mostPlayedTracks] = await pool.query(
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
       INNER JOIN users u ON ap.user_id = u.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.is_published = TRUE
        AND u.is_active = TRUE
       ORDER BY t.play_count DESC, t.like_count DESC, t.created_at DESC
       LIMIT 6`
    );

    return res.json({
      success: true,
      topArtists,
      popularPlaylists,
      mostPlayedTracks,
    });
  } catch (error) {
    console.error('Get home discovery error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading home discovery.',
      error: error.message,
    });
  }
};

module.exports = {
  getHomeDiscovery,
};