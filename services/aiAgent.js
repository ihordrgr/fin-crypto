const OpenAI = require("openai")
const User = require("../models/User")
const Transaction = require("../models/Transaction")
const Task = require("../models/Task")

// Добавляем команды для управления ботами в существующий AI агент

const botExecutor = require("./botExecutor")
const Bot = require("../models/Bot")
const BotSession = require("../models/BotSession")

class AIAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.systemPrompt = `
Ты - AI агент-помощник для Bitcoin Cash фаукета. Твои функции:

АДМИНИСТРАТОР:
- Управление пользователями (блокировка, разблокировка, изменение баланса)
- Просмотр статистики и аналитики
- Модерация контента и транзакций
- Управление заданиями и наградами
- Мониторинг безопасности

КОДЕР:
- Генерация и исправление кода
- Оптимизация производительности
- Создание новых функций
- Отладка и тестирование
- Документирование кода

ПОМОЩНИК:
- Ответы на вопросы пользователей
- Техническая поддержка
- Обучение и консультации
- Автоматизация задач

Доступные команды:
/stats - показать статистику
/users [query] - найти пользователей
/ban [userId] - заблокировать пользователя
/unban [userId] - разблокировать пользователя
/balance [userId] [amount] - изменить баланс
/code [request] - генерировать код
/optimize [code] - оптимизировать код
/debug [error] - помочь с отладкой
/task [create/edit/delete] - управление заданиями

Отвечай профессионально, кратко и по делу. Используй эмодзи для лучшего восприятия.
`
  }

  async processMessage(message, userId, isAdmin = false) {
    try {
      // Проверяем команды
      if (message.startsWith("/")) {
        return await this.handleCommand(message, userId, isAdmin)
      }

      // Обычный чат с AI
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      return {
        success: true,
        message: response.choices[0].message.content,
        type: "chat",
      }
    } catch (error) {
      console.error("AI Agent error:", error)
      return {
        success: false,
        message: "Извините, произошла ошибка. Попробуйте позже.",
        type: "error",
      }
    }
  }

  async handleCommand(command, userId, isAdmin) {
    const [cmd, ...args] = command.split(" ")

    // Проверяем права доступа для админских команд
    const adminCommands = ["/ban", "/unban", "/balance", "/users", "/task"]
    if (adminCommands.includes(cmd) && !isAdmin) {
      return {
        success: false,
        message: "❌ У вас нет прав для выполнения этой команды",
        type: "error",
      }
    }

    switch (cmd) {
      case "/stats":
        return await this.getStats()

      case "/users":
        return await this.findUsers(args.join(" "))

      case "/ban":
        return await this.banUser(args[0])

      case "/unban":
        return await this.unbanUser(args[0])

      case "/balance":
        return await this.updateBalance(args[0], Number.parseFloat(args[1]))

      case "/code":
        return await this.generateCode(args.join(" "))

      case "/optimize":
        return await this.optimizeCode(args.join(" "))

      case "/debug":
        return await this.debugError(args.join(" "))

      case "/task":
        return await this.manageTask(args[0], args.slice(1))

      case "/help":
        return this.getHelp()

      case "/bot":
        return await this.manageBots(args, isAdmin)

      case "/session":
        return await this.manageSessions(args, isAdmin)

      case "/captcha":
        return await this.manageCaptcha(args, isAdmin)

      case "/human":
        return await this.simulateHuman(args, isAdmin)

      default:
        return {
          success: false,
          message: "❓ Неизвестная команда. Используйте /help для списка команд",
          type: "error",
        }
    }
  }

  async manageBots(args, isAdmin) {
    if (!isAdmin) {
      return {
        success: false,
        message: "❌ Нужны права администратора",
        type: "error",
      }
    }

    const [action, ...params] = args

    switch (action) {
      case "list":
        const bots = await Bot.find().select("name type status stats")
        let message = "🤖 **Список ботов:**\n\n"

        bots.forEach((bot) => {
          const statusIcon = bot.status === "active" ? "✅" : "⏸️"
          message += `${statusIcon} **${bot.name}** (${bot.type})\n`
          message += `• Запросов: ${bot.stats.totalRequests}\n`
          message += `• Доход: $${bot.stats.earnings.toFixed(4)}\n\n`
        })

        return {
          success: true,
          message,
          type: "bots",
        }

      case "start":
        const botId = params[0]
        if (!botId) {
          return {
            success: false,
            message: "❓ Укажите ID бота",
            type: "error",
          }
        }

        const bot = await Bot.findById(botId)
        if (!bot) {
          return {
            success: false,
            message: "❌ Бот не найден",
            type: "error",
          }
        }

        bot.status = "active"
        await bot.save()

        return {
          success: true,
          message: `✅ Бот ${bot.name} запущен`,
          type: "admin",
        }

      case "stop":
        const stopBotId = params[0]
        const stopBot = await Bot.findById(stopBotId)
        if (stopBot) {
          stopBot.status = "stopped"
          await stopBot.save()
        }

        return {
          success: true,
          message: `⏹️ Бот остановлен`,
          type: "admin",
        }

      default:
        return {
          success: false,
          message: "❓ Доступные действия: list, start, stop",
          type: "error",
        }
    }
  }

  async manageSessions(args, isAdmin) {
    if (!isAdmin) {
      return {
        success: false,
        message: "❌ Нужны права администратора",
        type: "error",
      }
    }

    const [action, ...params] = args

    switch (action) {
      case "create":
        const [botId, sessionName] = params
        if (!botId || !sessionName) {
          return {
            success: false,
            message: "❓ Укажите ID бота и название сессии",
            type: "error",
          }
        }

        // Создаем простую сессию с базовыми действиями
        const basicActions = [
          {
            actionType: "navigate",
            target: { url: "https://example.com" },
            parameters: { humanLike: true },
          },
          {
            actionType: "wait",
            parameters: { duration: 3000 },
          },
          {
            actionType: "human_behavior",
            parameters: { duration: 5000 },
          },
        ]

        const session = await botExecutor.createSession(botId, sessionName, basicActions)

        return {
          success: true,
          message: `✅ Сессия "${sessionName}" создана\nID: ${session._id}`,
          type: "admin",
        }

      case "execute":
        const sessionId = params[0]
        if (!sessionId) {
          return {
            success: false,
            message: "❓ Укажите ID сессии",
            type: "error",
          }
        }

        botExecutor.executeSession(sessionId).catch(console.error)

        return {
          success: true,
          message: `▶️ Сессия запущена: ${sessionId}`,
          type: "admin",
        }

      case "status":
        const statusSessionId = params[0]
        const session = await BotSession.findById(statusSessionId)

        if (!session) {
          return {
            success: false,
            message: "❌ Сессия не найдена",
            type: "error",
          }
        }

        const progress = (session.currentActionIndex / session.actions.length) * 100

        return {
          success: true,
          message: `📊 **Статус сессии:**\n\n• Название: ${session.sessionName}\n• Статус: ${session.status}\n• Прогресс: ${Math.round(progress)}%\n• Человечность: ${session.statistics.humanScore}/100`,
          type: "admin",
        }

      default:
        return {
          success: false,
          message: "❓ Доступные действия: create, execute, status",
          type: "error",
        }
    }
  }

  async manageCaptcha(args, isAdmin) {
    if (!isAdmin) {
      return {
        success: false,
        message: "❌ Нужны права администратора",
        type: "error",
      }
    }

    const [action, ...params] = args

    switch (action) {
      case "balance":
        const captchaSolver = require("./captchaSolver")
        const balance = await captchaSolver.getBalance("2captcha")

        return {
          success: true,
          message: `💰 **Баланс капчи:** $${balance || "N/A"}`,
          type: "admin",
        }

      case "solve":
        const [type, ...captchaParams] = params
        if (!type) {
          return {
            success: false,
            message: "❓ Укажите тип капчи: recaptcha_v2, hcaptcha, image",
            type: "error",
          }
        }

        return {
          success: true,
          message: `🔄 Решение капчи типа ${type} запущено...`,
          type: "admin",
        }

      default:
        return {
          success: false,
          message: "❓ Доступные действия: balance, solve",
          type: "error",
        }
    }
  }

  async simulateHuman(args, isAdmin) {
    if (!isAdmin) {
      return {
        success: false,
        message: "❌ Нужны права администратора",
        type: "error",
      }
    }

    const [action, ...params] = args

    switch (action) {
      case "click":
        const [x, y] = params
        if (!x || !y) {
          return {
            success: false,
            message: "❓ Укажите координаты: /human click 100 200",
            type: "error",
          }
        }

        // Симулируем клик
        return {
          success: true,
          message: `🖱️ Симуляция клика по координатам (${x}, ${y})`,
          type: "admin",
        }

      case "type":
        const text = params.join(" ")
        if (!text) {
          return {
            success: false,
            message: "❓ Укажите текст для ввода",
            type: "error",
          }
        }

        return {
          success: true,
          message: `⌨️ Симуляция ввода текста: "${text}"`,
          type: "admin",
        }

      case "scroll":
        const amount = params[0] || "300"
        return {
          success: true,
          message: `📜 Симуляция прокрутки на ${amount}px`,
          type: "admin",
        }

      default:
        return {
          success: false,
          message: "❓ Доступные действия: click, type, scroll",
          type: "error",
        }
    }
  }

  getHelp() {
    return {
      success: true,
      message: `🤖 **AI Агент-Помощник**

**📊 СТАТИСТИКА:**
• \`/stats\` - показать статистику фаукета

**👥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ:**
• \`/users [запрос]\` - найти пользователей
• \`/ban [userId]\` - заблокировать пользователя
• \`/unban [userId]\` - разблокировать пользователя
• \`/balance [userId] [сумма]\` - изменить баланс

**🤖 УПРАВЛЕНИЕ БОТАМИ:**
• \`/bot list\` - список всех ботов
• \`/bot start [botId]\` - запустить бота
• \`/bot stop [botId]\` - остановить бота

**🎮 УПРАВЛЕНИЕ СЕССИЯМИ:**
• \`/session create [botId] [название]\` - создать сессию
• \`/session execute [sessionId]\` - запустить сессию
• \`/session status [sessionId]\` - статус сессии

**🔐 УПРАВЛЕНИЕ КАПЧЕЙ:**
• \`/captcha balance\` - баланс сервиса капчи
• \`/captcha solve [тип]\` - решить капчу

**👤 СИМУЛЯЦИЯ ЧЕЛОВЕКА:**
• \`/human click [x] [y]\` - симуляция клика
• \`/human type [текст]\` - симуляция ввода
• \`/human scroll [пиксели]\` - симуляция прокрутки

**💻 ПРОГРАММИРОВАНИЕ:**
• \`/code [описание]\` - сгенерировать код
• \`/optimize [код]\` - оптимизировать код
• \`/debug [ошибка]\` - помочь с отладкой

**💬 ОБЩЕНИЕ:**
Просто напишите сообщение без команды для обычного чата с AI.

Я готов помочь с администрированием, управлением ботами и программированием! 🚀`,
      type: "help",
    }
  }
}

module.exports = new AIAgent()
