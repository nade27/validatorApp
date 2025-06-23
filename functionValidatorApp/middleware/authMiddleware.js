const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user found on request');
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      console.log('User role not authorized:', req.user.role);
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
