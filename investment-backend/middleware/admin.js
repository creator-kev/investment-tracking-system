// middleware/admin.js
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = adminAuth;