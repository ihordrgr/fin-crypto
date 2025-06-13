const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["visit", "social", "survey", "video", "custom"],
      required: true,
    },
    url: String,
    duration: Number, // in seconds
    isActive: {
      type: Boolean,
      default: true,
    },
    completions: {
      type: Number,
      default: 0,
    },
    maxCompletions: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    requiredLevel: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Task", taskSchema)
