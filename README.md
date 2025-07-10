# IRON-MAN WhatsApp Bot v1.2.2 🤖

A powerful WhatsApp bot built with Baileys featuring Jarvis-style responses, sticker creation, MongoDB session persistence, Google Gemini AI integration, and beautiful web interface.

## ✨ Features

- 🤖 **Smart Greetings** - Responds to hi, hello, hey with Jarvis welcome message
- 🧠 **AI-Powered Jarvis** - Google Gemini AI integration for intelligent responses with Jarvis personality
- ❓ **Help System** - Interactive help center with IRON-MAN themed responses
- 🎯 **Unified Sticker Creator** - Convert images to static stickers and videos/GIFs to animated WebP stickers with single `!sticker` command
- 👨‍💻 **Developer Info** - Smart developer information with image preview and infinite loop prevention
- ❌ **Invalid Command Handler** - Video GIF preview response for unrecognized commands with helpful suggestions
- 🗄️ **MongoDB Storage** - Persistent session storage using MongoDB Atlas
- 🌐 **Web QR Interface** - Beautiful HTML page for easy QR code scanning
- 🔄 **Auto Reconnection** - Automatic reconnection on disconnect
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ☁️ **Heroku Ready** - One-click deployment with persistent sessions
- 🎨 **IRON-MAN Theme** - Styled with IRON-MAN colors and design
- 🛡️ **Anti-Loop Protection** - Enhanced filtering to prevent infinite message loops

## 🚀 Commands

### Greeting Commands
- **`hi`**, **`hello`**, **`hey`** - Get Jarvis welcome message
- **`jarvis`** - Get formal Jarvis greeting "At your service, sir"

### AI Commands
- **`!jarvis [message]`** - Get AI-powered responses from Jarvis using Google Gemini
  - Example: `!jarvis what is artificial intelligence?`
  - Example: `!jarvis explain quantum computing`
  - Example: `!jarvis how do I code in JavaScript?`

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

### Method 3: Auto-Suggestion
1. Send any image, video, or GIF without caption
2. Bot suggests using `!sticker`
3. Follow the suggestion

## 🎬 Sticker Creation Features

### Static Sticker Features (Images):
- **🖼️ Image Processing** - Converts JPG, PNG, WebP to sticker format
- **📐 Smart Resizing** - Automatically resizes to 512x512 with proper aspect ratio
- **🔳 Transparent Background** - Maintains transparency where applicable
- **⚡ Fast Processing** - Instant conversion using Sharp library

### Animated Sticker Features (Videos/GIFs):
- **🎯 Smart Processing** - Automatically optimizes video for WhatsApp compatibility
- **� Original Dimensions** - Preserves video/GIF original width and height (no forced scaling)
- **🔳 Transparency Preservation** - Maintains transparent backgrounds, removes white padding
- **⏱️ Configurable Duration** - Customizable max animation length (default: 10 seconds)
- **🔇 Audio Removal** - Removes audio for smaller file size
- **🔄 Format Support** - Works with MP4, GIF, WebM, and other video formats
- **📊 Intelligent Compression** - Dual-stage compression for optimal file sizes
- **⚡ Frame Rate Optimization** - Optimized FPS (15 FPS standard, 12 FPS compressed)
- **🗜️ Advanced Encoding** - Uses WebP with enhanced quality settings
- **📏 Size Monitoring** - Automatic file size checking (500KB WhatsApp limit)
- **🎛️ Adaptive Processing** - Smart scaling only when absolutely necessary
- **⚙️ Easy Configuration** - Simple constants for duration adjustment

## 🎯 Animated Sticker Technology

### Duration Configuration:
```javascript
// Easy-to-modify constants in index.js
const MAX_STICKER_DURATION = 10;           // Standard processing (adjustable)
const MAX_STICKER_DURATION_COMPRESSED = 6; // Ultra-compression (adjustable)
```

### Compression Stages:
1. **Standard Processing** (Default):
   - Duration: Configurable (default: 10 seconds)
   - Resolution: **Original video dimensions preserved**
   - Frame Rate: 15 FPS
   - Quality: 60% (enhanced for original dimensions)
   - Background: **Transparent, no padding**
   - Target Size: <500KB

2. **Ultra Compression** (Auto-triggered if needed):
   - Duration: Configurable (default: 6 seconds)
   - Resolution: **400x400 max with aspect ratio preservation**
   - Frame Rate: 12 FPS
   - Quality: 40% (balanced quality)
   - Background: **Transparent, no padding**
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
- **Dimensions**: **Original video dimensions preserved**
- **Background**: **Transparent, no white padding**
- **Duration Control**: Configurable max length with user notification
- **Aspect Ratio**: **Maintained without distortion**

### Advanced Processing Features:
- **🔳 Transparency Preservation**: No white backgrounds added, maintains original transparency
- **📐 Original Dimensions**: Uses video's natural width/height instead of forced square format
- **🎯 Smart Scaling**: Only scales down when absolutely necessary for file size
- **🔄 Aspect Ratio Protection**: Never distorts or stretches the original content
- **⚡ Enhanced Quality**: Higher quality settings since we're not forcing small dimensions

### Configuration Guide:
To adjust animation duration limits, modify these constants in `index.js`:
```javascript
const MAX_STICKER_DURATION = 10;           // Change to desired seconds
const MAX_STICKER_DURATION_COMPRESSED = 6; // Change for compressed version
```

**Benefits of Enhanced Processing:**
- ⚡ **Faster Processing** - Shorter durations = quicker conversion
- 📱 **Better Compatibility** - Fits WhatsApp's size and performance limits
- 🎯 **User Awareness** - Bot informs users about duration limits
- 🔧 **Easy Adjustment** - Simple constants for quick changes
- 📊 **Optimal Performance** - Balances quality and file size
- 🔳 **Professional Quality** - No unwanted backgrounds or distortion
- 📐 **Original Fidelity** - Preserves creator's intended dimensions and transparency

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

3. **Set up MongoDB & Gemini AI (Optional):**
   ```bash
   # Create .env file
   echo "MONGODB_URI=your_mongodb_connection_string" > .env
   echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
   ```
   
   **To get Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key to your `.env` file

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
- **Version**: 1.2.2

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
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.
⏱️ Maximum duration: 10 seconds"
Bot: "� Using original video dimensions (no forced scaling)"
Bot: "�📏 Generated sticker size: 245.67 KB"
Bot: [sends back video as optimized animated WebP sticker with original dimensions and transparency]

User: [sends large video with caption "!asticker"]
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.
⏱️ Maximum duration: 10 seconds"
Bot: "� Using original video dimensions (no forced scaling)"
Bot: "�📏 Generated sticker size: 612.34 KB"
Bot: "⚠️ File too large, attempting to compress further..."
Bot: "📐 Using moderate scaling (400x400 max) preserving aspect ratio"
Bot: "📏 Compressed sticker size: 387.12 KB"
Bot: [sends back ultra-compressed animated sticker with preserved aspect ratio and transparency]

User: "who is pasindu"
Bot: [sends developer image with detailed bio including background, skills, projects, and contact info]

User: "about og"  
Bot: [sends developer information with image preview]

User: [bot's own developer info message appears in chat]
Bot: [logs "🚫 Ignoring bot's own developer info message" and doesn't respond - INFINITE LOOP PREVENTED]

User: [sends video without caption]
Bot: "🎬 Sir I see you sent a video/GIF! Send '!sticker' to convert it to an animated sticker."

User: "!unknown"
Bot: [sends IRON-MAN GIF with invalid command message and helpful suggestions]
```

### AI-Powered Jarvis Examples
```
User: "!jarvis what is artificial intelligence?"
Bot: "🤖 Jarvis is thinking..."
Bot: "🤖 Jarvis AI Response: Sir, artificial intelligence refers to the simulation of human intelligence in machines..."

User: "!jarvis explain quantum computing"
Bot: "🤖 Jarvis AI Response: Certainly, Sir. Quantum computing represents a revolutionary approach..."

User: "!jarvis how do I learn JavaScript?"
Bot: "🤖 Jarvis AI Response: An excellent choice, Sir. JavaScript is fundamental for modern web development..."
```

### Developer Info Features
- 🖼️ **GitHub Avatar Integration** - Downloads developer image from GitHub profile
- 🔄 **Fallback Image Support** - Uses local IRON-MAN image if GitHub fails
- 🛡️ **Anti-Loop Protection** - Enhanced filtering prevents infinite responses
- 📊 **Comprehensive Profile** - Skills, projects, achievements, and contact details
- ⚡ **Smart Detection** - Responds to natural language queries about the developer

### Sticker Commands
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

### Method 3: Auto-Suggestion
1. Send any image, video, or GIF without caption
2. Bot suggests using `!sticker`
3. Follow the suggestion

## 🎬 Sticker Creation Features

### Static Sticker Features (Images):
- **🖼️ Image Processing** - Converts JPG, PNG, WebP to sticker format
- **📐 Smart Resizing** - Automatically resizes to 512x512 with proper aspect ratio
- **🔳 Transparent Background** - Maintains transparency where applicable
- **⚡ Fast Processing** - Instant conversion using Sharp library

### Animated Sticker Features (Videos/GIFs):
- **🎯 Smart Processing** - Automatically optimizes video for WhatsApp compatibility
- **� Original Dimensions** - Preserves video/GIF original width and height (no forced scaling)
- **🔳 Transparency Preservation** - Maintains transparent backgrounds, removes white padding
- **⏱️ Configurable Duration** - Customizable max animation length (default: 10 seconds)
- **🔇 Audio Removal** - Removes audio for smaller file size
- **🔄 Format Support** - Works with MP4, GIF, WebM, and other video formats
- **📊 Intelligent Compression** - Dual-stage compression for optimal file sizes
- **⚡ Frame Rate Optimization** - Optimized FPS (15 FPS standard, 12 FPS compressed)
- **🗜️ Advanced Encoding** - Uses WebP with enhanced quality settings
- **📏 Size Monitoring** - Automatic file size checking (500KB WhatsApp limit)
- **🎛️ Adaptive Processing** - Smart scaling only when absolutely necessary
- **⚙️ Easy Configuration** - Simple constants for duration adjustment

## 🎯 Animated Sticker Technology

### Duration Configuration:
```javascript
// Easy-to-modify constants in index.js
const MAX_STICKER_DURATION = 10;           // Standard processing (adjustable)
const MAX_STICKER_DURATION_COMPRESSED = 6; // Ultra-compression (adjustable)
```

### Compression Stages:
1. **Standard Processing** (Default):
   - Duration: Configurable (default: 10 seconds)
   - Resolution: **Original video dimensions preserved**
   - Frame Rate: 15 FPS
   - Quality: 60% (enhanced for original dimensions)
   - Background: **Transparent, no padding**
   - Target Size: <500KB

2. **Ultra Compression** (Auto-triggered if needed):
   - Duration: Configurable (default: 6 seconds)
   - Resolution: **400x400 max with aspect ratio preservation**
   - Frame Rate: 12 FPS
   - Quality: 40% (balanced quality)
   - Background: **Transparent, no padding**
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
- **Dimensions**: **Original video dimensions preserved**
- **Background**: **Transparent, no white padding**
- **Duration Control**: Configurable max length with user notification
- **Aspect Ratio**: **Maintained without distortion**

### Advanced Processing Features:
- **🔳 Transparency Preservation**: No white backgrounds added, maintains original transparency
- **📐 Original Dimensions**: Uses video's natural width/height instead of forced square format
- **🎯 Smart Scaling**: Only scales down when absolutely necessary for file size
- **🔄 Aspect Ratio Protection**: Never distorts or stretches the original content
- **⚡ Enhanced Quality**: Higher quality settings since we're not forcing small dimensions

### Configuration Guide:
To adjust animation duration limits, modify these constants in `index.js`:
```javascript
const MAX_STICKER_DURATION = 10;           // Change to desired seconds
const MAX_STICKER_DURATION_COMPRESSED = 6; // Change for compressed version
```

**Benefits of Enhanced Processing:**
- ⚡ **Faster Processing** - Shorter durations = quicker conversion
- 📱 **Better Compatibility** - Fits WhatsApp's size and performance limits
- 🎯 **User Awareness** - Bot informs users about duration limits
- 🔧 **Easy Adjustment** - Simple constants for quick changes
- 📊 **Optimal Performance** - Balances quality and file size
- 🔳 **Professional Quality** - No unwanted backgrounds or distortion
- 📐 **Original Fidelity** - Preserves creator's intended dimensions and transparency

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

3. **Set up MongoDB & Gemini AI (Optional):**
   ```bash
   # Create .env file
   echo "MONGODB_URI=your_mongodb_connection_string" > .env
   echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
   ```
   
   **To get Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key to your `.env` file

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
- **Version**: 1.2.2

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
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.
⏱️ Maximum duration: 10 seconds"
Bot: "� Using original video dimensions (no forced scaling)"
Bot: "�📏 Generated sticker size: 245.67 KB"
Bot: [sends back video as optimized animated WebP sticker with original dimensions and transparency]

User: [sends large video with caption "!asticker"]
Bot: "🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.
⏱️ Maximum duration: 10 seconds"
Bot: "� Using original video dimensions (no forced scaling)"
Bot: "�📏 Generated sticker size: 612.34 KB"
Bot: "⚠️ File too large, attempting to compress further..."
Bot: "📐 Using moderate scaling (400x400 max) preserving aspect ratio"
Bot: "📏 Compressed sticker size: 387.12 KB"
Bot: [sends back ultra-compressed animated sticker with preserved aspect ratio and transparency]

User: "who is pasindu"
Bot: [sends developer image with detailed bio including background, skills, projects, and contact info]

User: "about og"  
Bot: [sends developer information with image preview]

User: [bot's own developer info message appears in chat]
Bot: [logs "🚫 Ignoring bot's own developer info message" and doesn't respond - INFINITE LOOP PREVENTED]

User: [sends video without caption]
Bot: "🎬 Sir I see you sent a video/GIF! Send '!sticker' to convert it to an animated sticker."

User: "!unknown"
Bot: [sends IRON-MAN GIF with invalid command message and helpful suggestions]
```

### AI-Powered Jarvis Examples
```
User: "!jarvis what is artificial intelligence?"
Bot: "🤖 Jarvis is thinking..."
Bot: "🤖 Jarvis AI Response: Sir, artificial intelligence refers to the simulation of human intelligence in machines..."

User: "!jarvis explain quantum computing"
Bot: "🤖 Jarvis AI Response: Certainly, Sir. Quantum computing represents a revolutionary approach..."

User: "!jarvis how do I learn JavaScript?"
Bot: "🤖 Jarvis AI Response: An excellent choice, Sir. JavaScript is fundamental for modern web development..."
```