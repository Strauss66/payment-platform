const jwt = require("jsonwebtoken");

// Middleware to authenticate user via JWT
function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
      return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  // ✅ Allow test token for development
  if (token === "test-token-12345") {
      req.user = { email: "admin@test.com", role: "admin" }; // Simulate user
      return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });

      req.user = user;
      next();
  });
}
// Middleware to authorize specific roles
function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Access denied." });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };