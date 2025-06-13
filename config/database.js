const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/crypto-faucet", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`📦 MongoDB подключен: ${conn.connection.host}`)
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
