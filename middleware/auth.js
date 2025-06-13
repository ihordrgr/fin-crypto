const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Доступ запрещен. Токен не предоставлен.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Недействительный токен или пользователь неактивен",
      })
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Недействительный токен",
    })
  }
}

module.exports = auth
