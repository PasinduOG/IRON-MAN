# IRON-MAN WhatsApp Bot v1.3.0 🤖

A powerful WhatsApp bot built with Baileys featuring Jarvis-style responses, advanced sticker creation, MongoDB session persistence, Google Gemini AI integration, and beautiful web interface. **Now deployed live on Heroku with direct API implementation!**

## 🌐 Live Deployment

**🔗 Live Bot URL:** https://iron-man-0410f1f79230.herokuapp.com/

### Deployment Status: ✅ **LIVE & OPERATIONAL**
- ✅ **Heroku Deployed** - Running 24/7 on Heroku cloud platform
- ✅ **MongoDB Connected** - Persistent session storage via MongoDB Atlas
- ✅ **AI Integration Active** - Google Gemini AI powered responses via direct API
- ✅ **Environment Variables Set** - All configuration properly deployed
- ✅ **Web Interface Live** - Beautiful QR code scanning interface
- ✅ **Session Persistence** - Bot sessions survive deployments and restarts
- ✅ **Advanced Processing** - Enhanced sticker creation with FFmpeg optimization

## 🎯 Quick Start (Live Bot)

**🚀 The bot is already deployed and ready to use!**

1. **Visit the live bot**: https://iron-man-0410f1f79230.herokuapp.com/
2. **Scan the QR code** with WhatsApp
3. **Start chatting**:
   - Send `hi` for a greeting
   - Send `!ping` to test bot responsiveness
   - Send `!jarvis what is AI?` for AI responses  
   - Send `!help` for all commands with image
   - Send `!commands` for organized command list
   - Send an image with `!sticker` to create stickers
   - Send `!aboutdev` for live GitHub developer info
   - Send `!menu` for welcome menu
   - Send `!uptime` for bot status

### Live Deployment Features:
- ✅ **24/7 Availability** - Always online on Heroku
- ✅ **AI Integration** - Google Gemini AI responses via direct API calls
- ✅ **Session Persistence** - MongoDB stores your session permanently
- ✅ **Web Interface** - Beautiful QR code scanning page
- ✅ **All Commands** - Full feature set available
- ✅ **Advanced Video Processing** - FFmpeg-powered animated sticker creation
- ✅ **Anti-Loop Protection** - Smart message filtering and duplicate prevention

## ✨ Features

- 🤖 **Smart Greetings** - Responds to hi, hello, hey with Jarvis welcome message
- 🧠 **AI-Powered Jarvis** - Google Gemini AI integration with direct API calls for intelligent responses
- ❓ **Enhanced Help System** - Interactive help center with IRON-MAN themed responses and comprehensive command guide
- 🔧 **Quick Commands** - Instant status checks with `!ping`, `!info`, `!menu`, `!uptime` for better user experience
- 🎯 **Unified Sticker Creator** - Convert images to static stickers and videos/GIFs to animated WebP stickers with single `!sticker` command
- 👨‍💻 **Dynamic Developer Info** - Live GitHub API integration with real-time stats, avatar, and comprehensive profile via `!aboutdev` command
- 📊 **User Statistics** - Track session activity, message counts, and bot usage with `!stats` command
- ❌ **Smart Invalid Command Handler** - Video GIF preview response for unrecognized commands with helpful suggestions
- 🗄️ **MongoDB Storage** - Persistent session storage using MongoDB Atlas with automatic reconnection
- 🌐 **Web QR Interface** - Beautiful HTML page for easy QR code scanning with auto-refresh
- 🔄 **Auto Reconnection** - Automatic reconnection on disconnect with retry logic
- 📱 **Mobile Responsive** - Works perfectly on all devices with optimized interface
- ☁️ **Heroku Ready** - One-click deployment with persistent sessions and environment variables
- 🎨 **IRON-MAN Theme** - Styled with IRON-MAN colors and design throughout
- 🛡️ **Anti-Loop Protection** - Enhanced filtering to prevent infinite message loops and bot responses
- 👥 **Multi-User Support** - Concurrent user handling with rate limiting and session management
- 🎬 **FFmpeg Processing** - Advanced video/GIF processing with dual-stage compression
- 🛡️ **Anti-Loop Protection** - Smart message filtering to prevent bot loops and duplicates
- 📱 **Responsive Interface** - Beautiful web interface with auto-refresh and mobile optimization

## 🚀 Commands

### 💬 Natural Language Commands
- **`hi`**, **`hello`**, **`hey`** - Get Jarvis welcome message
- **`jarvis`** - Get formal Jarvis greeting "At your service, sir"

### 📋 Primary Commands
- **`!help`** - Get bot help center with IRON-MAN image and comprehensive info
- **`!commands`** - Show all available commands list with organized categories
- **`!sticker`** - Convert image/video/GIF to sticker (static or animated)
- **`!jarvis [message]`** - Get AI-powered responses from Jarvis using Google Gemini (Direct API)
- **`!aboutdev`** - Get detailed developer information with live GitHub data and avatar
- **`!stats`** - Show your bot usage statistics (messages sent, session info, rate limits)

### 🔧 Quick Commands
- **`!ping`**, **`!test`**, **`!alive`** - Check bot status and response time
- **`!info`**, **`!about`**, **`!version`** - Get bot information and version details
- **`!menu`**, **`!start`** - Display welcome menu for new users
- **`!bot`**, **`!uptime`**, **`!status`** - Show detailed bot status with uptime information

### 🧠 AI Commands
- **`!jarvis [message]`** - Get AI-powered responses from Jarvis using Google Gemini (Direct API)
  - Example: `!jarvis what is artificial intelligence?`
  - Example: `!jarvis explain quantum computing`
  - Example: `!jarvis how do I code in JavaScript?`
  - **Features**: Displays "🤖 Thinking..." message before response, includes Jarvis-style formatting

### 👨‍💻 Developer Info Commands
- **`!aboutdev`** - Get detailed developer information with live GitHub data and avatar

**Features:**
- 🔄 **Live GitHub Data** - Fetches real-time profile information from GitHub API
- 📊 **Dynamic Stats** - Shows current follower count, repositories, and activity
- 🖼️ **GitHub Avatar Integration** - Downloads developer image from GitHub profile automatically
- 🔄 **Fallback Image Support** - Uses local IRON-MAN image if GitHub download fails
- ⚡ **Smart Caching** - Caches GitHub data for 1 hour to reduce API calls

### 🎯 Sticker Commands
- **`!sticker`** (as image caption) - Convert uploaded image to static sticker
- **`!sticker`** (reply to image) - Convert replied image to static sticker
- **`!sticker`** (as video/GIF caption) - Convert uploaded video/GIF to animated sticker
- **`!sticker`** (reply to video/GIF) - Convert replied video/GIF to animated sticker

## 📸 Unified Sticker Creation Usage

### Method 1: Media with Caption
1. Select/take an image, video, or GIF
2. Add caption: `!sticker`
3. Send → Bot automatically detects media type and creates appropriate sticker

### Method 2: Reply to Media  
1. Find any image, video, or GIF in chat
2. Reply with: `!sticker`
3. Bot converts original media to sticker (static for images, animated for videos/GIFs)

### Advanced Features:
- **Dual Processing**: Automatically handles both static (images) and animated (videos/GIFs) stickers
- **Smart Compression**: Two-stage compression system for optimal file sizes
- **Format Support**: JPG, PNG, WebP for images | MP4, GIF, WebM for videos
- **Auto-Detection**: Intelligently detects media type and applies appropriate conversion
- **Quality Optimization**: Maintains visual quality while meeting WhatsApp size limits
- **Error Recovery**: Comprehensive error handling with user-friendly messages

## 🤖 AI Integration Details

### Google Gemini Integration
- **Model**: Gemini-2.0-flash (Latest Google AI model)
- **Implementation**: Direct API calls (no SDK dependency)
- **Features**: Context-aware responses, Jarvis personality, technical explanations
- **Rate Limiting**: Built-in cooldown system to prevent spam
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### AI Response Features:
- 🧠 **Intelligent Responses** - Context-aware AI powered by Google Gemini
- ⚡ **Fast Processing** - Direct API calls for optimal speed
- 🎭 **Jarvis Personality** - Responses formatted in Tony Stark's Jarvis style
- 🛡️ **Rate Limited** - 3-second cooldown between requests per user
- 🔄 **Error Recovery** - Handles timeouts and API failures gracefully

## 📱 Multi-User & Session Management

### Session Features:
- **Per-User Sessions** - Individual session tracking for each user
- **Message Counting** - Track messages sent per user
- **Activity Monitoring** - Last activity timestamps
- **Automatic Cleanup** - Inactive sessions cleaned up after 30 minutes

### Rate Limiting:
- **General Commands** - 10 requests per minute per user
- **AI Requests** - 3-second cooldown between AI commands
- **Sticker Creation** - 5-second cooldown between sticker requests
- **User-Specific** - Rate limits applied individually per user

### Command Organization:
- **Primary Commands** - Core bot functionality (`!help`, `!sticker`, `!jarvis`, etc.)
- **Quick Commands** - Fast status and info checks (`!ping`, `!info`, `!uptime`)
- **Natural Language** - Casual interactions (`hi`, `hello`, `jarvis`)
- **Invalid Command Detection** - Recognizes 18+ valid commands to prevent false invalid responses

## 🛠️ Local Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Git

### Quick Setup
```bash
# Clone repository
git clone https://github.com/PasinduOG/IRON-MAN.git
cd IRON-MAN

# Install dependencies
npm install

# Configure environment
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
echo "GITHUB_USERNAME=PasinduOG" >> .env

# Start bot
npm start
```

### Manual Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/PasinduOG/IRON-MAN.git
   cd IRON-MAN
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up MongoDB**:
   - Create MongoDB Atlas account
   - Create new cluster
   - Get connection string
   - Add to `.env` file

4. **Configure environment variables**:
   ```bash
   # Create .env file
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   GEMINI_API_KEY=your-gemini-api-key-here
   GITHUB_USERNAME=PasinduOG
   NODE_ENV=development
   PORT=3000
   ```

5. **Start the bot**:
   ```bash
   npm start
   ```

6. **Scan QR code** with WhatsApp and start using!

## 🚀 Heroku Deployment

### One-Click Deploy
1. **Fork this repository** to your GitHub account
2. **Create Heroku account** if you don't have one
3. **Click "Deploy to Heroku"** button (if available) or follow manual steps below

### Manual Heroku Deploy
```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create your-iron-man-bot

# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
heroku config:set GEMINI_API_KEY="your-gemini-api-key-here"
heroku config:set GITHUB_USERNAME="PasinduOG"

# Deploy to Heroku
git push heroku main

# Open deployed app
heroku open
```

## 🔧 Environment Variables

### Required for MongoDB Persistence:
```bash
# Heroku (Recommended for production)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"

# Local (.env file)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Required for AI Features:
```bash
# Heroku (Google Gemini AI)
heroku config:set GEMINI_API_KEY="your-gemini-api-key-here"

# Local (.env file)
GEMINI_API_KEY=your-gemini-api-key-here
```

### Optional Configurations:
```bash
# Heroku
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
heroku config:set GITHUB_USERNAME=PasinduOG

# Local (.env file)
NODE_ENV=development
PORT=3000
GITHUB_USERNAME=PasinduOG
```

### MongoDB Setup Guide:
1. **Create MongoDB Atlas Account** - [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster** - Free tier available
3. **Create Database User** - With read/write permissions
4. **Get Connection String** - Replace `<username>`, `<password>`, `<cluster>`
5. **Whitelist IP Address** - Add `0.0.0.0/0` for Heroku or your IP for local

### Google Gemini API Setup:
1. **Visit Google AI Studio** - [aistudio.google.com](https://aistudio.google.com)
2. **Create API Key** - Free tier available
3. **Copy API Key** - Add to environment variables
4. **Test API** - Verify key works with a simple request

## 🔧 Dynamic GitHub Integration

### Features:
- **Live Profile Data**: Fetches real-time GitHub profile information
- **Smart Caching**: 1-hour cache to reduce API calls and improve performance
- **Fallback Support**: Graceful fallback to static data if API fails
- **Auto-Updates**: Profile stats update automatically without code changes
- **Avatar Integration**: Downloads current GitHub avatar dynamically

### Configuration:
```bash
# Optional: Set custom GitHub username
GITHUB_USERNAME=PasinduOG
```

### GitHub Data Fetched:
- Profile name and bio
- Follower/following count
- Public repository count
- Account creation date
- Last profile update
- Avatar URL and location
- Company and website information

### Key Technical Features:
1. **Session Management**: MongoDB-based persistent sessions survive deployments
2. **Media Processing**: Sharp for images, FFmpeg for videos with intelligent compression
3. **AI Integration**: Direct Gemini API calls with structured error handling
4. **Dynamic GitHub Integration**: Real-time profile fetching with smart caching
5. **Command System**: Regex-based command detection with natural language support
6. **Auto-Suggestions**: Context-aware suggestions for media and invalid commands
7. **Web Interface**: Express server with real-time QR code updates

### Performance Optimizations:
- **📊 File Size Monitoring**: Automatic compression adjustment for WhatsApp limits
- **⚡ Caching Strategy**: Efficient media downloading and temporary file management
- **🔄 Retry Logic**: Automatic reconnection and error recovery mechanisms
- **📱 Mobile-First**: Optimized for mobile scanning and interaction
- **🌐 API Rate Limiting**: GitHub API caching (1 hour) to prevent rate limits

## 📋 Testing & Usage Examples

### Quick Test Commands:
1. **Basic greeting**: Send `hi` in WhatsApp
2. **Bot status**: `!ping` or `!alive` to check if bot is responsive
3. **AI test**: `!jarvis what is artificial intelligence?`
4. **Help**: `!help` for bot information with image
5. **Commands list**: `!commands` for all available commands
6. **Developer info**: `!aboutdev` for live GitHub profile with avatar
7. **Statistics**: `!stats` for your usage stats
8. **Bot info**: `!info` for bot version and details
9. **Welcome menu**: `!menu` for new user welcome
10. **Uptime**: `!uptime` for bot status and uptime

### Command Response Examples:

**Status Commands:**
- **User**: `!ping` → **Bot**: `🏓 *Pong!* Bot is alive and running!`
- **User**: `!uptime` → **Bot**: `🤖 *Bot Status Report* ✅ Status: Online & Active ⏰ Uptime: 2h 45m 30s`
- **User**: `!info` → **Bot**: `🤖 *IRON-MAN Bot Information* 🔥 Version: 1.3.0`

**AI Response Examples:**
The bot uses Google Gemini AI via direct API calls to provide intelligent Jarvis-style responses:

**User**: `!jarvis what is the arc reactor?`
**Jarvis**: *🤖 Jarvis Response: The arc reactor is a clean energy source...*

**User**: `!jarvis explain machine learning`
**Jarvis**: *🤖 Jarvis Response: Machine learning is a subset of artificial intelligence...*

### Sticker Creation Examples:
- Send any image with caption `!sticker` → Creates static sticker
- Send any video/GIF with caption `!sticker` → Creates animated sticker  
- Reply to any media with `!sticker` → Converts that media to sticker

### Invalid Command Handling:
- **User**: `!unknown` → **Bot**: Sends IRON-MAN video with helpful command suggestions

## 🎯 Complete Command Reference

### 📋 All Supported Commands (18 Total)
**Primary Commands:**
- `!help`, `!commands`, `!sticker`, `!jarvis <prompt>`, `!aboutdev`, `!stats`

**Quick Status Commands:**
- `!ping`, `!test`, `!alive`, `!bot`, `!uptime`, `!status`

**Information Commands:**
- `!info`, `!about`, `!version`

**Navigation Commands:**
- `!menu`, `!start`

**Natural Language:**
- `hi`, `hello`, `hey`, `jarvis`

### 🔍 Invalid Command Detection
The bot intelligently recognizes all 18+ valid commands and provides helpful video responses with command suggestions for any unrecognized commands starting with `!`.

## 🎯 Current Status

### ✅ Completed Features:
✅ MongoDB Session Persistence    ✅ Google Gemini AI Integration
✅ Advanced Sticker Creation      ✅ Web QR Interface
✅ Heroku Deployment             ✅ Multi-User Support  
✅ Rate Limiting & Throttling    ✅ Anti-Loop Protection
✅ Developer Info with GitHub    ✅ Smart Invalid Command Handler
✅ FFmpeg Video Processing       ✅ Dynamic GitHub Integration
✅ User Statistics & Analytics   ✅ Live GitHub Profile Data
✅ Quick Status Commands         ✅ Enhanced Help System
✅ Bot Information Commands      ✅ Uptime Monitoring
✅ Welcome Menu System           ✅ Comprehensive Command List

### 🚀 Future Enhancements

- 🎵 Music download integration
- 📊 Usage analytics dashboard  
- 🌐 Multi-language support
- 🔊 Voice message processing
- 📺 YouTube video downloads
- 🎮 Interactive games
- 📰 News updates integration
- 🤖 Advanced AI conversations

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open Pull Request**

### Development Guidelines:
- Follow existing code style
- Add comments for complex logic
- Test all features before submitting
- Update README for new features

### Bug Reports & Feature Requests:
- **Issues**: [GitHub Issues](https://github.com/PasinduOG/IRON-MAN/issues)

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

**Buy me a coffee**: [buymeacoffee.com/pasinduogdev](https://buymeacoffee.com/pasinduogdev)

---

**Built with ❤️ by [Pasindu Madhuwantha](https://github.com/PasinduOG)**

*"I am Iron Man" - Tony Stark* 🤖✨
