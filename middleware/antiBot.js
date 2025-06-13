const rateLimit = require("express-rate-limit")

// Защита от ботов пользователей
const antiBotMiddleware = (req, res, next) => {
  const userAgent = req.get("User-Agent") || ""
  const ip = req.ip || req.connection.remoteAddress

  // Список подозрительных User-Agent'ов
  const suspiciousUAs = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "curl",
    "wget",
    "python",
    "requests",
    "selenium",
    "phantomjs",
    "headless",
  ]

  // Проверяем User-Agent
  const isSuspicious = suspiciousUAs.some((ua) => userAgent.toLowerCase().includes(ua.toLowerCase()))

  if (isSuspicious) {
    return res.status(403).json({
      success: false,
      message: "Automated requests are not allowed",
      code: "BOT_DETECTED",
    })
  }

  // Проверяем отсутствие важных заголовков
  const hasAccept = req.get("Accept")
  const hasAcceptLanguage = req.get("Accept-Language")
  const hasAcceptEncoding = req.get("Accept-Encoding")

  if (!hasAccept || !hasAcceptLanguage || !hasAcceptEncoding) {
    return res.status(403).json({
      success: false,
      message: "Invalid request headers",
      code: "INVALID_HEADERS",
    })
  }

  next()
}

// Rate limiting для пользователей
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP",
    code: "RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  antiBotMiddleware,
  userRateLimit,
}
