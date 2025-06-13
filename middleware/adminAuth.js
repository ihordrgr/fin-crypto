const jwt = require("jsonwebtoken")
const User = require("../models/User")

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }
}

module.exports = adminAuth
