const mongoose = require("mongoose")

const botSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["traffic", "clicks", "views", "social", "custom"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "stopped", "maintenance"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    config: {
      maxRequestsPerMinute: {
        type: Number,
        default: 60,
      },
      maxRequestsPerHour: {
        type: Number,
        default: 1000,
      },
      allowedIPs: [String],
      userAgents: [String],
      targetUrls: [String],
    },
    stats: {
      totalRequests: {
        type: Number,
        default: 0,
      },
      todayRequests: {
        type: Number,
        default: 0,
      },
      successfulRequests: {
        type: Number,
        default: 0,
      },
      failedRequests: {
        type: Number,
        default: 0,
      },
      lastActivity: Date,
      earnings: {
        type: Number,
        default: 0,
      },
    },
    rateLimits: {
      requestsThisMinute: {
        type: Number,
        default: 0,
      },
      requestsThisHour: {
        type: Number,
        default: 0,
      },
      lastMinuteReset: {
        type: Date,
        default: Date.now,
      },
      lastHourReset: {
        type: Date,
        default: Date.now,
      },
    },
    monetization: {
      revenuePerRequest: {
        type: Number,
        default: 0.001, // $0.001 per request
      },
      dailyRevenue: {
        type: Number,
        default: 0,
      },
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
      lastRevenueReset: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
botSchema.index({ apiKey: 1 })
botSchema.index({ status: 1 })
botSchema.index({ "stats.lastActivity": 1 })

// Methods
botSchema.methods.checkRateLimit = function () {
  const now = new Date()

  // Reset minute counter
  if (now - this.rateLimits.lastMinuteReset > 60000) {
    this.rateLimits.requestsThisMinute = 0
    this.rateLimits.lastMinuteReset = now
  }

  // Reset hour counter
  if (now - this.rateLimits.lastHourReset > 3600000) {
    this.rateLimits.requestsThisHour = 0
    this.rateLimits.lastHourReset = now
  }

  // Check limits
  if (this.rateLimits.requestsThisMinute >= this.config.maxRequestsPerMinute) {
    return { allowed: false, reason: "Minute limit exceeded" }
  }

  if (this.rateLimits.requestsThisHour >= this.config.maxRequestsPerHour) {
    return { allowed: false, reason: "Hour limit exceeded" }
  }

  return { allowed: true }
}

botSchema.methods.recordRequest = function (success = true) {
  this.stats.totalRequests += 1
  this.stats.todayRequests += 1
  this.rateLimits.requestsThisMinute += 1
  this.rateLimits.requestsThisHour += 1
  this.stats.lastActivity = new Date()

  if (success) {
    this.stats.successfulRequests += 1
    // Add revenue
    this.stats.earnings += this.monetization.revenuePerRequest
    this.monetization.dailyRevenue += this.monetization.revenuePerRequest
  } else {
    this.stats.failedRequests += 1
  }
}

module.exports = mongoose.model("Bot", botSchema)
