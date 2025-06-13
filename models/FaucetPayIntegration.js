const mongoose = require("mongoose")

const faucetPayIntegrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    faucetPayId: {
      type: String,
      required: true,
      unique: true,
    },
    faucetPayApiKey: {
      type: String,
      required: true,
    },
    faucetName: {
      type: String,
      required: true,
    },
    faucetUrl: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      enum: ["BTC", "ETH", "LTC", "DOGE", "BCH", "DASH", "DGB", "TRX", "FEY", "ZEC", "BNB", "SOL"],
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    timerMinutes: {
      type: Number,
      required: true,
      default: 5,
    },
    referralPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoPayment: {
      type: Boolean,
      default: true,
    },
    minimumPayout: {
      type: Number,
      required: true,
    },
    settings: {
      dailyLimit: Number,
      ipLimit: Number,
      countryRestrictions: [String],
      vpnBlocking: {
        type: Boolean,
        default: true,
      },
      captchaEnabled: {
        type: Boolean,
        default: true,
      },
    },
    statistics: {
      totalPayments: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      totalUsers: {
        type: Number,
        default: 0,
      },
      todayPayments: {
        type: Number,
        default: 0,
      },
      todayAmount: {
        type: Number,
        default: 0,
      },
      lastPayment: Date,
    },
    balance: {
      current: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Индексы для производительности
faucetPayIntegrationSchema.index({ userId: 1 })
faucetPayIntegrationSchema.index({ faucetPayId: 1 })
faucetPayIntegrationSchema.index({ currency: 1 })
faucetPayIntegrationSchema.index({ isActive: 1 })

// Методы
faucetPayIntegrationSchema.methods.updateBalance = async function () {
  const faucetPayService = require("../services/faucetPayService")
  const balanceResult = await faucetPayService.getBalance()

  if (balanceResult.success && balanceResult.balances[this.currency]) {
    this.balance.current = balanceResult.balances[this.currency]
    this.balance.lastUpdated = new Date()
    await this.save()
  }

  return this.balance.current
}

faucetPayIntegrationSchema.methods.canMakePayment = function (amount) {
  return this.isActive && this.balance.current >= amount
}

faucetPayIntegrationSchema.methods.recordPayment = function (amount) {
  this.statistics.totalPayments += 1
  this.statistics.totalAmount += amount
  this.statistics.todayPayments += 1
  this.statistics.todayAmount += amount
  this.statistics.lastPayment = new Date()
  this.balance.current -= amount
}

module.exports = mongoose.model("FaucetPayIntegration", faucetPayIntegrationSchema)
