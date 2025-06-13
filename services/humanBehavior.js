class HumanBehaviorSimulator {
  constructor() {
    this.profiles = {
      cautious: {
        mouseSpeed: { min: 50, max: 150 },
        clickDelay: { min: 500, max: 2000 },
        typingSpeed: { min: 30, max: 60 }, // WPM
        errorRate: 0.02,
        pauseProbability: 0.3,
      },
      normal: {
        mouseSpeed: { min: 100, max: 300 },
        clickDelay: { min: 200, max: 1000 },
        typingSpeed: { min: 40, max: 80 },
        errorRate: 0.05,
        pauseProbability: 0.2,
      },
      aggressive: {
        mouseSpeed: { min: 200, max: 500 },
        clickDelay: { min: 50, max: 300 },
        typingSpeed: { min: 60, max: 120 },
        errorRate: 0.08,
        pauseProbability: 0.1,
      },
      random: {
        mouseSpeed: { min: 50, max: 500 },
        clickDelay: { min: 50, max: 3000 },
        typingSpeed: { min: 20, max: 100 },
        errorRate: 0.1,
        pauseProbability: 0.4,
      },
    }
  }

  generateMousePath(startX, startY, endX, endY, profile = "normal") {
    const config = this.profiles[profile]
    const points = []
    const steps = Math.floor(Math.random() * 10) + 5

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps
      const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 20
      const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 20

      points.push({
        x: Math.round(x),
        y: Math.round(y),
        delay: Math.random() * (config.mouseSpeed.max - config.mouseSpeed.min) + config.mouseSpeed.min,
      })
    }

    return points
  }

  generateTypingPattern(text, profile = "normal") {
    const config = this.profiles[profile]
    const wpm = Math.random() * (config.typingSpeed.max - config.typingSpeed.min) + config.typingSpeed.min
    const baseDelay = 60000 / (wpm * 5) // Convert WPM to ms per character

    const pattern = []
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      let delay = baseDelay + (Math.random() - 0.5) * baseDelay * 0.5

      // Add realistic delays for different characters
      if (char === " ") delay *= 1.5
      if (char.match(/[.!?]/)) delay *= 2
      if (char.match(/[A-Z]/)) delay *= 1.2

      // Simulate typos
      const shouldMakeError = Math.random() < config.errorRate
      if (shouldMakeError && i > 0) {
        // Add backspace and correction
        pattern.push({
          action: "key",
          key: "Backspace",
          delay: delay * 0.5,
        })
        pattern.push({
          action: "type",
          text: char,
          delay: delay * 1.5,
        })
      } else {
        pattern.push({
          action: "type",
          text: char,
          delay,
        })
      }

      // Random pauses
      if (Math.random() < config.pauseProbability) {
        pattern.push({
          action: "wait",
          delay: Math.random() * 2000 + 500,
        })
      }
    }

    return pattern
  }

  generateScrollPattern(distance, profile = "normal") {
    const config = this.profiles[profile]
    const steps = Math.floor(Math.abs(distance) / 100) + 1
    const stepSize = distance / steps

    const pattern = []
    for (let i = 0; i < steps; i++) {
      pattern.push({
        action: "scroll",
        amount: stepSize + (Math.random() - 0.5) * stepSize * 0.2,
        delay: Math.random() * 200 + 50,
      })
    }

    return pattern
  }

  generateHumanDelay(baseDelay, variance = 0.3) {
    const min = baseDelay * (1 - variance)
    const max = baseDelay * (1 + variance)
    return Math.random() * (max - min) + min
  }

  shouldTakeBreak(actionsCompleted, breakFrequency = 50) {
    if (actionsCompleted % breakFrequency === 0) {
      return {
        shouldBreak: true,
        duration: Math.random() * 30000 + 10000, // 10-40 seconds
      }
    }
    return { shouldBreak: false }
  }

  generateRandomUserAgent() {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]

    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  calculateHumanScore(session) {
    let score = 100
    const stats = session.statistics

    // Penalize for too fast actions
    const avgActionTime = stats.totalDuration / stats.actionsCompleted
    if (avgActionTime < 500) score -= 20
    if (avgActionTime < 200) score -= 30

    // Penalize for too high success rate
    const successRate = stats.actionsCompleted / (stats.actionsCompleted + stats.actionsFailed)
    if (successRate > 0.98) score -= 15

    // Reward for realistic timing patterns
    if (avgActionTime > 1000 && avgActionTime < 5000) score += 10

    return Math.max(0, Math.min(100, score))
  }
}

module.exports = new HumanBehaviorSimulator()
