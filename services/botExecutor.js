const BotAction = require("../models/BotAction")
const BotSession = require("../models/BotSession")
const humanBehavior = require("./humanBehavior")

class BotExecutor {
  constructor() {
    this.activeSessions = new Map()
    this.executionQueue = []
  }

  async createSession(botId, sessionName, actions, config = {}) {
    try {
      const session = new BotSession({
        botId,
        sessionName,
        browserConfig: {
          userAgent: config.userAgent || humanBehavior.generateRandomUserAgent(),
          viewport: config.viewport || { width: 1920, height: 1080 },
          headless: config.headless !== false,
          proxy: config.proxy,
        },
        humanProfile: {
          name: config.humanName || `User_${Date.now()}`,
          behaviorPattern: config.behaviorPattern || "normal",
          sessionDuration: config.sessionDuration || 60,
          breakFrequency: config.breakFrequency || 50,
        },
      })

      await session.save()

      // Create actions
      const actionDocs = []
      for (const actionData of actions) {
        const action = new BotAction({
          botId,
          ...actionData,
          humanBehavior: {
            mousePattern: config.mousePattern || "natural",
            typingSpeed: config.typingSpeed || 60,
            pauseBetweenActions: config.pauseBetweenActions || 1000,
            errorRate: config.errorRate || 0.05,
          },
        })
        await action.save()
        actionDocs.push(action._id)
      }

      session.actions = actionDocs
      await session.save()

      return session
    } catch (error) {
      console.error("Error creating bot session:", error)
      throw error
    }
  }

  async executeSession(sessionId) {
    try {
      const session = await BotSession.findById(sessionId).populate("actions")
      if (!session) {
        throw new Error("Session not found")
      }

      session.status = "running"
      await session.save()

      this.activeSessions.set(sessionId, session)

      // Execute actions sequentially
      for (let i = session.currentActionIndex; i < session.actions.length; i++) {
        const action = session.actions[i]

        // Check if session should be paused/stopped
        if (session.status !== "running") {
          break
        }

        // Execute action with human behavior
        await this.executeAction(action, session)

        // Update session progress
        session.currentActionIndex = i + 1
        session.statistics.actionsCompleted += 1
        await session.save()

        // Check for breaks
        const breakCheck = humanBehavior.shouldTakeBreak(
          session.statistics.actionsCompleted,
          session.humanProfile.breakFrequency,
        )

        if (breakCheck.shouldBreak) {
          console.log(`Bot taking a break for ${breakCheck.duration}ms`)
          await this.wait(breakCheck.duration)
        }
      }

      // Session completed
      session.status = "completed"
      session.statistics.humanScore = humanBehavior.calculateHumanScore(session)
      await session.save()

      this.activeSessions.delete(sessionId)

      return session
    } catch (error) {
      console.error("Error executing session:", error)
      const session = await BotSession.findById(sessionId)
      if (session) {
        session.status = "error"
        await session.save()
      }
      throw error
    }
  }

  async executeAction(action, session) {
    const startTime = Date.now()
    action.status = "executing"
    action.executionTime = new Date()
    await action.save()

    try {
      let result = { success: false, message: "Not implemented" }

      switch (action.actionType) {
        case "click":
          result = await this.executeClick(action, session)
          break
        case "mouse_move":
          result = await this.executeMouseMove(action, session)
          break
        case "key_press":
          result = await this.executeKeyPress(action, session)
          break
        case "type_text":
          result = await this.executeTypeText(action, session)
          break
        case "scroll":
          result = await this.executeScroll(action, session)
          break
        case "wait":
          result = await this.executeWait(action, session)
          break
        case "navigate":
          result = await this.executeNavigate(action, session)
          break
        case "human_behavior":
          result = await this.executeHumanBehavior(action, session)
          break
        default:
          result = { success: false, message: `Unknown action type: ${action.actionType}` }
      }

      action.status = result.success ? "completed" : "failed"
      action.result = result

      const duration = Date.now() - startTime
      session.statistics.totalDuration += duration

      if (!result.success) {
        session.statistics.actionsFailed += 1
      }
    } catch (error) {
      action.status = "failed"
      action.result = {
        success: false,
        message: error.message,
      }
      session.statistics.actionsFailed += 1
    }

    await action.save()
  }

  async executeClick(action, session) {
    // Simulate human-like click
    const profile = session.humanProfile.behaviorPattern

    // Add random delay before click
    const delay = humanBehavior.generateHumanDelay(action.parameters.randomDelay?.min || 100)
    await this.wait(delay)

    // Simulate mouse movement to target
    if (action.target.coordinates) {
      const mousePath = humanBehavior.generateMousePath(
        Math.random() * 1920,
        Math.random() * 1080,
        action.target.coordinates.x,
        action.target.coordinates.y,
        profile,
      )

      // Simulate mouse movement
      for (const point of mousePath) {
        await this.wait(point.delay)
      }
    }

    // Simulate click delay
    const clickDelay = humanBehavior.generateHumanDelay(500, 0.5)
    await this.wait(clickDelay)

    console.log(`Bot clicked at ${action.target.coordinates?.x}, ${action.target.coordinates?.y}`)

    return {
      success: true,
      message: "Click executed successfully",
      data: {
        coordinates: action.target.coordinates,
        delay: delay + clickDelay,
      },
    }
  }

  async executeMouseMove(action, session) {
    const profile = session.humanProfile.behaviorPattern
    const { x, y } = action.target.coordinates

    const mousePath = humanBehavior.generateMousePath(Math.random() * 1920, Math.random() * 1080, x, y, profile)

    for (const point of mousePath) {
      await this.wait(point.delay)
    }

    console.log(`Bot moved mouse to ${x}, ${y}`)

    return {
      success: true,
      message: "Mouse movement executed",
      data: { coordinates: { x, y }, pathLength: mousePath.length },
    }
  }

  async executeKeyPress(action, session) {
    const key = action.parameters.key
    const delay = humanBehavior.generateHumanDelay(100, 0.3)

    await this.wait(delay)

    console.log(`Bot pressed key: ${key}`)

    return {
      success: true,
      message: `Key '${key}' pressed`,
      data: { key, delay },
    }
  }

  async executeTypeText(action, session) {
    const text = action.parameters.text
    const profile = session.humanProfile.behaviorPattern

    const typingPattern = humanBehavior.generateTypingPattern(text, profile)

    for (const step of typingPattern) {
      await this.wait(step.delay)

      if (step.action === "type") {
        console.log(`Bot typed: ${step.text}`)
      } else if (step.action === "key") {
        console.log(`Bot pressed: ${step.key}`)
      }
    }

    return {
      success: true,
      message: `Text typed: ${text}`,
      data: { text, patternLength: typingPattern.length },
    }
  }

  async executeScroll(action, session) {
    const amount = action.parameters.scrollAmount || 300
    const profile = session.humanProfile.behaviorPattern

    const scrollPattern = humanBehavior.generateScrollPattern(amount, profile)

    for (const step of scrollPattern) {
      await this.wait(step.delay)
      console.log(`Bot scrolled: ${step.amount}px`)
    }

    return {
      success: true,
      message: `Scrolled ${amount}px`,
      data: { amount, steps: scrollPattern.length },
    }
  }

  async executeWait(action, session) {
    const duration = action.parameters.duration || 1000
    const humanizedDuration = humanBehavior.generateHumanDelay(duration, 0.2)

    await this.wait(humanizedDuration)

    return {
      success: true,
      message: `Waited ${humanizedDuration}ms`,
      data: { duration: humanizedDuration },
    }
  }

  async executeNavigate(action, session) {
    const url = action.target.url
    const delay = humanBehavior.generateHumanDelay(2000, 0.5)

    await this.wait(delay)

    console.log(`Bot navigated to: ${url}`)

    return {
      success: true,
      message: `Navigated to ${url}`,
      data: { url, loadTime: delay },
    }
  }

  async executeHumanBehavior(action, session) {
    // Execute random human-like actions
    const behaviors = ["random_mouse_move", "random_scroll", "random_pause"]
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)]

    switch (behavior) {
      case "random_mouse_move":
        const x = Math.random() * 1920
        const y = Math.random() * 1080
        await this.executeMouseMove({ target: { coordinates: { x, y } } }, session)
        break

      case "random_scroll":
        const scrollAmount = (Math.random() - 0.5) * 500
        await this.executeScroll({ parameters: { scrollAmount } }, session)
        break

      case "random_pause":
        const pauseDuration = Math.random() * 3000 + 500
        await this.wait(pauseDuration)
        break
    }

    return {
      success: true,
      message: `Executed human behavior: ${behavior}`,
      data: { behavior },
    }
  }

  async pauseSession(sessionId) {
    const session = await BotSession.findById(sessionId)
    if (session) {
      session.status = "paused"
      await session.save()
    }
  }

  async resumeSession(sessionId) {
    const session = await BotSession.findById(sessionId)
    if (session && session.status === "paused") {
      session.status = "running"
      await session.save()
      // Continue execution
      this.executeSession(sessionId)
    }
  }

  async stopSession(sessionId) {
    const session = await BotSession.findById(sessionId)
    if (session) {
      session.status = "completed"
      await session.save()
      this.activeSessions.delete(sessionId)
    }
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getActiveSessionsCount() {
    return this.activeSessions.size
  }

  getSessionStatus(sessionId) {
    return this.activeSessions.get(sessionId)?.status || "not_found"
  }
}

module.exports = new BotExecutor()
