const Bot = require("../models/Bot")
const cron = require("node-cron")

class BotMonitoring {
  constructor() {
    this.startMonitoring()
  }

  startMonitoring() {
    // Сброс дневной статистики каждый день в полночь
    cron.schedule("0 0 * * *", async () => {
      await this.resetDailyStats()
    })

    // Сброс месячной статистики каждый месяц
    cron.schedule("0 0 1 * *", async () => {
      await this.resetMonthlyStats()
    })

    // Мониторинг каждые 5 минут
    cron.schedule("*/5 * * * *", async () => {
      await this.monitorBots()
    })

    console.log("🤖 Bot monitoring started")
  }

  async resetDailyStats() {
    try {
      await Bot.updateMany({}, { "stats.todayRequests": 0, "monetization.dailyRevenue": 0 })
      console.log("📊 Daily bot stats reset")
    } catch (error) {
      console.error("Error resetting daily stats:", error)
    }
  }

  async resetMonthlyStats() {
    try {
      await Bot.updateMany({}, { "monetization.monthlyRevenue": 0 })
      console.log("📊 Monthly bot stats reset")
    } catch (error) {
      console.error("Error resetting monthly stats:", error)
    }
  }

  async monitorBots() {
    try {
      const bots = await Bot.find({ isActive: true })

      for (const bot of bots) {
        // Проверяем активность бота
        const lastActivity = bot.stats.lastActivity
        const now = new Date()
        const inactiveTime = now - lastActivity

        // Если бот неактивен более 1 часа, помечаем как неактивный
        if (inactiveTime > 3600000 && bot.status === "active") {
          bot.status = "paused"
          await bot.save()
          console.log(`⏸️ Bot ${bot.name} paused due to inactivity`)
        }

        // Проверяем лимиты и сбрасываем если нужно
        const minutesPassed = (now - bot.rateLimits.lastMinuteReset) / 60000
        if (minutesPassed >= 1) {
          bot.rateLimits.requestsThisMinute = 0
          bot.rateLimits.lastMinuteReset = now
        }

        const hoursPassed = (now - bot.rateLimits.lastHourReset) / 3600000
        if (hoursPassed >= 1) {
          bot.rateLimits.requestsThisHour = 0
          bot.rateLimits.lastHourReset = now
        }

        await bot.save()
      }
    } catch (error) {
      console.error("Bot monitoring error:", error)
    }
  }

  async getBotStats() {
    try {
      const totalBots = await Bot.countDocuments()
      const activeBots = await Bot.countDocuments({ status: "active" })
      const totalRequests = await Bot.aggregate([{ $group: { _id: null, total: { $sum: "$stats.totalRequests" } } }])

      const totalEarnings = await Bot.aggregate([{ $group: { _id: null, total: { $sum: "$stats.earnings" } } }])

      const dailyRevenue = await Bot.aggregate([
        { $group: { _id: null, total: { $sum: "$monetization.dailyRevenue" } } },
      ])

      return {
        totalBots,
        activeBots,
        totalRequests: totalRequests[0]?.total || 0,
        totalEarnings: totalEarnings[0]?.total || 0,
        dailyRevenue: dailyRevenue[0]?.total || 0,
      }
    } catch (error) {
      console.error("Error getting bot stats:", error)
      return null
    }
  }
}

module.exports = new BotMonitoring()
