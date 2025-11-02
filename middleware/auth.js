const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function authMiddleware(req, res, next) {
  // Ambil token dari cookie
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // bisa dipakai di route
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
}

module.exports = authMiddleware;
