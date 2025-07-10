const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { useMongoDBAuthState } = require('./mongoAuth');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const Pino = require('pino');
const fs = require('fs');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const axios = require('axios');

// Load environment variables from .env file
require('dotenv').config();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// GitHub Profile Configuration
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'PasinduOG';
let githubProfileCache = null;
let githubProfileCacheTime = 0;
const GITHUB_CACHE_DURATION = 3600000; // 1 hour cache

// Dynamic GitHub Profile Fetching
async function fetchGithubProfile(username = GITHUB_USERNAME) {
    const now = Date.now();
    
    // Return cached data if still valid
    if (githubProfileCache && (now - githubProfileCacheTime) < GITHUB_CACHE_DURATION) {
        return githubProfileCache;
    }

    try {
        console.log(`🔄 Fetching GitHub profile for @${username}...`);
        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                'User-Agent': 'IRON-MAN-Bot/1.0'
            },
            timeout: 10000
        });

        if (response.status === 200) {
            githubProfileCache = response.data;
            githubProfileCacheTime = now;
            console.log(`✅ GitHub profile fetched successfully for @${username}`);
            return githubProfileCache;
        }
    } catch (error) {
        console.error(`❌ Error fetching GitHub profile for @${username}:`, error.message);
        
        // Return fallback data if API fails
        return {
            login: username,
            name: 'Pasindu Madhuwantha',
            bio: 'Interest for Backend Programming with a deep passion for exploring and researching cutting-edge technologies',
            company: '@KreedXDevClub',
            location: 'Kalutara',
            blog: 'https://pasindu.kreedx.com',
            public_repos: 20,
            followers: 19,
            following: 19,
            avatar_url: 'https://avatars.githubusercontent.com/u/126347762?v=4',
            html_url: 'https://github.com/PasinduOG',
            created_at: '2023-02-25T17:14:28Z',
            updated_at: new Date().toISOString()
        };
    }
}

// Generate dynamic developer info from GitHub profile
async function generateDeveloperInfo(profileData) {
    const joinDate = new Date(profileData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const accountAge = Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    return `👨‍💻 *About ${profileData.name || profileData.login}*\n\n` +
        `${profileData.bio ? `📝 *Bio:* ${profileData.bio}\n\n` : ''}` +
        `🌟 *Professional Background:*\n` +
        `• Passionate Backend Developer & Technology Enthusiast\n` +
        `• Currently learning New Technologies and Microservices\n` +
        `• Self-taught programmer with expertise in modern web technologies\n` +
        `• Specializes in Backend Development and API Architecture\n` +
        `• Active open-source contributor and project creator\n\n` +

        `💻 *Technical Skills:*\n` +
        `• Core: JavaScript, Node.js, Express.js, PHP, Python, Java\n` +
        `• Frontend: HTML, CSS, React, Vite, Bootstrap, Tailwind CSS\n` +
        `• Backend: Node.js, Express, Spring Boot, Hibernate\n` +
        `• Database: MySQL, MongoDB, Firebase\n` +
        `• Tools: Git, GitHub, VS Code, Unity, WordPress\n` +
        `• Cloud & Deployment: Heroku, MongoDB Atlas, Vercel\n\n` +

        `🚀 *Notable Projects:*\n` +
        `• IRON-MAN - Advanced WhatsApp Bot with AI & Sticker Creation\n` +
        `• MASTER-CHIEF - WhatsApp Sticker & Command Bot\n` +
        `• YouTube Downloader - Web application for video/audio downloads\n` +
        `• Facebook Video Downloader - Social media content extraction tool\n` +
        `• Express API Projects - RESTful APIs with validation & security\n` +
        `• Microservices Architecture - Scalable backend solutions\n\n` +

        `📊 *GitHub Stats (Live):*\n` +
        `• Public Repositories: ${profileData.public_repos}\n` +
        `• Followers: ${profileData.followers}\n` +
        `• Following: ${profileData.following}\n` +
        `• GitHub Member Since: ${joinDate}\n` +
        `• Account Age: ${accountAge} days\n` +
        `• Profile Last Updated: ${new Date(profileData.updated_at).toLocaleDateString()}\n\n` +

        `🌐 *Connect & Contact:*\n` +
        `• GitHub: @${profileData.login}\n` +
        `• Profile URL: ${profileData.html_url}\n` +
        `• Email: pasinduogdev@gmail.com\n` +
        `• Discord: pasinduogdev\n` +
        `• Facebook: pasindu.og.dev\n` +
        `${profileData.location ? `• Location: ${profileData.location}\n` : ''}` +
        `${profileData.blog ? `• Website: ${profileData.blog}\n` : ''}` +
        `${profileData.company ? `• Company: ${profileData.company}\n` : ''}\n` +

        `⚡ *Personal Touch:*\n` +
        `• Quote: "I hate frontends" (Backend developer at heart!)\n` +
        `• Passion for exploring cutting-edge technologies\n` +
        `• Continuous learner with focus on microservices\n` +
        `• Creator of innovative WhatsApp bot solutions\n` +
        `• Believes in clean code and efficient architecture\n\n` +

        `🎯 *Current Focus:*\n` +
        `• Mastering MERN stack development\n` +
        `• Exploring Java EE and Spring Boot frameworks\n` +
        `• Building scalable microservices architecture\n` +
        `• Contributing to open-source projects\n\n` +

        `🔗 *Support & Collaboration:*\n` +
        `• Buy Me a Coffee: buymeacoffee.com/pasinduogdev\n` +
        `• Open to collaborations and new opportunities\n` +
        `• Available for backend development projects\n` +
        `• Mentoring in Node.js and API development\n\n` +

        `*Built with ❤️ by ${profileData.name || profileData.login}*`;
}

// Generate fallback developer info (shorter version for text-only)
async function generateDeveloperInfoFallback(profileData) {
    const joinDate = new Date(profileData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
    
    return `👨‍💻 *About ${profileData.name || profileData.login}*\n\n` +
        `${profileData.bio ? `📝 *Bio:* ${profileData.bio}\n\n` : ''}` +
        `🌟 *Professional Background:*\n` +
        `• Passionate Backend Developer & Technology Enthusiast\n` +
        `• Currently learning New Technologies and Microservices\n` +
        `• Self-taught programmer with expertise in modern web technologies\n\n` +

        `💻 *Core Skills:*\n` +
        `• JavaScript, Node.js, Express.js, PHP, Python, Java\n` +
        `• Frontend: React, HTML, CSS, Bootstrap, Tailwind\n` +
        `• Database: MySQL, MongoDB, Firebase\n` +
        `• Tools: Git, GitHub, VS Code, Unity\n\n` +

        `🚀 *Notable Projects:*\n` +
        `• IRON-MAN - Advanced WhatsApp Bot with AI Integration\n` +
        `• MASTER-CHIEF - WhatsApp Sticker & Command Bot\n` +
        `• YouTube & Facebook Video Downloaders\n` +
        `• Express API Projects with RESTful architecture\n\n` +

        `📊 *GitHub Stats:*\n` +
        `• ${profileData.public_repos} Public Repos | ${profileData.followers} Followers\n` +
        `• Member Since: ${joinDate}\n\n` +

        `🌐 *Connect:*\n` +
        `• GitHub: @${profileData.login}\n` +
        `• Email: pasinduogdev@gmail.com\n` +
        `• Discord: pasinduogdev\n` +
        `• Facebook: pasindu.og.dev\n` +
        `${profileData.location ? `• Location: ${profileData.location}\n` : ''}` +
        `${profileData.blog ? `• Website: ${profileData.blog}\n` : ''}\n` +

        `⚡ *Fun Fact:* "I hate frontends" (Backend developer at heart!)\n\n` +

        `🔗 *Support:* buymeacoffee.com/pasinduogdev\n\n` +

        `*Built with ❤️ by ${profileData.name || profileData.login}*`;
}

// ...existing code...

const welcomeMessage = "Hello!... I'm Jarvis. How can I assist you today?...😊";
const greetingMessge = "At your service, sir";

// Animated Sticker Configuration
const MAX_STICKER_DURATION = 10; // Maximum animation length in seconds (adjustable)
const MAX_STICKER_DURATION_COMPRESSED = 6; // Maximum duration for compressed stickers

// AI Chat Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here';

// Multi-user management
const userSessions = new Map(); // Store user session data
const userRateLimits = new Map(); // Store user rate limiting data
const activeProcesses = new Map(); // Track active processing per user

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per user
const AI_COOLDOWN = 3000; // 3 seconds between AI requests per user
const STICKER_COOLDOWN = 5000; // 5 seconds between sticker requests per user

// Rate limiting helper
function checkRateLimit(userId, type = 'general') {
    const now = Date.now();
    const userKey = `${userId}_${type}`;
    
    if (!userRateLimits.has(userKey)) {
        userRateLimits.set(userKey, { count: 0, resetTime: now + RATE_LIMIT_WINDOW, lastRequest: 0 });
    }
    
    const userLimit = userRateLimits.get(userKey);
    
    // Reset counter if window expired
    if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    // Check specific cooldowns
    if (type === 'ai' && (now - userLimit.lastRequest) < AI_COOLDOWN) {
        return { allowed: false, reason: `Please wait ${Math.ceil((AI_COOLDOWN - (now - userLimit.lastRequest)) / 1000)} seconds before using AI again` };
    }
    
    if (type === 'sticker' && (now - userLimit.lastRequest) < STICKER_COOLDOWN) {
        return { allowed: false, reason: `Please wait ${Math.ceil((STICKER_COOLDOWN - (now - userLimit.lastRequest)) / 1000)} seconds before creating another sticker` };
    }
    
    // Check general rate limit
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, reason: 'Rate limit exceeded. Please wait a moment before sending more commands.' };
    }
    
    userLimit.count++;
    userLimit.lastRequest = now;
    return { allowed: true };
}

// User session helper
function getUserSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            id: userId,
            joinedAt: Date.now(),
            messageCount: 0,
            lastActivity: Date.now(),
            preferences: {}
        });
    }
    
    const session = userSessions.get(userId);
    session.lastActivity = Date.now();
    session.messageCount++;
    return session;
}

// Clean up inactive sessions (run periodically)
function cleanupInactiveSessions() {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.lastActivity > INACTIVE_THRESHOLD) {
            userSessions.delete(userId);
            userRateLimits.delete(`${userId}_general`);
            userRateLimits.delete(`${userId}_ai`);
            userRateLimits.delete(`${userId}_sticker`);
            activeProcesses.delete(userId);
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupInactiveSessions, 10 * 60 * 1000);

// Enhanced AI Chat Handler with better multi-user support
async function handleChatCommand(client, msg, args) {
    const userId = msg.key.remoteJid;
    const prompt = args.join(" ");
    
    if (!prompt) return client.sendMessage(userId, { text: "❌ Usage: !jarvis <prompt>" });

    // Check rate limiting
    const rateCheck = checkRateLimit(userId, 'ai');
    if (!rateCheck.allowed) {
        return client.sendMessage(userId, { text: `⏰ ${rateCheck.reason}` });
    }

    // Check if user already has an active AI request
    if (activeProcesses.has(`${userId}_ai`)) {
        return client.sendMessage(userId, { text: "🤖 Please wait, I'm still processing your previous request..." });
    }

    // Mark as active
    activeProcesses.set(`${userId}_ai`, Date.now());
    
    // Get user session
    const session = getUserSession(userId);
    
    try {
        // Send thinking message
        await client.sendMessage(userId, { text: "🤖 Thinking..." });

        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { timeout: 30000 } // 30 second timeout
        );

        const aiReply = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 No response.";
        await client.sendMessage(userId, {
            text: `🤖 *Jarvis Response:*\n\n${aiReply}`
        });
        
        console.log(`✅ AI response sent to user ${session.id} (Message #${session.messageCount})`);
        
    } catch (err) {
        console.error(`❌ Gemini error for user ${userId}:`, err.message);
        
        let errorMessage = "❌ Error with Gemini AI.";
        if (err.code === 'ECONNABORTED') {
            errorMessage = "⏰ AI request timed out. Please try again with a shorter prompt.";
        } else if (err.response?.status === 429) {
            errorMessage = "🚫 AI service is busy. Please try again in a few moments.";
        }
        
        client.sendMessage(userId, { text: errorMessage });
    } finally {
        // Remove from active processes
        activeProcesses.delete(`${userId}_ai`);
    }
}

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pasinduogdev:PasinduDev678@cluster0.4ns3c.mongodb.net/iron-man-bot';

// For Heroku deployment - Please don't edit this code (Use .env instead)
const PORT = process.env.PORT || 3000;

// Store QR code data
let currentQR = null;
let isConnected = false;

async function startBot() {
    const { state, saveCreds } = await useMongoDBAuthState(MONGODB_URI);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        logger: Pino({ level: 'silent' })
        // printQRInTerminal: true - **Deprecated**
    });

    // WhatsApp connection
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // If WhatsApp is not linked an account
        if (qr) {
            // Display QR in terminal
            qrcode.generate(qr, { small: true });
            console.log('Scan the QR code above with your WhatsApp');

            // Store QR for web display
            currentQR = qr;
            isConnected = false;
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                // Restart the connection
                setTimeout(() => {
                    console.log('🔄 Reconnecting...');
                    startBot();
                }, 3000);
            }
        } else if (connection === 'open') {
            console.log('✅ Jarvis: online and ready for multi-user interactions');
            console.log(`📊 System ready: ${userSessions.size} active sessions`);
            currentQR = null;
            isConnected = true;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Handle message commands
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        // Ignore messages from the bot itself to prevent infinite loops
        if (msg.key.fromMe) return;

        const userId = msg.key.remoteJid;
        const senderName = msg.pushName || 'User';
        
        // Get or create user session
        const userSession = getUserSession(userId);
        
        console.log(`📨 Message #${userSession.messageCount} from ${senderName} (${userId})`);

        // Extract message text from different message types
        const messageText = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.gifMessage?.caption ||
            '';

        // Check general rate limiting for commands
        if (messageText.startsWith('!')) {
            const rateCheck = checkRateLimit(userId, 'general');
            if (!rateCheck.allowed) {
                return sock.sendMessage(userId, { text: `⏰ ${rateCheck.reason}` });
            }
        }

        const welcomeRegex = /^(hi|hello|hey)(\s|$)/i;
        const greetingRegex = /^(jarvis)(\s|$)/i;

        if (welcomeRegex.test(messageText)) {
            sock.sendMessage(userId, { text: welcomeMessage });
        }

        if (greetingRegex.test(messageText)) {
            sock.sendMessage(userId, { text: greetingMessge });
        }

        if (messageText === '!help') {
            const imageBuffer = fs.readFileSync('./src/ironman.jpg') // your image path

            await sock.sendMessage(userId, {
                image: imageBuffer,
                caption: `🤖 *IRON-MAN Bot Help Center*

Available Commands:
- *!commands* : List all commands
- *!sticker* : Convert image/video/GIF to sticker
- *!jarvis <prompt>* : Get AI-powered responses

⚙️ Bot created by *Pasindu OG Dev*
📌 Version: 1.3.0
👤 Session: ${userSession.messageCount} messages`
            });
        }

        if (messageText === '!commands') {
            await sock.sendMessage(userId, {
                text: `📝 Available Commands:
- hi, hello, hey : Casual Jarvis greeting
- jarvis : Formal greeting  
- !commands : Show all commands
- !help : Get help info
- !sticker : Convert image/video/GIF to sticker
- !jarvis <prompt> : Get AI-powered responses
- !stats : Show your usage statistics

👤 Your session: ${userSession.messageCount} messages
Use them in chat to try them out! 👌` })
        }

        if (messageText === '!stats') {
            const joinedAgo = Math.floor((Date.now() - userSession.joinedAt) / 1000 / 60); // minutes
            const lastActiveAgo = Math.floor((Date.now() - userSession.lastActivity) / 1000); // seconds
            
            await sock.sendMessage(userId, {
                text: `📊 *Your Bot Statistics*

👤 *User Session:*
• Messages sent: ${userSession.messageCount}
• Joined: ${joinedAgo} minutes ago
• Last active: ${lastActiveAgo} seconds ago

🤖 *Bot Status:*
• Total active users: ${userSessions.size}
• Active processes: ${activeProcesses.size}
• Your session ID: ${userSession.id.substring(0, 15)}***

⚡ *Rate Limits:*
• General commands: Available
• AI requests: Available  
• Sticker creation: Available

🎯 Keep chatting with IRON-MAN Bot!`
            });
        }

        if (messageText.startsWith('!aboutdev')) {
            console.log(`👨‍💻 Developer info requested by ${senderName} (Session: ${userSession.messageCount})`);

            // Enhanced check to prevent responding to bot's own captions and messages
            if (messageText.includes('Built with ❤️ by Pasindu Madhuwantha') ||
                messageText.includes('About Pasindu Madhuwantha') ||
                messageText.includes('Professional Background:') ||
                messageText.includes('Technical Skills:') ||
                messageText.includes('Notable Projects:') ||
                messageText.includes('GitHub Activity:') ||
                messageText.includes('Connect & Contact:') ||
                messageText.includes('Buy Me a Coffee') ||
                messageText.includes('PasinduOG') ||
                messageText.includes('Backend Developer & Technology Enthusiast') ||
                messageText.includes('Expert in Node.js') ||
                messageText.includes('Creator of IRON-MAN WhatsApp Bot') ||
                messageText.length > 100) { // Any message longer than 100 chars is likely our own response
                console.log('🚫 Ignoring bot\'s own developer info message');
                return; // Don't respond to our own developer info messages
            }

            try {
                // Fetch live GitHub profile data
                console.log(`🔄 Fetching live GitHub profile data for ${senderName}...`);
                const githubProfile = await fetchGithubProfile();
                
                let developerImageBuffer;
                
                try {
                    console.log(`📥 Downloading developer image for user ${senderName}...`);
                    // Use GitHub avatar from profile data
                    const response = await axios.get(githubProfile.avatar_url, {
                        responseType: 'arraybuffer',
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'User-Agent': 'IRON-MAN-Bot/1.3.0'
                        }
                    });
                    developerImageBuffer = Buffer.from(response.data);
                    console.log(`✅ Developer image downloaded successfully for ${senderName}`);
                } catch (imageError) {
                    console.log(`⚠️ Failed to download GitHub avatar for ${senderName}:`, imageError.message);
                    console.log('🔄 Using fallback Iron Man image');
                    // Fallback to Iron Man image if GitHub avatar fails
                    developerImageBuffer = fs.readFileSync('./src/ironman.jpg');
                }

                // Generate dynamic developer info from live GitHub data
                const developerInfo = await generateDeveloperInfo(githubProfile);

                // Send developer info with image preview
                await sock.sendMessage(userId, {
                    image: developerImageBuffer,
                    caption: developerInfo
                });

                console.log(`✅ Developer info sent successfully to ${senderName} with image preview (Live GitHub data)`);
            } catch (error) {
                console.error(`❌ Error sending developer info to ${senderName}:`, error);

                try {
                    // Fallback: Try to get GitHub profile and send text-only
                    const githubProfile = await fetchGithubProfile();
                    const developerInfoText = await generateDeveloperInfoFallback(githubProfile);

                    await sock.sendMessage(userId, {
                        text: developerInfoText
                    });
                    
                    console.log(`✅ Developer info sent successfully to ${senderName} (text-only fallback with live GitHub data)`);
                } catch (fallbackError) {
                    console.error(`❌ Complete fallback failed for ${senderName}:`, fallbackError);
                    
                    // Final fallback with basic info
                    const basicInfo = `👨‍💻 *About Pasindu Madhuwantha (PasinduOG)*\n\n` +
                        `🌟 Backend Developer & Technology Enthusiast\n` +
                        `💻 Expertise: JavaScript, Node.js, Express.js, PHP, Python\n` +
                        `🚀 Creator of IRON-MAN WhatsApp Bot\n` +
                        `🌐 GitHub: @PasinduOG\n` +
                        `📧 Email: pasinduogdev@gmail.com\n\n` +
                        `⚡ "I hate frontends" (Backend developer at heart!)\n\n` +
                        `*Built with ❤️ by Pasindu Madhuwantha*`;

                    await sock.sendMessage(userId, {
                        text: basicInfo
                    });
                }
            }
        }

        // Enhanced sticker creation command (supports both images and videos/GIFs)
        if (messageText.startsWith('!sticker') || messageText === '!sticker') {
            // Check rate limiting for sticker creation
            const rateCheck = checkRateLimit(userId, 'sticker');
            if (!rateCheck.allowed) {
                return sock.sendMessage(userId, { text: `⏰ ${rateCheck.reason}` });
            }

            // Check if user already has an active sticker process
            if (activeProcesses.has(`${userId}_sticker`)) {
                return sock.sendMessage(userId, { text: "🎬 Please wait, I'm still processing your previous sticker request..." });
            }

            // Mark as active
            activeProcesses.set(`${userId}_sticker`, Date.now());

            try {
                const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                let mediaMessage = null;
                let mediaType = null;

                // Check for quoted media (images, videos, GIFs)
                if (quoted?.imageMessage) {
                    mediaMessage = quoted.imageMessage;
                    mediaType = 'image';
                } else if (quoted?.videoMessage) {
                    mediaMessage = quoted.videoMessage;
                    mediaType = 'video';
                } else if (quoted?.gifMessage) {
                    mediaMessage = quoted.gifMessage;
                    mediaType = 'video'; // GIFs are treated as videos in Baileys
                }
                // Check for direct media (images, videos, GIFs)
                else if (msg.message?.imageMessage) {
                    mediaMessage = msg.message.imageMessage;
                    mediaType = 'image';
                } else if (msg.message?.videoMessage) {
                    mediaMessage = msg.message.videoMessage;
                    mediaType = 'video';
                } else if (msg.message?.gifMessage) {
                    mediaMessage = msg.message.gifMessage;
                    mediaType = 'video';
                }

                if (mediaMessage) {
                    if (mediaType === 'image') {
                        // Process as static sticker
                        console.log(`📸 Processing static sticker for user ${senderName}...`);
                        const buffer = await downloadMedia(sock, mediaMessage);

                        const webpBuffer = await sharp(buffer)
                            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                            .webp({ quality: 80 })
                            .toBuffer();

                        await sock.sendMessage(userId, {
                            sticker: webpBuffer
                        }, quoted ? { quoted: msg } : {});

                        console.log(`✅ Static sticker sent successfully to ${senderName}`);

                    } else if (mediaType === 'video') {
                        // Process as animated sticker using existing animated sticker functionality
                        console.log(`🎬 Processing animated sticker for user ${senderName}...`);

                        await sock.sendMessage(userId, {
                            text: `🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.\n⏱️ Maximum duration: ${MAX_STICKER_DURATION} seconds`
                        });

                        // Download the video/GIF
                        const buffer = await downloadVideoMedia(sock, mediaMessage, mediaType);

                        // Save to temporary file with user ID to avoid conflicts
                        const inputPath = `./temp_input_${userId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`;
                        const outputPath = `./temp_output_${userId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.webp`;

                        fs.writeFileSync(inputPath, buffer);

                        try {
                            // Convert to animated WebP using existing function
                            await convertToAnimatedSticker(inputPath, outputPath, MAX_STICKER_DURATION);

                            // Check file size (WhatsApp limit is around 500KB for stickers)
                            const stats = fs.statSync(outputPath);
                            const fileSizeInKB = stats.size / 1024;
                            console.log(`📏 Generated animated sticker size for ${senderName}: ${fileSizeInKB.toFixed(2)} KB`);

                            if (fileSizeInKB > 500) {
                                console.log(`⚠️ File too large for ${senderName}, attempting to compress further...`);
                                // Try again with ultra compression
                                await convertToAnimatedStickerUltraCompressed(inputPath, outputPath, MAX_STICKER_DURATION_COMPRESSED);
                                const newStats = fs.statSync(outputPath);
                                const newFileSizeInKB = newStats.size / 1024;
                                console.log(`📏 Compressed animated sticker size for ${senderName}: ${newFileSizeInKB.toFixed(2)} KB`);
                            }

                            // Read the converted file
                            const stickerBuffer = fs.readFileSync(outputPath);

                            // Send as sticker
                            await sock.sendMessage(userId, {
                                sticker: stickerBuffer
                            }, quoted ? { quoted: msg } : {});

                            console.log(`✅ Animated sticker sent successfully to ${senderName}`);

                        } catch (conversionError) {
                            console.error(`❌ Error converting video to animated sticker for ${senderName}:`, conversionError);
                            await sock.sendMessage(userId, {
                                text: '❌ Sir, failed to convert video to animated sticker. The video might be too large or in an unsupported format.'
                            });
                        } finally {
                            // Clean up temporary files
                            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        }
                    }

                } else {
                    await sock.sendMessage(userId, {
                        text: '❗ Sir. Please send an image or video/GIF with !sticker caption or reply to media with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker (creates static sticker)\n• Send video/GIF with caption: !sticker (creates animated sticker)\n• Reply to image with: !sticker\n• Reply to video/GIF with: !sticker'
                    });
                }
            } catch (error) {
                console.error(`❌ Error creating sticker for ${senderName}:`, error);
                await sock.sendMessage(userId, {
                    text: '❌ Failed to create sticker. Please try again with a valid image or video/GIF.'
                });
            } finally {
                // Remove from active processes
                activeProcesses.delete(`${userId}_sticker`);
            }
        }

        // Alternative: Just detect any image and provide sticker option
        else if (msg.message?.imageMessage && !messageText) {
            await sock.sendMessage(userId, {
                text: '📸 Sir I see you sent an image! Send "!sticker" to convert it to a sticker.'
            });
        }

        // Alternative: Just detect any video/GIF and provide sticker option  
        else if ((msg.message?.videoMessage || msg.message?.gifMessage) && !messageText) {
            await sock.sendMessage(userId, {
                text: '🎬 Sir I see you sent a video/GIF! Send "!sticker" to convert it to an animated sticker.'
            });
        }

        // Invalid command detection with video preview (GIF-like)
        if (messageText.startsWith('!') && 
            messageText !== '!commands' && 
            messageText !== '!help' && 
            messageText !== '!sticker' &&
            !messageText.startsWith('!jarvis ') && !messageText.startsWith('!Jarvis ')) {
            
            console.log(`❌ Invalid command "${messageText}" from ${senderName}, sending video GIF response...`);
            
            try {
                console.log(`📂 Reading IRON-MAN video file for ${senderName}...`);
                const ironmanVideoBuffer = fs.readFileSync('./src/ironman.mp4');
                console.log(`📏 Video file size: ${(ironmanVideoBuffer.length / 1024).toFixed(2)} KB`);
                
                const invalidCommandMessage = `❌ *Invalid Command: "${messageText}"*\n\n` +
                    `🤖 Sir, that command is not recognized in my database.\n\n` +
                    `📝 Type *!commands* to show all commands\n` +
                    `⚙️ *IRON-MAN Bot v1.3.0*\n` +
                    `👤 Your session: ${userSession.messageCount} messages`;

                // Try multiple methods to send the video as GIF-like preview
                try {
                    console.log(`🎬 Attempting to send video as GIF playback to ${senderName}...`);
                    await sock.sendMessage(userId, {
                        video: ironmanVideoBuffer,
                        gifPlayback: true,
                        caption: invalidCommandMessage,
                        mimetype: 'video/mp4',
                        fileName: 'ironman.mp4'
                    });
                    console.log(`✅ Invalid command video sent successfully as GIF playback to ${senderName}`);
                } catch (videoGifError) {
                    console.log(`⚠️ Video as GIF failed for ${senderName}:`, videoGifError.message);
                    try {
                        console.log(`🎥 Attempting to send as regular video to ${senderName}...`);
                        await sock.sendMessage(userId, {
                            video: ironmanVideoBuffer,
                            caption: invalidCommandMessage,
                            mimetype: 'video/mp4',
                            fileName: 'ironman.mp4'
                        });
                        console.log(`✅ Invalid command video sent successfully as regular video to ${senderName}`);
                    } catch (regularVideoError) {
                        console.log(`⚠️ Regular video failed for ${senderName}:`, regularVideoError.message);
                        // Try sending as document
                        console.log(`📄 Attempting to send video as document to ${senderName}...`);
                        await sock.sendMessage(userId, {
                            document: ironmanVideoBuffer,
                            fileName: 'ironman.mp4',
                            mimetype: 'video/mp4',
                            caption: invalidCommandMessage
                        });
                        console.log(`✅ Invalid command video sent successfully as document to ${senderName}`);
                    }
                }
                
            } catch (videoError) {
                console.error(`🚨 All video methods failed for ${senderName}:`, videoError.message);
                // Final fallback to static image
                try {
                    console.log(`🖼️ Final fallback: sending static image to ${senderName}...`);
                    const ironmanImageBuffer = fs.readFileSync('./src/ironman.jpg');
                    await sock.sendMessage(userId, {
                        image: ironmanImageBuffer,
                        caption: invalidCommandMessage,
                        mimetype: 'image/jpeg'
                    });
                    console.log(`✅ Invalid command response sent as static image fallback to ${senderName}`);
                } catch (finalError) {
                    console.error(`🚨 All fallback methods failed for ${senderName}:`, finalError.message);
                    // Ultimate fallback - text only
                    await sock.sendMessage(userId, { text: invalidCommandMessage });
                    console.log(`✅ Invalid command response sent as text-only (ultimate fallback) to ${senderName}`);
                }
            }
        }

        // AI-powered Chat command
        if (messageText.startsWith('!jarvis ') || messageText.startsWith('!Jarvis ')) {
            const commandText = messageText.startsWith('!jarvis ') ? messageText.substring(8) : messageText.substring(8);
            const args = commandText.trim().split(' ');
            await handleChatCommand(sock, msg, args);
        }
    });

    return sock;
}

// Helper: Download image media buffer
async function downloadMedia(sock, message) {
    const stream = await downloadContentFromMessage(message, 'image');
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

// Helper: Download video/GIF media buffer
async function downloadVideoMedia(sock, message, mediaType = 'video') {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

// Helper: Convert video/GIF to animated WebP sticker
async function convertToAnimatedSticker(inputPath, outputPath, maxDuration = 6) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions([
                '-t', maxDuration.toString(),  // Use configurable max duration
                '-ss', '0'  // Start from beginning
            ])
            .outputOptions([
                '-vf', 'fps=15', // Only reduce FPS, preserve original dimensions and transparency
                '-c:v', 'libwebp',
                '-quality', '60',        // Better quality for original dimensions
                '-preset', 'picture',    // Better compression preset
                '-loop', '0',
                '-compression_level', '6', // Higher compression
                '-method', '6',          // Better compression method
                '-an'                    // Remove audio
            ])
            .format('webp')
            .on('start', (commandLine) => {
                console.log('🎬 FFmpeg command: ' + commandLine);
                console.log(`⏱️ Maximum duration set to: ${maxDuration} seconds`);
                console.log('📐 Using original video dimensions (no forced scaling)');
            })
            .on('progress', (progress) => {
                console.log('Processing: ' + Math.round(progress.percent) + '% done');
            })
            .on('end', () => {
                console.log('✅ Animated sticker conversion completed');
                resolve(true);
            })
            .on('error', (err) => {
                console.error('❌ Animated sticker conversion failed:', err);
                reject(err);
            })
            .save(outputPath);
    });
}

// Helper: Ultra-compressed conversion for large files
async function convertToAnimatedStickerUltraCompressed(inputPath, outputPath, maxDuration = 4) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions([
                '-t', maxDuration.toString(),  // Use configurable max duration
                '-ss', '0'
            ])
            .outputOptions([
                '-vf', 'scale=400:400:force_original_aspect_ratio=decrease,fps=12', // Moderate scaling with original ratio
                '-c:v', 'libwebp',
                '-quality', '40',        // Balanced quality
                '-preset', 'picture',
                '-loop', '0',
                '-compression_level', '6',
                '-method', '6',
                '-an'
            ])
            .format('webp')
            .on('start', (commandLine) => {
                console.log('🎬 Ultra-compressed FFmpeg command: ' + commandLine);
                console.log(`⏱️ Ultra-compressed duration set to: ${maxDuration} seconds`);
                console.log('📐 Using moderate scaling (400x400 max) preserving aspect ratio');
            })
            .on('end', () => {
                console.log('✅ Ultra-compressed animated sticker conversion completed');
                resolve(true);
            })
            .on('error', (err) => {
                console.error('❌ Ultra-compressed conversion failed:', err);
                reject(err);
            })
            .save(outputPath);
    });
}

// Start the bot - Please don't edit this code
startBot().catch(err => {
    console.error('Error starting bot:', err);
    setTimeout(() => {
        console.log('🔄 Retrying after error...');
        startBot();
    }, 5000);
});

// Keep-alive ping for Heroku - Please don't edit this code
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
    if (!isConnected && currentQR) {
        try {
            // Generate QR code as data URL
            const qrDataURL = await QRCode.toDataURL(currentQR);
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>IRON-MAN Bot - WhatsApp QR Code</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            margin: 0;
                            padding: 20px;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            color: white;
                        }
                        .container {
                            background: rgba(255, 255, 255, 0.95);
                            border-radius: 20px;
                            padding: 40px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                            text-align: center;
                            max-width: 500px;
                            color: #333;
                        }
                        .logo {
                            font-size: 2.5em;
                            margin-bottom: 10px;
                        }
                        h1 {
                            color: #d32f2f;
                            margin-bottom: 10px;
                            font-size: 2em;
                        }
                        .subtitle {
                            color: #666;
                            margin-bottom: 30px;
                            font-size: 1.1em;
                        }
                        .qr-container {
                            background: white;
                            padding: 20px;
                            border-radius: 15px;
                            margin: 20px 0;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        }
                        .qr-code {
                            max-width: 280px;
                            width: 100%;
                            height: auto;
                        }
                        .instructions {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 20px;
                            border-left: 4px solid #d32f2f;
                        }
                        .step {
                            margin: 10px 0;
                            text-align: left;
                        }
                        .refresh-btn {
                            background: #d32f2f;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-size: 1em;
                            margin-top: 20px;
                            transition: background 0.3s;
                        }
                        .refresh-btn:hover {
                            background: #b71c1c;
                        }
                        @media (max-width: 600px) {
                            .container {
                                padding: 20px;
                                margin: 10px;
                            }
                            .qr-code {
                                max-width: 250px;
                            }
                        }
                    </style>
                    <script>
                        // Auto refresh every 30 seconds
                        setTimeout(() => {
                            window.location.reload();
                        }, 30000);
                    </script>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">🤖</div>
                        <h1>IRON-MAN Bot</h1>
                        <p class="subtitle">Scan QR Code to Connect WhatsApp</p>
                        
                        <div class="qr-container">
                            <img src="${qrDataURL}" alt="WhatsApp QR Code" class="qr-code">
                        </div>
                        
                        <div class="instructions">
                            <h3>📱 How to Connect:</h3>
                            <div class="step">1. Open WhatsApp on your phone</div>
                            <div class="step">2. Go to Settings (⋮) → Linked Devices</div>
                            <div class="step">3. Tap "Link a Device"</div>
                            <div class="step">4. Scan this QR code</div>
                        </div>
                        
                        <button class="refresh-btn" onclick="window.location.reload()">
                            🔄 Refresh QR Code
                        </button>
                        
                        <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
                            QR Code expires in 60 seconds • Auto-refresh enabled
                        </p>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            res.send(`
                <h1>🤖 IRON-MAN Bot</h1>
                <p>Generating QR Code...</p>
                <script>setTimeout(() => window.location.reload(), 3000);</script>
            `);
        }
    } else if (isConnected) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IRON-MAN Bot - Connected</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: white;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 500px;
                        color: #333;
                    }
                    .success-icon {
                        font-size: 4em;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #4CAF50;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success-icon">✅</div>
                    <h1>IRON-MAN Bot Connected!</h1>
                    <p>Your WhatsApp bot is now online and ready to receive messages.</p>
                    <p><strong>Available Commands:</strong></p>
                    <div style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0;">💬 <strong>hi, hello, hey</strong> - Jarvis greeting</p>
                        <p style="margin: 5px 0;">🤵 <strong>jarvis</strong> - Formal greeting</p>
                        <p style="margin: 5px 0;">🧠 <strong>!jarvis <prompt></strong> - Get AI-powered responses</p>
                        <p style="margin: 5px 0;">❓ <strong>!help</strong> - Bot help center</p>
                        <p style="margin: 5px 0;">📋 <strong>!commands</strong> - Command list</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image/video/GIF to sticker</p>
                        <p style="margin: 5px 0;">👨‍💻 <strong>!aboutdev</strong> - Live GitHub developer info with image</p>
                        <p style="margin: 5px 0;">📊 <strong>!stats</strong> - Show your usage statistics</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-left: 4px solid #4CAF50;">
                        <p style="margin: 0; color: #2e7d32; font-weight: bold;">🗄️ Session Persistence</p>
                        <p style="margin: 5px 0 0 0; color: #388e3c; font-size: 0.9em;">Your session is safely stored in MongoDB and will persist across deployments!</p>
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 10px; border-left: 4px solid #2196F3;">
                        <p style="margin: 0; color: #1976d2; font-weight: bold;">👥 Multi-User Support</p>
                        <p style="margin: 5px 0 0 0; color: #1565c0; font-size: 0.9em;">Optimized for concurrent users with rate limiting and session management!</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IRON-MAN Bot - Starting</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: white;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 500px;
                        color: #333;
                    }
                    .loading {
                        font-size: 3em;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                </style>
                <script>
                    setTimeout(() => window.location.reload(), 5000);
                </script>
            </head>
            <body>
                <div class="container">
                    <div class="loading">🤖</div>
                    <h1>IRON-MAN Bot Starting...</h1>
                    <p>Please wait while the bot initializes.</p>
                    <p>QR Code will appear shortly.</p>
                </div>
            </body>
            </html>
        `);
    }
});

// API endpoint to get QR status
app.get('/api/status', (req, res) => {
    res.json({
        connected: isConnected,
        hasQR: !!currentQR,
        timestamp: new Date().toISOString(),
        activeUsers: userSessions.size,
        totalUsers: userSessions.size,
        activeProcesses: activeProcesses.size
    });
});

// API endpoint to get bot statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalUsers: userSessions.size,
        activeProcesses: activeProcesses.size,
        rateLimits: userRateLimits.size,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        users: Array.from(userSessions.values()).map(session => ({
            id: session.id.substring(0, 10) + '***', // Anonymize for privacy
            messageCount: session.messageCount,
            lastActivity: new Date(session.lastActivity).toISOString(),
            joinedAt: new Date(session.joinedAt).toISOString()
        }))
    };
    res.json(stats);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});