const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, role, display_name, country } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const allowedRoles = ['listener', 'artist'];
    const selectedRole = allowedRoles.includes(role) ? role : 'listener';

    if (selectedRole === 'artist' && !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Artist display name is required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?)`,
        [email, passwordHash, selectedRole, false]
      );

      const userId = userResult.insertId;

      if (selectedRole === 'artist') {
        await connection.query(
          `INSERT INTO artist_profiles (user_id, display_name, country)
           VALUES (?, ?, ?)`,
          [userId, display_name, country || null]
        );
      }

      await connection.commit();

      return res.status(201).json({
        success: true,
        message:
          'Account created successfully. Please wait for admin approval before logging in.',
        user: {
          id: userId,
          email,
          role: selectedRole,
          is_active: false,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const [users] = await pool.query(
      `SELECT id, email, password_hash, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          'Your account is waiting for admin approval. You will be able to login once your account is approved.',
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    };

    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken]
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    const [users] = await pool.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please wait for admin approval.',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Me error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while loading user.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  me,
};