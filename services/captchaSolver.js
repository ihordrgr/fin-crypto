const axios = require("axios")

class CaptchaSolver {
  constructor() {
    this.services = {
      "2captcha": {
        apiKey: process.env.CAPTCHA_2CAPTCHA_KEY,
        submitUrl: "http://2captcha.com/in.php",
        resultUrl: "http://2captcha.com/res.php",
      },
      anticaptcha: {
        apiKey: process.env.CAPTCHA_ANTICAPTCHA_KEY,
        submitUrl: "https://api.anti-captcha.com/createTask",
        resultUrl: "https://api.anti-captcha.com/getTaskResult",
      },
      rucaptcha: {
        apiKey: process.env.CAPTCHA_RUCAPTCHA_KEY,
        submitUrl: "http://rucaptcha.com/in.php",
        resultUrl: "http://rucaptcha.com/res.php",
      },
    }
  }

  async solveCaptcha(captchaData, service = "2captcha") {
    try {
      const solver = this.services[service]
      if (!solver || !solver.apiKey) {
        throw new Error(`Captcha service ${service} not configured`)
      }

      switch (captchaData.type) {
        case "recaptcha_v2":
          return await this.solveRecaptchaV2(captchaData, solver)
        case "recaptcha_v3":
          return await this.solveRecaptchaV3(captchaData, solver)
        case "hcaptcha":
          return await this.solveHCaptcha(captchaData, solver)
        case "image":
          return await this.solveImageCaptcha(captchaData, solver)
        case "text":
          return await this.solveTextCaptcha(captchaData, solver)
        case "funcaptcha":
          return await this.solveFunCaptcha(captchaData, solver)
        case "geetest":
          return await this.solveGeeTest(captchaData, solver)
        default:
          throw new Error(`Unsupported captcha type: ${captchaData.type}`)
      }
    } catch (error) {
      console.error("Captcha solving error:", error)
      throw error
    }
  }

  async solveRecaptchaV2(captchaData, solver) {
    const { sitekey, pageurl, invisible = false } = captchaData

    // Submit captcha
    const submitData = {
      method: "userrecaptcha",
      googlekey: sitekey,
      pageurl: pageurl,
      invisible: invisible ? 1 : 0,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`Captcha submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request

    // Wait for solution
    return await this.waitForSolution(captchaId, solver)
  }

  async solveRecaptchaV3(captchaData, solver) {
    const { sitekey, pageurl, action = "verify", min_score = 0.3 } = captchaData

    const submitData = {
      method: "userrecaptcha",
      version: "v3",
      googlekey: sitekey,
      pageurl: pageurl,
      action: action,
      min_score: min_score,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`ReCaptcha v3 submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async solveHCaptcha(captchaData, solver) {
    const { sitekey, pageurl } = captchaData

    const submitData = {
      method: "hcaptcha",
      sitekey: sitekey,
      pageurl: pageurl,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`hCaptcha submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async solveImageCaptcha(captchaData, solver) {
    const { image, instructions } = captchaData

    const submitData = {
      method: "base64",
      body: image, // Base64 encoded image
      key: solver.apiKey,
      json: 1,
    }

    if (instructions) {
      submitData.textinstructions = instructions
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`Image captcha submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async solveTextCaptcha(captchaData, solver) {
    const { question } = captchaData

    const submitData = {
      method: "textcaptcha",
      textcaptcha: question,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`Text captcha submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async solveFunCaptcha(captchaData, solver) {
    const { publickey, pageurl } = captchaData

    const submitData = {
      method: "funcaptcha",
      publickey: publickey,
      pageurl: pageurl,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`FunCaptcha submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async solveGeeTest(captchaData, solver) {
    const { gt, challenge, pageurl } = captchaData

    const submitData = {
      method: "geetest",
      gt: gt,
      challenge: challenge,
      pageurl: pageurl,
      key: solver.apiKey,
      json: 1,
    }

    const submitResponse = await axios.post(solver.submitUrl, submitData)
    if (submitResponse.data.status !== 1) {
      throw new Error(`GeeTest submit failed: ${submitResponse.data.error_text}`)
    }

    const captchaId = submitResponse.data.request
    return await this.waitForSolution(captchaId, solver)
  }

  async waitForSolution(captchaId, solver, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.wait(5000) // Wait 5 seconds between checks

      try {
        const resultResponse = await axios.get(solver.resultUrl, {
          params: {
            key: solver.apiKey,
            action: "get",
            id: captchaId,
            json: 1,
          },
        })

        if (resultResponse.data.status === 1) {
          return {
            success: true,
            solution: resultResponse.data.request,
            captchaId: captchaId,
            attempts: attempt + 1,
          }
        }

        if (resultResponse.data.error_text && resultResponse.data.error_text !== "CAPCHA_NOT_READY") {
          throw new Error(`Captcha solving failed: ${resultResponse.data.error_text}`)
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message)
      }
    }

    throw new Error("Captcha solving timeout")
  }

  async reportBadCaptcha(captchaId, service = "2captcha") {
    try {
      const solver = this.services[service]
      if (!solver) return false

      await axios.get(solver.resultUrl, {
        params: {
          key: solver.apiKey,
          action: "reportbad",
          id: captchaId,
        },
      })

      return true
    } catch (error) {
      console.error("Report bad captcha error:", error)
      return false
    }
  }

  async getBalance(service = "2captcha") {
    try {
      const solver = this.services[service]
      if (!solver) return null

      const response = await axios.get(solver.resultUrl, {
        params: {
          key: solver.apiKey,
          action: "getbalance",
        },
      })

      return Number.parseFloat(response.data)
    } catch (error) {
      console.error("Get balance error:", error)
      return null
    }
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

module.exports = new CaptchaSolver()
