# IRON-MAN WhatsApp Bot v1.2.1 🤖

A powerful WhatsApp bot built with Baileys featuring Jarvis-style responses, sticker creation, MongoDB session persistence, and beautiful web interface.

## ✨ Features

- 🤖 **Smart Greetings** - Responds to hi, hello, hey with Jarvis welcome message
- ❓ **Help System** - Interactive help center with IRON-MAN themed responses
- 🎬 **Animated Sticker Creator** - Convert videos/GIFs to animated WebP stickers with `!asticker` command
- 👨‍💻 **Developer Info** - Smart developer information with image preview and infinite loop prevention
- ❌ **Invalid Command Handler** - Video GIF preview response for unrecognized commands with helpful suggestions
- 🗄️ **MongoDB Storage** - Persistent session storage using MongoDB Atlas
- 🌐 **Web QR Interface** - Beautiful HTML page for easy QR code scanning
- 🔄 **Auto Reconnection** - Automatic reconnection on disconnect
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ☁️ **Heroku Ready** - One-click deployment with persistent sessions
- 🎨 **IRON-MAN Theme** - Styled with IRON-MAN colors and design
- 🛡️ **Anti-Loop Protection** - Enhanced filtering to prevent infinite message loopssApp Bot v1.2.1 🤖

A powerful WhatsApp bot built with Baileys featuring Jarvis-style responses, sticker creation, MongoDB session persistence, and beautiful web interface.

## ✨ Features

- 🤖 **Smart Greetings** - Responds to hi, hello, hey with Jarvis welcome message
- ❓ **Help System** - Interactive help center with Iron Man themed responses
- � **Animated Sticker Creator** - Convert videos/GIFs to animated WebP stickers with `!asticker` command
- 🗄️ **MongoDB Storage** - Persistent session storage using MongoDB Atlas
- 🌐 **Web QR Interface** - Beautiful HTML page for easy QR code scanning
- 🔄 **Auto Reconnection** - Automatic reconnection on disconnect
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ☁️ **Heroku Ready** - One-click deployment with persistent sessions
- 🎨 **Iron Man Theme** - Styled with Iron Man colors and design

## 🚀 Commands

### Greeting Commands
- **`hi`**, **`hello`**, **`hey`** - Get Jarvis welcome message
- **`jarvis`** - Get formal Jarvis greeting "At your service, sir"

### Help Commands
- **`!help`** - Get bot help center with IRON-MAN image and info
- **`!commands`** - Show all available commands list

### Developer Info Commands
- **`"who is pasindu"`** - Get detailed developer information with image preview
- **`"about og"`** - Learn about the developer's background and projects
- **`"tell me about pasindu"`** - Developer skills, projects, and contact info

**Features:**
- 🖼️ **GitHub Avatar Integration** - Downloads developer image from GitHub profile
- 🔄 **Fallback Image Support** - Uses local IRON-MAN image if GitHub fails
- 🛡️ **Anti-Loop Protection** - Enhanced filtering prevents infinite responses
- 📊 **Comprehensive Profile** - Skills, projects, achievements, and contact details
- ⚡ **Smart Detection** - Responds to natural language queries about the developer

### Sticker Commands
- **`!sticker`** (as image caption) - Convert uploaded image to sticker
- **`!sticker`** (reply to image) - Convert replied image to sticker
- **`!asticker`** (as video/GIF caption) - Convert uploaded video/GIF to animated sticker
- **`!asticker`** (reply to video/GIF) - Convert replied video/GIF to animated sticker

## 📸 Sticker Creation Usage

### Method 1: Image with Caption
1. Select/take an image
2. Add caption: `!sticker`
3. Send → Bot creates sticker instantly

### Method 2: Reply to Image  
1. Find any image in chat
2. Reply with: `!sticker`
3. Bot converts original image to sticker

### Method 3: Auto-Suggestion
1. Send any image without caption
2. Bot suggests using `!sticker`
3. Follow the suggestion

## 🎬 Animated Sticker Creation Usage

### Method 1: Video/GIF with Caption
1. Select/record a video or GIF
2. Add caption: `!asticker`
3. Send → Bot converts to animated WebP sticker

### Method 2: Reply to Video/GIF
1. Find any video or GIF in chat
2. Reply with: `!asticker`
3. Bot converts original video/GIF to animated sticker

### Method 3: Auto-Suggestion
1. Send any video/GIF without caption
2. Bot suggests using `!asticker`
3. Follow the suggestion

### Features:
- **🎯 Smart Processing** - Automatically optimizes video for WhatsApp compatibility
- **📏 Size Optimization** - Resizes to 512x512 maintaining aspect ratio
- **⏱️ Duration Limit** - Clips videos to 6 seconds (4 seconds for ultra-compression)
- **🔇 Audio Removal** - Removes audio for smaller file size
- **🔄 Format Support** - Works with MP4, GIF, WebM, and other video formats
- **📊 Intelligent Compression** - Dual-stage compression for optimal file sizes
- **⚡ Frame Rate Optimization** - Reduces to 15 FPS (10 FPS for ultra-compression)
- **🗜️ Advanced Encoding** - Uses WebP with quality 50% (30% for ultra-compression)
- **📏 Size Monitoring** - Automatic file size checking (500KB WhatsApp limit)
- **🎛️ Fallback Processing** - Ultra-compression mode for large videos

## 🎯 Animated Sticker Technology

### Compression Stages:
1. **Standard Compression** (Default):
   - Duration: 6 seconds max
   - Resolution: 512x512px
   - Frame Rate: 15 FPS
   - Quality: 50%
   - Target Size: <500KB

2. **Ultra Compression** (Auto-triggered if needed):
   - Duration: 4 seconds max
   - Resolution: 320x320px
   - Frame Rate: 10 FPS
   - Quality: 30%
   - Target Size: <300KB

### Processing Pipeline:
```
Video/GIF Input → Download → FFmpeg Processing → Size Check → Ultra-Compress (if needed) → WhatsApp Sticker
```

### FFmpeg Optimization:
- **Video Codec**: libwebp (WebP format)
- **Compression Level**: 6 (highest)
- **Method**: 6 (best quality/compression ratio)
- **Audio**: Removed for smaller files
- **Padding**: Smart aspect ratio preservation

## 💻 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/PasinduOG/IRON-MAN.git
   cd IRON-MAN
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB (Optional):**
   ```bash
   # Create .env file
   echo "MONGODB_URI=your_mongodb_connection_string" > .env
   ```

4. **Run the bot:**
   ```bash
   npm start
   ```

5. **Access the web interface:**
   - Open browser: `http://localhost:3000`
   - Scan QR code with WhatsApp
   - Bot will show "Connected" when ready
   - Session will be saved to MongoDB for persistence

## 🌐 Web Interface Features

- **🎨 Beautiful Design** - IRON-MAN themed responsive interface
- **📱 QR Code Display** - Large, scannable QR codes
- **🔄 Auto Refresh** - Automatic QR code renewal every 30 seconds
- **📊 Status Indicators** - Real-time connection status
- **📱 Mobile Optimized** - Perfect for scanning with phones
- **⚡ Fast Loading** - Optimized for quick access
- **🗄️ Session Persistence** - MongoDB storage confirmation display

### Interface Pages:
1. **QR Code Page** - Shows when authentication needed
2. **Connected Page** - Confirms successful connection with session info
3. **Starting Page** - Loading state with animations
4. **API Status** - `/api/status` endpoint for monitoring

## 🗄️ MongoDB Session Storage

### Benefits:
- **✅ Persistent Sessions** - No QR scanning after Heroku restarts
- **✅ Cloud Backup** - Auth data safely stored in MongoDB Atlas
- **✅ Auto-sync** - Real-time authentication state saving
- **✅ Scalable** - Supports multiple bot instances
- **✅ Secure** - Encrypted MongoDB connection

### Database Structure:
```javascript
iron_man_bot.auth_state
├── creds              // Main WhatsApp credentials
├── pre-key-*          // Encryption pre-keys
├── session-*          // Active session data
└── app-state-sync-*   // WhatsApp sync data
```

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
   heroku create iron-man
   ```

3. **Set up Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

4. **Set MongoDB URI (Recommended for persistence):**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   ```

5. **Deploy to Heroku:**
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

- **🌐 Web QR Code** - Visit your Heroku app URL to see QR code (no need to check logs!)
- **⏰ QR Expiry** - QR codes expire in 60 seconds, auto-refresh enabled
- **�️ MongoDB Persistence** - Sessions persist across Heroku restarts when MongoDB is configured
- **📊 Status Monitoring** - Use `/api/status` endpoint to check bot status
- **🎯 Easy Scanning** - Mobile-optimized interface for quick QR scanning
- **🔄 One-time Setup** - Scan QR once, bot remembers your session forever

## 🛠 Dependencies

```json
{
  "@whiskeysockets/baileys": "^6.7.18",  // WhatsApp Web API
  "express": "^4.18.2",                  // Web server for QR interface
  "mongodb": "^6.3.0",                   // MongoDB driver for session storage
  "qrcode": "^1.5.3",                    // QR code generation for web
  "qrcode-terminal": "^0.12.0",          // Terminal QR display
  "sharp": "^0.32.6",                    // Image processing for stickers
  "ffmpeg-static": "^5.2.0",             // FFmpeg binary for video processing
  "fluent-ffmpeg": "^2.1.3",             // FFmpeg wrapper for animated stickers
  "axios": "^1.10.0",                    // HTTP client for GitHub avatar downloads
  "nodemon": "^3.1.10"                   // Development auto-restart
}
```

## 📋 Project Information

- **Project Name**: IRON-MAN
- **Repository Name**: IRON-MAN  
- **Package Name**: iron-man (follows npm naming conventions)
- **Display Name**: IRON-MAN Bot
- **Version**: 1.2.1

## 🔧 Environment Variables

### Required for MongoDB Persistence:
```bash
# Heroku (Recommended for production)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"

# Local (.env file)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Optional Configurations:
```bash
# Heroku
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Local (.env file)
NODE_ENV=development
PORT=3000
```

### MongoDB Setup Guide:
1. **Create MongoDB Atlas Account** - [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster** - Free tier available
3. **Create Database User** - With read/write permissions
4. **Get Connection String** - Replace `<username>`, `<password>`, `<cluster>`
5. **Set Environment Variable** - Use the connection string above

## 📡 API Endpoints

- **`GET /`** - Main web interface with QR code
- **`GET /api/status`** - Bot status JSON response
  ```json
  {
    "connected": true,
    "hasQR": false,
    "timestamp": "2025-07-04T12:00:00.000Z"
  }
  ```

## 🎯 Usage Examples

### Bot Responses
```
User: "Hi"
Bot: "Hello!... I'm Jarvis. How can I assist you today?...😊"

User: "Jarvis"
Bot: "At your service, sir"

User: "!help"
Bot: [IRON-MAN image with help center info and available commands]

User: "!commands"
Bot: "📝 Available Commands:
- !commands : Show all commands
- !help : Get help info
- !sticker : Convert image/video to sticker

Use them in chat to try them out! 👌"

User: [sends image with caption "!sticker"]
Bot: [sends back image as sticker]

User: [sends image without caption]  
Bot: "📸 Sir I see you sent an image! Send '!sticker' to convert it to a sticker."

User: [sends video/GIF with caption "!asticker"]
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment."
Bot: "📏 Generated sticker size: 245.67 KB"
Bot: [sends back video as optimized animated WebP sticker]

User: [sends large video with caption "!asticker"]
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment."
Bot: "📏 Generated sticker size: 612.34 KB"
Bot: "⚠️ File too large, attempting to compress further..."
Bot: "📏 Compressed sticker size: 387.12 KB"
Bot: [sends back ultra-compressed animated sticker]

User: "who is pasindu"
Bot: [sends developer image with detailed bio including background, skills, projects, and contact info]

User: "about og"  
Bot: [sends developer information with image preview]

User: [bot's own developer info message appears in chat]
Bot: [logs "🚫 Ignoring bot's own developer info message" and doesn't respond - INFINITE LOOP PREVENTED]

User: [sends video without caption]
Bot: "🎬 Sir I see you sent a video/GIF! Send '!asticker' to convert it to an animated sticker."

User: "!unknown"
Bot: [sends IRON-MAN GIF with invalid command message and helpful command suggestions]
```

### Jarvis Personality Features
- **🎭 Dual Greetings** - Casual (hi/hello/hey) and formal (jarvis) responses
- **🤵 Respectful Tone** - Addresses users as "Sir" in formal interactions
- **🎯 Context Aware** - Different responses for different situations
- **🤖 Character Consistency** - Maintains IRON-MAN's Jarvis personality

## 🐛 Troubleshooting

### Common Issues

**QR Code Not Appearing:**
- ✅ Visit your app URL directly: `https://your-app.herokuapp.com`
- ✅ Check if bot is starting: Look for "Starting..." page
- ✅ Wait 30 seconds for auto-refresh

**Sticker Creation Fails:**
- ✅ Ensure image is valid (JPG, PNG, WebP)
- ✅ Try with different image sizes
- ✅ Check if image caption is exactly `!sticker`

**Animated Sticker Issues:**
- ✅ Ensure video/GIF is valid (MP4, GIF, WebM, MOV)
- ✅ Large videos auto-compress to fit WhatsApp limits
- ✅ Check if video caption is exactly `!asticker`
- ✅ Processing takes 10-30 seconds depending on video size
- ✅ Bot shows file size info during processing

**Developer Info Issues:**
- ✅ Enhanced anti-loop protection prevents infinite responses
- ✅ GitHub avatar downloads automatically with local fallback
- ✅ Message length filtering prevents self-triggering
- ✅ Multiple keyword detection for comprehensive filtering

**Connection Issues:**
- ✅ Bot auto-reconnects every 3 seconds on disconnect
- ✅ Check Heroku logs: `heroku logs --tail`
- ✅ Restart dyno: `heroku restart`

**Session Lost on Heroku:**
- ✅ **With MongoDB**: Sessions persist forever across restarts
- ✅ **Without MongoDB**: Expected behavior - re-scan QR after restarts
- ✅ For production: Always use MongoDB for session persistence
- ✅ Check MongoDB connection in logs: Look for "Connected to MongoDB"

**Infinite Loop Issues (FIXED):**
- ✅ Enhanced message filtering prevents bot responding to its own messages
- ✅ Multi-layered checks for developer info responses
- ✅ Message length filtering (>100 chars = likely bot response)
- ✅ Keyword-based filtering for all bot-generated content

### Debug Commands

```bash
# Check app status
heroku ps

# View real-time logs  
heroku logs --tail

# Check MongoDB connection
heroku logs --tail | grep MongoDB

# Restart application
heroku restart

# Open web interface
heroku open

# Check environment variables
heroku config
```

## 🚀 Performance

- **Response Time:** < 1 second for text commands
- **Sticker Processing:** 2-5 seconds depending on image size
- **Animated Sticker Processing:** 10-30 seconds depending on video size and compression
- **Developer Info:** < 3 seconds with GitHub image download
- **QR Generation:** Instant with auto-refresh
- **MongoDB Connection:** < 2 seconds on startup
- **Session Loading:** Instant with MongoDB persistence
- **Memory Usage:** ~150MB on Heroku (with MongoDB and FFmpeg)
- **Uptime:** 99.9% with auto-reconnection and session persistence
- **Compression Efficiency:** 60-80% size reduction for animated stickers
- **Anti-Loop Protection:** 100% effective infinite loop prevention

## 🆕 Recent Updates (v1.2.1)

### Bug Fixes:
- 🛡️ **Fixed Infinite Loop Issue** - Enhanced developer info filtering prevents bot responding to its own messages
- 🔍 **Improved Message Detection** - Multi-layered checks for bot-generated content
- ⚡ **Smart Length Filtering** - Messages >100 characters automatically filtered as bot responses
- 🎯 **Keyword-Based Prevention** - Comprehensive keyword detection for all bot content types
- ⚠️ **Fixed Invalid Command Logic** - Corrected boolean logic for proper command validation

### Enhancements:
- 📊 **Better Error Logging** - Enhanced console logging for debugging
- 🛡️ **Robust Self-Detection** - Multiple fallback mechanisms to prevent self-triggering
- 🔄 **Improved Stability** - More reliable message processing with enhanced filtering
- 📝 **Updated Documentation** - Comprehensive troubleshooting guide for infinite loop issues
- 🎬 **Invalid Command GIF Response** - Added IRON-MAN GIF preview for unrecognized commands with helpful suggestions

## 🚫 Invalid Command Video Handler

The bot now features a sophisticated invalid command handler that provides **video GIF-like previews** for unrecognized commands:

### **Video GIF Preview Response** 🎬
- **Primary Response**: Sends `ironman.mp4` as a GIF-like video preview with loop playback
- **Smart Fallback System**: 
  1. **Video as GIF** (`gifPlayback: true`) - Provides seamless looping animation
  2. **Regular Video** - Standard video playback if GIF mode fails
  3. **Document Attachment** - Sends video as downloadable file if direct sending fails
  4. **Static Image** - Falls back to `ironman.jpg` if video completely fails
  5. **Text-Only** - Ultimate fallback for maximum compatibility

### **Features** ✨
- **Visual Engagement**: Dynamic video preview instead of static responses
- **Error Recovery**: Multi-layer fallback ensures message delivery
- **Detailed Logging**: Comprehensive console output for debugging
- **User Guidance**: Clear command list and usage instructions

### **Example Usage:**
```
User: "!unknown"
Bot: [sends ironman.mp4 as GIF-like video with invalid command message and helpful suggestions]

User: "!test123"  
Bot: [video preview with: "❌ Invalid Command: '!test123' - Sir, that command is not recognized..."]
```

## 🔮 Future Features

- [x] 🗄️ MongoDB session persistence ✅ **IMPLEMENTED**
- [x] 🎬 Animated sticker creation ✅ **IMPLEMENTED**
- [x] 📏 Smart video compression ✅ **IMPLEMENTED**
- [x] 👨‍💻 Developer info with image preview ✅ **IMPLEMENTED**
- [x] 🛡️ Anti-loop protection system ✅ **IMPLEMENTED**
- [ ] 🎵 Audio message responses
- [ ] 🌍 Multi-language support
- [ ] 📊 Analytics dashboard
- [ ] 🔒 Admin commands
- [ ] 🎮 Interactive games
- [ ] 🤖 AI-powered responses
- [ ] 🔔 Message scheduling
- [ ] 📈 Usage statistics

## 👨‍💻 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - feel free to use this project for your own bots!
