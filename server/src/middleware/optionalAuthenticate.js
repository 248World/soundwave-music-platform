const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query(
      `SELECT
        id,
        email,
        role,
        is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    );

    if (users.length === 0) {
      req.user = null;
      return next();
    }

    const user = users[0];

    if (!user.is_active) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch {
    req.user = null;
    return next();
  }
};

module.exports = optionalAuthenticate;