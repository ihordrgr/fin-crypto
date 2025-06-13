const axios = require("axios")
const crypto = require("crypto")

class FaucetPayService {
  constructor() {
    this.apiUrl = "https://faucetpay.io/api/v1"
    this.apiKey = process.env.FAUCETPAY_API_KEY
    this.userToken = process.env.FAUCETPAY_USER_TOKEN

    // Поддерживаемые валюты FaucetPay
    this.supportedCurrencies = ["BTC", "ETH", "LTC", "DOGE", "BCH", "DASH", "DGB", "TRX", "FEY", "ZEC", "BNB", "SOL"]
  }

  // Регистрация нового фаукета в FaucetPay
  async registerFaucet(faucetData) {
    try {
      const { name, description, url, currency, rewardAmount, timerMinutes, referralPercent = 10 } = faucetData

      // Проверяем поддерживаемую валюту
      if (!this.supportedCurrencies.includes(currency.toUpperCase())) {
        throw new Error(`Currency ${currency} not supported by FaucetPay`)
      }

      const requestData = {
        api_key: this.apiKey,
        name: name,
        description: description,
        url: url,
        currency: currency.toUpperCase(),
        reward_amount: rewardAmount,
        timer_minutes: timerMinutes,
        referral_percent: referralPercent,
        auto_payment: true,
        minimum_payout: this.getMinimumPayout(currency),
      }

      const response = await axios.post(`${this.apiUrl}/faucets/create`, requestData)

      if (response.data.status === 200) {
        return {
          success: true,
          faucetId: response.data.data.faucet_id,
          apiKey: response.data.data.api_key,
          message: "Faucet registered successfully in FaucetPay",
        }
      } else {
        throw new Error(response.data.message || "Failed to register faucet")
      }
    } catch (error) {
      console.error("FaucetPay registration error:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      }
    }
  }

  // Отправка платежа пользователю
  async sendPayment(paymentData) {
    try {
      const { to, amount, currency, userToken, ipAddress, referral = null } = paymentData

      const requestData = {
        api_key: this.apiKey,
        to: to,
        amount: amount,
        currency: currency.toUpperCase(),
        referral: referral,
        ip_address: ipAddress,
        user_token: userToken || this.generateUserToken(),
      }

      const response = await axios.post(`${this.apiUrl}/send`, requestData)

      if (response.data.status === 200) {
        return {
          success: true,
          paymentId: response.data.data.payout_id,
          balance: response.data.data.balance_left,
          message: "Payment sent successfully",
        }
      } else {
        throw new Error(response.data.message || "Payment failed")
      }
    } catch (error) {
      console.error("FaucetPay payment error:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        errorCode: error.response?.data?.status,
      }
    }
  }

  // Проверка баланса фаукета
  async getBalance() {
    try {
      const response = await axios.post(`${this.apiUrl}/balance`, {
        api_key: this.apiKey,
      })

      if (response.data.status === 200) {
        return {
          success: true,
          balances: response.data.data,
        }
      } else {
        throw new Error(response.data.message || "Failed to get balance")
      }
    } catch (error) {
      console.error("FaucetPay balance error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Получение истории платежей
  async getPaymentHistory(limit = 100, offset = 0) {
    try {
      const response = await axios.post(`${this.apiUrl}/payouts`, {
        api_key: this.apiKey,
        count: limit,
        offset: offset,
      })

      if (response.data.status === 200) {
        return {
          success: true,
          payments: response.data.data,
          total: response.data.total,
        }
      } else {
        throw new Error(response.data.message || "Failed to get payment history")
      }
    } catch (error) {
      console.error("FaucetPay history error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Получение курсов валют
  async getCurrencyRates() {
    try {
      const response = await axios.get(`${this.apiUrl}/currencies`)

      if (response.data.status === 200) {
        return {
          success: true,
          rates: response.data.data,
        }
      } else {
        throw new Error("Failed to get currency rates")
      }
    } catch (error) {
      console.error("FaucetPay rates error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Проверка адреса пользователя
  async checkAddress(address, currency) {
    try {
      const response = await axios.post(`${this.apiUrl}/checkaddress`, {
        api_key: this.apiKey,
        address: address,
        currency: currency.toUpperCase(),
      })

      return {
        success: response.data.status === 200,
        valid: response.data.status === 200,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        valid: false,
        message: error.message,
      }
    }
  }

  // Создание ссылки для автоматического входа
  async createAutoLoginLink(email, redirectUrl) {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const hash = crypto.createHmac("sha256", this.apiKey).update(`${email}${timestamp}`).digest("hex")

      const loginUrl = `https://faucetpay.io/autologin?email=${encodeURIComponent(email)}&timestamp=${timestamp}&hash=${hash}&redirect=${encodeURIComponent(redirectUrl)}`

      return {
        success: true,
        loginUrl: loginUrl,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Получение статистики фаукета
  async getFaucetStats(faucetId) {
    try {
      const response = await axios.post(`${this.apiUrl}/faucets/stats`, {
        api_key: this.apiKey,
        faucet_id: faucetId,
      })

      if (response.data.status === 200) {
        return {
          success: true,
          stats: response.data.data,
        }
      } else {
        throw new Error(response.data.message || "Failed to get faucet stats")
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Обновление настроек фаукета
  async updateFaucetSettings(faucetId, settings) {
    try {
      const requestData = {
        api_key: this.apiKey,
        faucet_id: faucetId,
        ...settings,
      }

      const response = await axios.post(`${this.apiUrl}/faucets/update`, requestData)

      if (response.data.status === 200) {
        return {
          success: true,
          message: "Faucet settings updated successfully",
        }
      } else {
        throw new Error(response.data.message || "Failed to update faucet")
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Получение минимальной суммы выплаты для валюты
  getMinimumPayout(currency) {
    const minimums = {
      BTC: 0.00000001,
      ETH: 0.000000001,
      LTC: 0.00000001,
      DOGE: 0.001,
      BCH: 0.00000001,
      DASH: 0.00000001,
      DGB: 0.001,
      TRX: 0.001,
      FEY: 1,
      ZEC: 0.00000001,
      BNB: 0.000000001,
      SOL: 0.000000001,
    }

    return minimums[currency.toUpperCase()] || 0.00000001
  }

  // Генерация уникального токена пользователя
  generateUserToken() {
    return crypto.randomBytes(16).toString("hex")
  }

  // Проверка статуса API
  async checkApiStatus() {
    try {
      const response = await axios.get(`${this.apiUrl}/status`)
      return {
        success: true,
        status: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // Массовая отправка платежей
  async sendBulkPayments(payments) {
    const results = []

    for (const payment of payments) {
      const result = await this.sendPayment(payment)
      results.push({
        ...payment,
        result,
      })

      // Задержка между платежами для избежания rate limit
      await this.delay(1000)
    }

    return results
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

module.exports = new FaucetPayService()
