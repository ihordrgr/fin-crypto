const Bot = require("../models/Bot")

const botAuth = async (req, res, next) => {
  try {
    const apiKey = req.header("X-Bot-API-Key") || req.query.apiKey

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Bot API key required",
        code: "NO_API_KEY",
      })
    }

    const bot = await Bot.findOne({ apiKey, isActive: true })

    if (!bot) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive bot API key",
        code: "INVALID_API_KEY",
      })
    }

    if (bot.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Bot is ${bot.status}`,
        code: "BOT_NOT_ACTIVE",
      })
    }

    // Check rate limits
    const rateLimitCheck = bot.checkRateLimit()
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.reason,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: 60, // seconds
      })
    }

    // Check IP whitelist if configured
    if (bot.config.allowedIPs && bot.config.allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress
      if (!bot.config.allowedIPs.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          message: "IP not whitelisted",
          code: "IP_NOT_ALLOWED",
        })
      }
    }

    req.bot = bot
    next()
  } catch (error) {
    console.error("Bot auth error:", error)
    res.status(500).json({
      success: false,
      message: "Bot authentication failed",
      code: "AUTH_ERROR",
    })
  }
}

module.exports = botAuth
