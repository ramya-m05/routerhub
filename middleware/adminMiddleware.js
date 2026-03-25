exports.isAdmin = (req, res, next) => {
  // verifyToken must run before this
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};