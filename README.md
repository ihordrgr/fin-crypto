# CryptoKran - Криптовалютный кран

Полнофункциональный криптовалютный кран с играми, ботами и реферальной системой.

## Возможности

- 💰 **Бесплатный кран** - получайте Bitcoin Cash каждые 5 минут
- 🎰 **Казино** - играйте в рулетку и слоты с внутренней валютой
- 🤖 **AI Боты** - автоматизируйте заработок
- 👥 **Реферальная система** - приглашайте друзей и получайте бонусы
- 📋 **Задания** - выполняйте задания за дополнительные монеты
- 💳 **FaucetPay интеграция** - быстрые выплаты

## Технологии

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Аутентификация**: JWT
- **Платежи**: FaucetPay API
- **AI**: OpenAI API
- **Автоматизация**: Puppeteer

## Установка

1. Клонируйте репозиторий:
\`\`\`bash
git clone https://github.com/your-username/crypto-faucet.git
cd crypto-faucet
\`\`\`

2. Установите зависимости:
\`\`\`bash
npm install
\`\`\`

3. Создайте файл .env на основе .env.example:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Настройте переменные окружения в файле .env

5. Запустите проект:
\`\`\`bash
npm run dev
\`\`\`

## Настройка

### Обязательные переменные окружения:

- `MONGODB_URI` - строка подключения к MongoDB
- `JWT_SECRET` - секретный ключ для JWT токенов
- `BCH_WALLET_ADDRESS` - ваш BCH адрес для выплат
- `FAUCETPAY_API_KEY` - API ключ FaucetPay
- `OPENAI_API_KEY` - API ключ OpenAI для AI функций

### Опциональные переменные:

- `CAPTCHA_2CAPTCHA_KEY` - API ключ 2Captcha
- `CAPTCHA_ANTICAPTCHA_KEY` - API ключ AntiCaptcha
- `CAPTCHA_RUCAPTCHA_KEY` - API ключ RuCaptcha

## Структура проекта

\`\`\`
crypto-faucet/
├── config/          # Конфигурация базы данных
├── middleware/      # Middleware для аутентификации и безопасности
├── models/          # Модели MongoDB
├── public/          # Статические файлы (HTML, CSS, JS)
├── routes/          # API маршруты
├── services/        # Бизнес-логика и внешние сервисы
├── .env.example     # Пример переменных окружения
├── package.json     # Зависимости проекта
└── server.js        # Главный файл сервера
\`\`\`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя

### Кран
- `POST /api/faucet/claim` - Клейм из крана
- `GET /api/faucet/stats` - Статистика крана

### Игры
- `POST /api/tokens/games/roulette` - Игра в рулетку
- `POST /api/tokens/games/slots` - Игра в слоты
- `GET /api/tokens/games/history` - История игр

### Токены
- `GET /api/tokens/balance` - Баланс токенов
- `POST /api/tokens/deposit` - Депозит токенов
- `POST /api/tokens/withdraw` - Вывод токенов

## Деплой

### Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Heroku
\`\`\`bash
git push heroku main
\`\`\`

## Лицензия

MIT License

## Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.
\`\`\`

```plaintext file="INSTALL.md"
# Инструкция по установке CryptoKran

## Системные требования

- Node.js 18.0.0 или выше
- MongoDB 4.4 или выше
- Git

## Пошаговая установка

### 1. Скачивание проекта

Скачайте ZIP архив проекта и распакуйте его, или клонируйте репозиторий:

\`\`\`bash
git clone https://github.com/your-username/crypto-faucet.git
cd crypto-faucet
\`\`\`

### 2. Установка зависимостей

\`\`\`bash
npm install
\`\`\`

### 3. Настройка базы данных

#### Локальная MongoDB:
1. Установите MongoDB с официального сайта
2. Запустите MongoDB сервис
3. Используйте URI: `mongodb://localhost:27017/crypto-faucet`

#### MongoDB Atlas (рекомендуется):
1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер
3. Получите строку подключения
4. Замените `<password>` на ваш пароль

### 4. Настройка переменных окружения

Скопируйте файл .env.example в .env:
\`\`\`bash
cp .env.example .env
\`\`\`

Отредактируйте файл .env и заполните следующие обязательные поля:

\`\`\`env
# База данных
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto-faucet

# JWT секрет (сгенерируйте случайную строку)
JWT_SECRET=your_super_secret_jwt_key_here

# FaucetPay (зарегистрируйтесь на faucetpay.io)
FAUCETPAY_API_KEY=your_faucetpay_api_key
FAUCETPAY_USER_TOKEN=your_faucetpay_user_token

# OpenAI (получите на platform.openai.com)
OPENAI_API_KEY=your_openai_api_key

# BCH кошелек
BCH_WALLET_ADDRESS=your_bch_wallet_address
\`\`\`

### 5. Получение API ключей

#### FaucetPay:
1. Зарегистрируйтесь на https://faucetpay.io/
2. Перейдите в Developer API
3. Создайте новый API ключ
4. Скопируйте API Key и User Token

#### OpenAI:
1. Зарегистрируйтесь на https://platform.openai.com/
2. Перейдите в API Keys
3. Создайте новый секретный ключ
4. Скопируйте ключ (он показывается только один раз)

#### Сервисы капчи (опционально):
- 2Captcha: https://2captcha.com/
- AntiCaptcha: https://anti-captcha.com/
- RuCaptcha: https://rucaptcha.com/

### 6. Запуск проекта

Для разработки:
\`\`\`bash
npm run dev
\`\`\`

Для продакшена:
\`\`\`bash
npm start
\`\`\`

Проект будет доступен по адресу: http://localhost:3000

### 7. Проверка работы

1. Откройте браузер и перейдите на http://localhost:3000
2. Зарегистрируйте тестового пользователя
3. Попробуйте сделать клейм из крана
4. Проверьте работу казино

## Возможные проблемы

### Ошибка подключения к MongoDB
- Проверьте правильность MONGODB_URI
- Убедитесь, что MongoDB запущена
- Проверьте сетевые настройки (для Atlas)

### Ошибки API ключей
- Проверьте правильность ключей
- Убедитесь, что ключи активны
- Проверьте лимиты использования

### Порт уже занят
Измените порт в .env:
\`\`\`env
PORT=3001
\`\`\`

## Деплой в продакшен

### Vercel (рекомендуется)
1. Установите Vercel CLI: `npm install -g vercel`
2. Войдите в аккаунт: `vercel login`
3. Деплой: `vercel`
4. Добавьте переменные окружения в панели Vercel

### Heroku
1. Установите Heroku CLI
2. Создайте приложение: `heroku create your-app-name`
3. Добавьте переменные окружения: `heroku config:set MONGODB_URI=...`
4. Деплой: `git push heroku main`

### VPS/Dedicated Server
1. Установите Node.js и MongoDB
2. Клонируйте проект
3. Установите зависимости
4. Настройте PM2 для автозапуска:
\`\`\`bash
npm install -g pm2
pm2 start server.js --name crypto-faucet
pm2 startup
pm2 save
\`\`\`

## Безопасность

1. Используйте сильный JWT_SECRET
2. Настройте HTTPS в продакшене
3. Ограничьте доступ к базе данных
4. Регулярно обновляйте зависимости
5. Мониторьте логи на подозрительную активность

## Поддержка

Если возникли проблемы:
1. Проверьте логи сервера
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к интернету
4. Создайте issue в репозитории с описанием проблемы
