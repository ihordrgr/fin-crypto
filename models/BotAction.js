const mongoose = require("mongoose")

const botActionSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "click",
        "mouse_move",
        "key_press",
        "scroll",
        "type_text",
        "wait",
        "navigate",
        "form_fill",
        "captcha_solve",
        "human_behavior",
      ],
      required: true,
    },
    target: {
      selector: String, // CSS selector
      coordinates: {
        x: Number,
        y: Number,
      },
      url: String,
    },
    parameters: {
      text: String, // For typing
      key: String, // For key press
      duration: Number, // For wait/animation
      scrollAmount: Number,
      humanLike: {
        type: Boolean,
        default: true,
      },
      randomDelay: {
        min: { type: Number, default: 100 },
        max: { type: Number, default: 2000 },
      },
    },
    status: {
      type: String,
      enum: ["pending", "executing", "completed", "failed"],
      default: "pending",
    },
    executionTime: Date,
    result: {
      success: Boolean,
      message: String,
      screenshot: String, // Base64 screenshot
      data: mongoose.Schema.Types.Mixed,
    },
    humanBehavior: {
      mousePattern: String, // "natural", "jittery", "smooth"
      typingSpeed: Number, // WPM
      pauseBetweenActions: Number, // ms
      errorRate: Number, // 0-1 (probability of typos)
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("BotAction", botActionSchema)
