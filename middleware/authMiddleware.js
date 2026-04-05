// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * verifyToken — attaches decoded user to req.user
 * The JWT payload has { id, isAdmin } where isAdmin
 * is true for both old (isAdmin:true) and new (role:"admin") accounts.
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res.status(401).json({ message: "Access denied: no token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token)
    return res.status(401).json({ message: "Access denied: token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, isAdmin }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * protect — alias for verifyToken (used in some route files)
 */
exports.protect = exports.verifyToken;

/**
 * isAdmin — must come AFTER verifyToken
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Admin access required" });
  next();
};