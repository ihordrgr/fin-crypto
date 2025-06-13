const User = require("../models/User")
const SiteToken = require("../models/SiteToken")
const GameTransaction = require("../models/GameTransaction")
const mongoose = require("mongoose")

class GameService {
  constructor() {
    this.maxWinMultiplier = Number.parseFloat(process.env.GAMES_MAX_WIN_MULTIPLIER) || 1.0
  }

  // Получить или создать токены пользователя
  async getUserTokens(userId) {
    let userTokens = await SiteToken.findOne({ userId })

    if (!userTokens) {
      userTokens = new SiteToken({ userId })
      await userTokens.save()
    }

    return userTokens
  }

  // Депозит токенов
  async depositTokens(userId, amount) {
    const userTokens = await this.getUserTokens(userId)

    userTokens.balance += amount
    userTokens.totalDeposited += amount
    userTokens.depositLimit = Math.max(userTokens.depositLimit, userTokens.totalDeposited)
    userTokens.wagerRequirement = userTokens.totalDeposited * 1 // Требование отыгрыша 1x от депозита

    await userTokens.save()

    return userTokens
  }

  // Вывод токенов
  async withdrawTokens(userId, amount) {
    const userTokens = await this.getUserTokens(userId)

    if (!userTokens.canWithdraw()) {
      throw new Error("Необходимо выполнить требования по отыгрышу")
    }

    if (amount > userTokens.balance) {
      throw new Error("Недостаточно средств")
    }

    userTokens.balance -= amount
    userTokens.totalWithdrawn += amount

    await userTokens.save()

    return userTokens
  }

  // Игра в рулетку
  async playRoulette(userId, bet) {
    const userTokens = await this.getUserTokens(userId)

    // Проверка кулдауна
    if (!userTokens.canPlayRoulette()) {
      const timeLeft = userTokens.getTimeUntilNextRoulette()
      throw new Error(`Подождите ${Math.ceil(timeLeft / 60000)} минут до следующей игры`)
    }

    // Проверка баланса
    if (bet.amount > userTokens.balance) {
      throw new Error("Недостаточно средств")
    }

    // Генерация результата
    const result = this._generateRouletteResult()

    // Расчет выигрыша
    let winAmount = 0
    let isWin = false

    if (bet.type === "number" && bet.value === result.number) {
      winAmount = bet.amount * 35
      isWin = true
    } else if (bet.type === "color" && bet.value === result.color) {
      winAmount = bet.amount * 2
      isWin = true
    } else if (bet.type === "parity" && bet.value === result.parity) {
      winAmount = bet.amount * 2
      isWin = true
    } else if (bet.type === "range") {
      if (bet.value === "low" && result.number >= 1 && result.number <= 18) {
        winAmount = bet.amount * 2
        isWin = true
      } else if (bet.value === "high" && result.number >= 19 && result.number <= 36) {
        winAmount = bet.amount * 2
        isWin = true
      }
    } else if (bet.type === "dozen") {
      if (bet.value === "first" && result.number >= 1 && result.number <= 12) {
        winAmount = bet.amount * 3
        isWin = true
      } else if (bet.value === "second" && result.number >= 13 && result.number <= 24) {
        winAmount = bet.amount * 3
        isWin = true
      } else if (bet.value === "third" && result.number >= 25 && result.number <= 36) {
        winAmount = bet.amount * 3
        isWin = true
      }
    }

    // Ограничение максимального выигрыша
    const maxWin = userTokens.depositLimit * this.maxWinMultiplier
    if (winAmount > maxWin) {
      winAmount = maxWin
    }

    // Обновление баланса
    if (isWin) {
      userTokens.balance += winAmount - bet.amount
    } else {
      userTokens.balance -= bet.amount
    }

    // Обновление времени последней игры
    userTokens.lastRoulettePlay = new Date()

    // Обновление прогресса отыгрыша
    userTokens.wagerCompleted += bet.amount

    await userTokens.save()

    // Создание записи о транзакции
    const transaction = new GameTransaction({
      userId,
      gameType: "roulette",
      betAmount: bet.amount,
      winAmount: isWin ? winAmount : 0,
      multiplier: isWin ? winAmount / bet.amount : 0,
      bet,
      result,
      isWin,
      wagerContribution: bet.amount,
    })

    await transaction.save()

    return {
      result,
      winAmount: isWin ? winAmount : 0,
      isWin,
      newBalance: userTokens.balance,
      wagerProgress: {
        completed: userTokens.wagerCompleted,
        required: userTokens.wagerRequirement,
        percentage: (userTokens.wagerCompleted / userTokens.wagerRequirement) * 100,
      },
    }
  }

  // Игра в слоты
  async playSlots(userId, betAmount) {
    const userTokens = await this.getUserTokens(userId)

    // Проверка баланса
    if (betAmount > userTokens.balance) {
      throw new Error("Недостаточно средств")
    }

    // Генерация результата
    const result = this._generateSlotsResult()

    // Расчет выигрыша
    const { winAmount, multiplier, isWin } = this._calculateSlotsWin(betAmount, result)

    // Ограничение максимального выигрыша
    const maxWin = userTokens.depositLimit * this.maxWinMultiplier
    const finalWinAmount = Math.min(winAmount, maxWin)

    // Обновление баланса
    if (isWin) {
      userTokens.balance += finalWinAmount - betAmount
    } else {
      userTokens.balance -= betAmount
    }

    // Обновление прогресса отыгрыша
    userTokens.wagerCompleted += betAmount

    await userTokens.save()

    // Создание записи о транзакции
    const transaction = new GameTransaction({
      userId,
      gameType: "slots",
      betAmount,
      winAmount: isWin ? finalWinAmount : 0,
      multiplier,
      bet: { amount: betAmount },
      result,
      isWin,
      wagerContribution: betAmount,
    })

    await transaction.save()

    return {
      result,
      winAmount: isWin ? finalWinAmount : 0,
      isWin,
      newBalance: userTokens.balance,
      wagerProgress: {
        completed: userTokens.wagerCompleted,
        required: userTokens.wagerRequirement,
        percentage: (userTokens.wagerCompleted / userTokens.wagerRequirement) * 100,
      },
    }
  }

  // Генерация результата рулетки
  _generateRouletteResult() {
    const number = Math.floor(Math.random() * 37) // 0-36

    let color = "green"
    if (number !== 0) {
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      color = redNumbers.includes(number) ? "red" : "black"
    }

    const parity = number === 0 ? "zero" : number % 2 === 0 ? "even" : "odd"

    return { number, color, parity }
  }

  // Генерация результата слотов
  _generateSlotsResult() {
    const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣", "🎰"]
    const reels = 3
    const result = []

    for (let i = 0; i < reels; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length)
      result.push(symbols[randomIndex])
    }

    return result
  }

  // Расчет выигрыша в слотах
  _calculateSlotsWin(betAmount, result) {
    const [reel1, reel2, reel3] = result

    // Проверка на выигрышные комбинации
    if (reel1 === reel2 && reel2 === reel3) {
      // Все три символа совпадают
      const multipliers = {
        "🍒": 10,
        "🍋": 15,
        "🍊": 20,
        "🍇": 25,
        "🔔": 40,
        "💎": 100,
        "7️⃣": 200,
        "🎰": 500,
      }

      const multiplier = multipliers[reel1] || 10
      return {
        winAmount: betAmount * multiplier,
        multiplier,
        isWin: true,
      }
    } else if (reel1 === reel2 || reel1 === reel3 || reel2 === reel3) {
      // Два символа совпадают
      return {
        winAmount: betAmount * 2,
        multiplier: 2,
        isWin: true,
      }
    }

    // Нет выигрыша
    return {
      winAmount: 0,
      multiplier: 0,
      isWin: false,
    }
  }

  // Получить историю игр пользователя
  async getUserGameHistory(userId, gameType = null, limit = 10) {
    const query = { userId }

    if (gameType) {
      query.gameType = gameType
    }

    const history = await GameTransaction.find(query).sort({ createdAt: -1 }).limit(limit)

    return history
  }

  // Получить статистику игр пользователя
  async getUserGameStats(userId) {
    const userTokens = await this.getUserTokens(userId)

    const totalBets = await GameTransaction.countDocuments({ userId })
    const totalWagered = await GameTransaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$betAmount" } } },
    ])

    const totalWon = await GameTransaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), isWin: true } },
      { $group: { _id: null, total: { $sum: "$winAmount" } } },
    ])

    return {
      balance: userTokens.balance,
      totalDeposited: userTokens.totalDeposited,
      totalWithdrawn: userTokens.totalWithdrawn,
      wagerProgress: {
        completed: userTokens.wagerCompleted,
        required: userTokens.wagerRequirement,
        percentage: (userTokens.wagerCompleted / userTokens.wagerRequirement) * 100,
      },
      canWithdraw: userTokens.canWithdraw(),
      withdrawableAmount: userTokens.getWithdrawableAmount(),
      totalBets,
      totalWagered: totalWagered[0]?.total || 0,
      totalWon: totalWon[0]?.total || 0,
      profit: (totalWon[0]?.total || 0) - (totalWagered[0]?.total || 0),
    }
  }
}

module.exports = new GameService()
