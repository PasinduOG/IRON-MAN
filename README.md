# IRON-MAN WhatsApp Bot v1.5.0 - AI Memory & Media Edition 🤖

A powerful WhatsApp bot built with Baileys featuring Jarvis-style responses, advanced sticker creation, MongoDB session persistence, Google Gemini AI integration with conversation memory, and beautiful web interface. **Now deployed live on Heroku with AI memory management!**

## 🌐 Live Deployment

**🔗 Live Bot URL:** https://iron-man-0410f1f79230.herokuapp.com/

### Deployment Status: ✅ **LIVE & OPERATIONAL**
- ✅ **Heroku Deployed** - Running 24/7 on Heroku cloud platform
- ✅ **MongoDB Connected** - Persistent session storage via MongoDB Atlas
- ✅ **AI Integration Active** - Google Gemini AI powered responses via direct API
- ✅ **AI Memory System** - Conversation memory for personalized responses
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
   - Send `!chat what is AI?` for AI responses with memory
   - Send `!conv https://www.youtube.com/watch?v=example` for YouTube to MP3 conversion
   - Send `!help` for all commands with image
   - Send `!commands` for organized command list
   - Send an image with `!sticker` to create stickers
   - Send `!aboutdev` for live GitHub developer info
   - Send `!memory` to check your conversation memory
   - Send `!menu` for welcome menu
   - Send `!uptime` for bot status

### Live Deployment Features:
- ✅ **24/7 Availability** - Always online on Heroku
- ✅ **AI Integration** - Google Gemini AI responses with conversation memory
- ✅ **Session Persistence** - MongoDB stores your session permanently
- ✅ **Conversation Memory** - AI remembers context from previous messages
- ✅ **Web Interface** - Beautiful QR code scanning page
- ✅ **All Commands** - Full feature set available
- ✅ **Advanced Video Processing** - FFmpeg-powered animated sticker creation
- ✅ **Anti-Loop Protection** - Smart message filtering and duplicate prevention

## ✨ Features

- 🤖 **Smart Greetings** - Responds to hi, hello, hey with Jarvis welcome message
- 🧠 **AI-Powered chat with Memory** - Google Gemini AI integration with conversation context and personalized responses
- 🎵 **YouTube to MP3 Converter** - Convert YouTube videos to downloadable MP3 files with metadata
- 🧠 **Conversation Memory** - Remembers last 10 message exchanges for context-aware responses
- ❓ **Enhanced Help System** - Interactive help center with IRON-MAN themed responses and comprehensive command guide
- 🔧 **Quick Commands** - Instant status checks with `!ping`, `!info`, `!menu`, `!uptime` for better user experience
- 🎯 **Unified Sticker Creator** - Convert images to static stickers and videos/GIFs to animated WebP stickers with single `!sticker` command
- 👨‍💻 **Dynamic Developer Info** - Live GitHub API integration with real-time stats, avatar, and comprehensive profile via `!aboutdev` command
- 📊 **User Statistics** - Track session activity, message counts, and bot usage with `!stats` command
- ❌ **Smart Invalid Command Handler** - Video GIF preview response for unrecognized commands with helpful suggestions
- 🧠 **MongoDB Memory System** - AI conversation memory with automatic cleanup and context management
- 🗄️ **MongoDB Storage** - Persistent session storage using MongoDB Atlas with automatic reconnection
- 🌐 **Web QR Interface** - Beautiful HTML page for easy QR code scanning with auto-refresh
- 🔄 **Auto Reconnection** - Automatic reconnection on disconnect with retry logic
- 📱 **Mobile Responsive** - Works perfectly on all devices with optimized interface
- ☁️ **Heroku Ready** - One-click deployment with persistent sessions and environment variables
- 🎨 **IRON-MAN Theme** - Styled with IRON-MAN colors and design throughout
- 🛡️ **Anti-Loop Protection** - Enhanced filtering to prevent infinite message loops and bot responses
- 👥 **Multi-User Support** - Concurrent user handling with rate limiting and session management
- 🎬 **FFmpeg Processing** - Advanced video/GIF processing with dual-stage compression
- 📱 **Responsive Interface** - Beautiful web interface with auto-refresh and mobile optimization
- 🔐 **Clean Media Handling** - No automatic replies to uploaded media, allowing for cleaner conversation flow

## 🚀 Commands

### 💬 Natural Language Commands
- **`hi`**, **`hello`**, **`hey`** - Get Jarvis welcome message
- **`jarvis`** - Get formal Jarvis greeting "At your service, sir"

### 📋 Primary Commands
- **`!help`** - Get bot help center with IRON-MAN image and comprehensive info
- **`!commands`** - Show all available commands list with organized categories
- **`!sticker`** - Convert image/video/GIF to sticker (static or animated)
- **`!chat [message]`** - Get AI-powered responses with conversation memory
- **`!conv [youtube_url]`** - Convert YouTube videos to MP3 format for download
- **`!aboutdev`** - Get detailed developer information with live GitHub data and avatar
- **`!stats`** - Show your bot usage statistics (messages sent, session info, rate limits)

### 🧠 Memory Management Commands
- **`!memory`** - Show your conversation memory statistics and timeline
- **`!forgetme`** - Clear all your conversation memory and start fresh
- **`!clearcontext`** - Clear conversation context (same as forgetme)

### 🔧 Quick Commands
- **`!ping`**, **`!test`**, **`!alive`** - Check bot status and response time
- **`!info`**, **`!about`**, **`!version`** - Get bot information and version details
- **`!menu`**, **`!start`** - Display welcome menu for new users
- **`!bot`**, **`!uptime`**, **`!status`** - Show detailed bot status with uptime information

### 🧠 AI Commands
- **`!chat [message]`** - Get AI-powered responses from conversation memory
  - Example: `!chat what is artificial intelligence?`
  - Example: `!chat explain quantum computing`
  - Example: `!chat how do I code in JavaScript?`
  - **Features**: 
    - Displays "🤖 Thinking..." message before response
    - Remembers last 10 conversation exchanges for context
    - Personalized responses based on conversation history
    - Automatic memory cleanup to maintain optimal performance

### 🎵 YouTube to MP3 Conversion Commands
- **`!conv [youtube_url]`** - Convert YouTube videos to downloadable MP3 files
  - Example: `!conv https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - Example: `!conv https://youtu.be/dQw4w9WgXcQ`
  - **Features**:
    - Supports both youtube.com/watch and youtu.be short URLs
    - Shows conversion progress with "🎵 Converting..." message
    - Provides download link with video metadata (title, duration)
    - Built-in URL validation and error handling
    - Rate limiting to prevent spam requests
    - Timeout handling for large videos
    - User-friendly error messages for different failure scenarios

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
- **Clean Operation**: No automatic suggestions when media is uploaded, maintaining clean conversation flow

## 🤖 AI Integration Details

### Google Gemini Integration with Memory
- **Model**: Gemini-2.0-flash (Latest Google AI model)
- **Implementation**: Direct API calls with conversation context
- **Memory System**: MongoDB-based conversation memory with 10-message context
- **Features**: Context-aware responses, personalized conversations
- **Rate Limiting**: Built-in cooldown system to prevent spam
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### AI Response Features:
- 🧠 **Intelligent Responses** - Context-aware AI powered by Google Gemini
- 🧠 **Conversation Memory** - Remembers last 10 exchanges for personalized responses
- ⚡ **Fast Processing** - Direct API calls for optimal speed
- 🛡️ **Rate Limited** - 3-second cooldown between requests per user
- 🔄 **Error Recovery** - Handles timeouts and API failures gracefully
- 🗑️ **Memory Management** - Automatic cleanup and user-controlled memory clearing

## 📱 Multi-User & Session Management

### Session Features:
- **Per-User Sessions** - Individual session tracking for each user
- **Message Counting** - Track messages sent per user
- **Activity Monitoring** - Last activity timestamps
- **Conversation Memory** - Individual AI memory for each user
- **Automatic Cleanup** - Inactive sessions cleaned up after 30 minutes

### Memory Management:
- **Persistent Storage** - MongoDB stores conversation history
- **Context Limits** - Maintains last 10 message exchanges per user
- **Automatic Cleanup** - Old messages removed to maintain performance
- **User Control** - Users can clear their own memory anytime
- **Privacy Protection** - Memory isolated between users

### Rate Limiting:
- **General Commands** - 10 requests per minute per user
- **AI Requests** - 3-second cooldown between AI commands
- **Sticker Creation** - 5-second cooldown between sticker requests
- **User-Specific** - Rate limits applied individually per user

### Command Organization:
- **Primary Commands** - Core bot functionality (`!help`, `!sticker`, `!chat`, etc.)
- **Memory Commands** - AI memory management (`!memory`, `!forgetme`, `!clearcontext`)
- **Quick Commands** - Fast status and info checks (`!ping`, `!info`, `!uptime`)
- **Natural Language** - Casual interactions (`hi`, `hello`, `jarvis`)
- **Invalid Command Detection** - Recognizes 20+ valid commands to prevent false invalid responses

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
2. **AI Memory System**: Conversation context with 10-message rolling history per user
3. **Media Processing**: Sharp for images, FFmpeg for videos with intelligent compression
4. **AI Integration**: Direct Gemini API calls with conversation context and structured error handling
5. **Dynamic GitHub Integration**: Real-time profile fetching with smart caching
6. **Command System**: Regex-based command detection with natural language support
7. **Auto-Suggestions**: Context-aware suggestions for media and invalid commands
8. **Web Interface**: Express server with real-time QR code updates
9. **Memory Management**: Automatic cleanup with user-controlled memory clearing
10. **Context Building**: Intelligent conversation context construction for personalized AI responses

### Performance Optimizations:
- **📊 File Size Monitoring**: Automatic compression adjustment for WhatsApp limits
- **⚡ Caching Strategy**: Efficient media downloading and temporary file management
- **🔄 Retry Logic**: Automatic reconnection and error recovery mechanisms
- **📱 Mobile-First**: Optimized for mobile scanning and interaction
- **🌐 API Rate Limiting**: GitHub API caching (1 hour) to prevent rate limits
- **🧠 Memory Optimization**: Rolling 10-message limit per user for optimal performance
- **🗑️ Automatic Cleanup**: Inactive sessions and old memories cleaned automatically

## 🧠 AI Memory Management System

### Memory Architecture:
- **Database**: MongoDB collection `memory` for persistent storage
- **Schema**: User number, message array (role, message, timestamp), updated timestamp
- **Context Limit**: Maintains last 10 message exchanges per user
- **Automatic Cleanup**: Old messages removed to maintain performance
- **User Control**: Individual memory management commands

### Memory Features:
- **Persistent Context**: Conversation history survives bot restarts
- **Personalized Responses**: AI uses previous conversation context
- **Privacy Protection**: Each user has isolated memory storage
- **Memory Statistics**: Users can view their conversation analytics
- **Easy Management**: Simple commands to view and clear memory

### Memory Commands:
- **`!memory`**: View conversation statistics, timeline, and memory overview
- **`!forgetme`**: Clear all conversation memory for fresh start
- **`!clearcontext`**: Alternative command for memory clearing
- **`!stats`**: Include memory stats in overall user statistics

### How Memory Works:
1. **Context Building**: Previous messages combined with current message
2. **AI Processing**: Gemini receives enriched context for better responses
3. **Memory Storage**: Both user and AI messages stored in MongoDB
4. **Automatic Cleanup**: Maintains only latest 10 exchanges per user
5. **User Control**: Users can clear their memory anytime for privacy

## 📋 Testing & Usage Examples

### Quick Test Commands:
1. **Basic greeting**: Send `hi` in WhatsApp
2. **Bot status**: `!ping` or `!alive` to check if bot is responsive
3. **AI test**: `!chat what is artificial intelligence?`
4. **YouTube conversion**: `!conv https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. **Memory check**: `!memory` to see your conversation memory stats
6. **Help**: `!help` for bot information with image
7. **Commands list**: `!commands` for all available commands
8. **Developer info**: `!aboutdev` for live GitHub profile with avatar
9. **Statistics**: `!stats` for your usage stats including memory
10. **Bot info**: `!info` for bot version and details
11. **Welcome menu**: `!menu` for new user welcome
12. **Uptime**: `!uptime` for bot status and uptime
13. **Memory management**: `!forgetme` to clear conversation memory

### Command Response Examples:

**Status Commands:**
- **User**: `!ping` → **Bot**: `🏓 *Pong!* Bot is alive and running!`
- **User**: `!uptime` → **Bot**: `🤖 *Bot Status Report* ✅ Status: Online & Active ⏰ Uptime: 2h 45m 30s`
- **User**: `!info` → **Bot**: `🤖 *IRON-MAN Bot Information* 🔥 Version: 1.5.0 - AI Memory & Media Edition`

**AI Response Examples:**
The bot uses Google Gemini AI with conversation memory to provide intelligent responses:

**First conversation:**
**User**: `!chat what is the arc reactor?`
**Jarvis**: *🧠 Response: The arc reactor is a clean energy source...*

**Later in conversation (with memory):**
**User**: `!chat how does it work?`
**Jarvis**: *🧠 Response: The arc reactor you asked about earlier works by...*

**Memory Management Examples:**
**User**: `!memory`
**Bot**: *🧠 Your AI Memory Statistics - Total messages: 4, Your messages: 2, AI responses: 2*

**User**: `!forgetme`
**Bot**: *🧠 Memory Cleared Successfully - All your conversation memory has been cleared*

**YouTube Conversion Examples:**
**User**: `!conv https://www.youtube.com/watch?v=dQw4w9WgXcQ`
**Bot**: *🎵 Converting YouTube video to MP3... ⏳ This may take a few moments, please wait.*
**Bot**: *✅ Conversion Successful! 🎵 Title: Rick Astley - Never Gonna Give You Up ⏱️ Duration: 3:33 📥 Download Link: [download_url]*

### Sticker Creation Examples:
- Send any image with caption `!sticker` → Creates static sticker
- Send any video/GIF with caption `!sticker` → Creates animated sticker  
- Reply to any media with `!sticker` → Converts that media to sticker

### Invalid Command Handling:
- **User**: `!unknown` → **Bot**: Sends IRON-MAN video with helpful command suggestions

## 🎯 Complete Command Reference

### 📋 All Supported Commands (22 Total)
**Primary Commands:**
- `!help`, `!commands`, `!sticker`, `!chat <prompt>`, `!conv <youtube_url>`, `!aboutdev`, `!stats`

**Memory Management Commands:**
- `!memory`, `!forgetme`, `!clearcontext`

**Quick Status Commands:**
- `!ping`, `!test`, `!alive`, `!bot`, `!uptime`, `!status`

**Information Commands:**
- `!info`, `!about`, `!version`

**Navigation Commands:**
- `!menu`, `!start`

**Natural Language:**
- `hi`, `hello`, `hey`, `jarvis`

### 🔍 Invalid Command Detection
The bot intelligently recognizes all 22+ valid commands and provides helpful video responses with command suggestions for any unrecognized commands starting with `!`.

## 🎯 Current Status

### ✅ Completed Features:
✅ MongoDB Session Persistence    ✅ Google Gemini AI Integration
✅ AI Conversation Memory         ✅ Advanced Sticker Creation      
✅ Web QR Interface              ✅ Heroku Deployment             
✅ Multi-User Support            ✅ Rate Limiting & Throttling    
✅ Anti-Loop Protection          ✅ Developer Info with GitHub    
✅ Smart Invalid Command Handler ✅ FFmpeg Video Processing       
✅ Dynamic GitHub Integration    ✅ User Statistics & Analytics   
✅ Live GitHub Profile Data      ✅ Quick Status Commands         
✅ Enhanced Help System          ✅ Bot Information Commands      
✅ Uptime Monitoring            ✅ Welcome Menu System           
✅ Comprehensive Command List    ✅ Memory Management Commands
✅ Context-Aware AI Responses    ✅ Automatic Memory Cleanup
✅ YouTube to MP3 Conversion    ✅ MIT License Implementation    ✅ Clean Media Handling
✅ Optimized User Experience    ✅ Non-Intrusive Operation

### 🚀 Future Enhancements

- 📊 Usage analytics dashboard  
- 🌐 Multi-language support
- 🔊 Voice message processing
- 📺 YouTube video downloads
- 🎮 Interactive games
- 📰 News updates integration
- 🤖 Advanced AI personality modes
- 📈 Extended memory analytics
- 🔄 Memory export/import features
- 🎵 Playlist conversion support

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

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary:
- ✅ **Commercial use** - You can use this commercially
- ✅ **Modification** - You can modify the code
- ✅ **Distribution** - You can distribute copies
- ✅ **Private use** - You can use privately
- 📝 **License and copyright notice** - Must include copyright notice
- 📝 **State changes** - Must document changes if modified

The MIT License is a permissive free software license that allows you to do almost anything you want with this project, as long as you include the original copyright and license notice in any copy or substantial portion of the software.

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

**Buy me a coffee**: [buymeacoffee.com/pasinduogdev](https://buymeacoffee.com/pasinduogdev)

---

**Built with ❤️ by [Pasindu Madhuwantha](https://github.com/PasinduOG)**

*"I am Iron Man" - Tony Stark* 🤖✨
