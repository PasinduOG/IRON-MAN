# Iron Man WhatsApp Bot 🤖

A WhatsApp bot built with Baileys that responds to greetings with a Jarvis-style welcome message.

## Features

- 🤖 Responds to greetings (hi, hello, hey)
- 🔄 Automatic reconnection on disconnect
- 📱 QR code authentication
- ☁️ Heroku deployment ready

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the bot:
   ```bash
   npm start
   ```
4. Scan the QR code with your WhatsApp app

## Heroku Deployment

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Git initialized in your project

### Steps

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app:**
   ```bash
   heroku create your-bot-name
   ```

3. **Set up Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

4. **Deploy to Heroku:**
   ```bash
   git push heroku main
   ```

5. **Check logs:**
   ```bash
   heroku logs --tail
   ```

6. **Open your app:**
   ```bash
   heroku open
   ```

### Important Notes for Heroku

- The bot will generate a QR code in the Heroku logs on first deployment
- You need to scan this QR code quickly before it expires
- WhatsApp session data will be lost when Heroku restarts (every 24 hours for free tier)
- Consider using a database to persist session data for production use

### Environment Variables

No environment variables are required for basic setup, but you can set custom configurations:

```bash
heroku config:set NODE_ENV=production
```

## Troubleshooting

- If QR code doesn't appear, check the logs: `heroku logs --tail`
- If connection fails, the bot will automatically retry
- For session persistence issues, consider implementing database storage

## License

MIT License
