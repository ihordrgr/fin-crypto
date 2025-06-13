const mongoose = require("mongoose")

const botSessionSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    sessionName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["idle", "running", "paused", "completed", "error"],
      default: "idle",
    },
    actions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BotAction",
      },
    ],
    currentActionIndex: {
      type: Number,
      default: 0,
    },
    browserConfig: {
      userAgent: String,
      viewport: {
        width: { type: Number, default: 1920 },
        height: { type: Number, default: 1080 },
      },
      headless: { type: Boolean, default: true },
      proxy: String,
      cookies: [mongoose.Schema.Types.Mixed],
    },
    humanProfile: {
      name: String,
      age: Number,
      interests: [String],
      behaviorPattern: {
        type: String,
        enum: ["cautious", "normal", "aggressive", "random"],
        default: "normal",
      },
      sessionDuration: Number, // minutes
      breakFrequency: Number, // actions before break
    },
    statistics: {
      actionsCompleted: { type: Number, default: 0 },
      actionsFailed: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
      humanScore: { type: Number, default: 0 }, // 0-100 how human-like
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("BotSession", botSessionSchema)
