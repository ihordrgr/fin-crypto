const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bchAddress: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    lastClaim: {
      type: Date,
      default: null,
    },
    claimCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ipAddress: String,
    userAgent: String,
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    achievements: [
      {
        name: String,
        achievedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Генерация реферального кода перед сохранением
userSchema.pre("save", async function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase()
  }

  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Сравнение пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Расчет уровня на основе опыта
userSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.experience / 1000) + 1
  return this.level
}

// Проверка возможности клейма
userSchema.methods.canClaim = function () {
  if (!this.lastClaim) return true

  const now = new Date()
  const timeDiff = now - this.lastClaim
  const cooldownTime = (process.env.FAUCET_COOLDOWN || 300) * 1000 // в миллисекундах

  return timeDiff >= cooldownTime
}

// Время до следующего клейма
userSchema.methods.getTimeUntilNextClaim = function () {
  if (!this.lastClaim) return 0

  const now = new Date()
  const timeDiff = now - this.lastClaim
  const cooldownTime = (process.env.FAUCET_COOLDOWN || 300) * 1000

  return Math.max(0, cooldownTime - timeDiff)
}

module.exports = mongoose.model("User", userSchema)
