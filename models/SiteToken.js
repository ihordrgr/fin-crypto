const mongoose = require("mongoose")

const siteTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeposited: {
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    depositLimit: {
      type: Number,
      default: 0,
    },
    wagerRequirement: {
      type: Number,
      default: 0,
    },
    wagerCompleted: {
      type: Number,
      default: 0,
    },
    lastRoulettePlay: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Проверка возможности игры в рулетку
siteTokenSchema.methods.canPlayRoulette = function () {
  if (!this.lastRoulettePlay) return true

  const now = new Date()
  const timeDiff = now - this.lastRoulettePlay
  const cooldownTime = (process.env.GAMES_ROULETTE_COOLDOWN || 3600) * 1000

  return timeDiff >= cooldownTime
}

// Время до следующей игры в рулетку
siteTokenSchema.methods.getTimeUntilNextRoulette = function () {
  if (!this.lastRoulettePlay) return 0

  const now = new Date()
  const timeDiff = now - this.lastRoulettePlay
  const cooldownTime = (process.env.GAMES_ROULETTE_COOLDOWN || 3600) * 1000

  return Math.max(0, cooldownTime - timeDiff)
}

// Проверка возможности вывода средств
siteTokenSchema.methods.canWithdraw = function () {
  return this.wagerCompleted >= this.wagerRequirement
}

// Расчет доступной суммы для вывода
siteTokenSchema.methods.getWithdrawableAmount = function () {
  if (!this.canWithdraw()) return 0
  return this.balance
}

module.exports = mongoose.model("SiteToken", siteTokenSchema)
