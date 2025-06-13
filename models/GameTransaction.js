const mongoose = require("mongoose")

const gameTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      enum: ["roulette", "slots", "dice", "blackjack", "crash"],
      required: true,
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    winAmount: {
      type: Number,
      default: 0,
    },
    multiplier: {
      type: Number,
      default: 0,
    },
    bet: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isWin: {
      type: Boolean,
      default: false,
    },
    wagerContribution: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("GameTransaction", gameTransactionSchema)
