const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { useMongoDBAuthState } = require('./mongoAuth');
const { getMemory, updateMemory, clearOldMemory, getMemoryStats, clearAllMemory, buildConversationContext } = require('./memoryManager');
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

// Bot startup time tracking
const startTime = Date.now();

// Process-level error handlers for production stability
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    console.error('Promise:', promise);
    // Don't exit process, just log the error for monitoring
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Log the error but attempt graceful recovery
    if (error.code === 'EADDRINUSE') {
        console.error('⚠️ Port already in use. Attempting to continue...');
    } else {
        console.error('⚠️ Critical error occurred, but continuing operation...');
    }
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await gracefulShutdown();
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await gracefulShutdown();
});

async function gracefulShutdown() {
    try {
        console.log('🔄 Closing MongoDB connections...');
        const { closeConnection } = require('./memoryManager');
        await closeConnection();
        
        console.log('🔄 Clearing active processes...');
        activeProcesses.clear();
        userSessions.clear();
        userRateLimits.clear();
        
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Bot Version Configuration
const BOT_VERSION = '1.5.0';
const BOT_VERSION_NAME = 'AI Memory & Media Edition';
const BOT_VERSION_FULL = `${BOT_VERSION} - ${BOT_VERSION_NAME}`;

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
                'User-Agent': `IRON-MAN-Bot/${BOT_VERSION}`
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

const welcomeMessage = "Hello!... I'm Jarvis. How can I assist you today?...😊";
const greetingMessge = "At your service, sir";

// Animated Sticker Configuration
const MAX_STICKER_DURATION = 10; // Maximum animation length in seconds (adjustable)
const MAX_STICKER_DURATION_COMPRESSED = 6; // Maximum duration for compressed stickers

// AI Chat Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here';

// Multi-user management with enhanced concurrency and optimization
const userSessions = new Map(); // Store user session data
const userRateLimits = new Map(); // Store user rate limiting data
const activeProcesses = new Map(); // Track active processing per user
const userRequestQueues = new Map(); // Queue multiple requests per user
const memoryCache = new Map(); // Cache user memory for faster access
const downloadQueue = new Map(); // Track concurrent downloads per user

// Enhanced AI processing configuration - Optimized for speed
const MAX_CONCURRENT_AI_REQUESTS = 150; // Increased for better throughput
const MAX_USER_QUEUE_SIZE = 3; // Reduced queue size for faster processing
let globalActiveAIRequests = 0; // Track global AI request count

// Add connection pooling for better performance
const connectionPool = new Map();
const MAX_CONNECTION_POOL_SIZE = 10;

// Performance optimization configuration - Enhanced for speed
const MEMORY_CACHE_TTL = 60000; // Extended cache to 60 seconds for better performance
const TYPING_INDICATOR_DELAY = 50; // Reduced delay for faster response feeling
const CONCURRENT_DOWNLOAD_LIMIT = 3; // Limit concurrent media downloads
const RESPONSE_TIMEOUT = 12000; // Reduced from 15s to 12s for faster timeouts
const STICKER_PROCESSING_TIMEOUT = 20000; // Specific timeout for sticker processing

// Rate limiting configuration - Optimized for performance
const RATE_LIMIT_WINDOW = 45000; // Reduced to 45 seconds for faster reset
const MAX_REQUESTS_PER_WINDOW = 15; // Increased to 15 requests for better UX
const AI_COOLDOWN = 2000; // Reduced to 2 seconds for faster AI responses
const STICKER_COOLDOWN = 3000; // Reduced to 3 seconds for faster sticker generation

// Memory optimization settings
const MAX_MEMORY_CACHE_SIZE = 500; // Limit cache size to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes instead of 10

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

// Enhanced user session helper with queue support
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

// Queue management helper
function getUserQueue(userId) {
    if (!userRequestQueues.has(userId)) {
        userRequestQueues.set(userId, []);
    }
    return userRequestQueues.get(userId);
}

// Fast memory retrieval with optimized caching
async function getMemoryFast(userNumber) {
    const cacheKey = `memory_${userNumber}`;
    const cached = memoryCache.get(cacheKey);
    
    // Return cached memory if still valid
    if (cached && (Date.now() - cached.timestamp) < MEMORY_CACHE_TTL) {
        return cached.data;
    }
    
    // Check cache size and clean if necessary
    if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
        cleanupMemoryCache();
    }
    
    // Fetch from database and cache
    try {
        const memory = await getMemory(userNumber);
        memoryCache.set(cacheKey, {
            data: memory,
            timestamp: Date.now()
        });
        return memory;
    } catch (error) {
        console.error(`Memory fetch error for ${userNumber}:`, error.message);
        return []; // Return empty array on error
    }
}

// Optimized async memory update to prevent blocking
async function updateMemoryAsync(userNumber, userMessage, aiReply) {
    // Non-blocking memory update
    setImmediate(async () => {
        try {
            await updateMemory(userNumber, userMessage, aiReply);
            await clearOldMemory(userNumber, 10);
            
            // Update cache immediately for fast subsequent access
            const cacheKey = `memory_${userNumber}`;
            const updatedMemory = await getMemory(userNumber);
            memoryCache.set(cacheKey, {
                data: updatedMemory,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error(`Async memory update error for ${userNumber}:`, error.message);
        }
    });
}

// Process next request in user's queue
async function processUserQueue(userId, client) {
    const queue = getUserQueue(userId);
    if (queue.length === 0) return;

    const nextRequest = queue.shift();
    if (nextRequest) {
        await handleAIRequestInternal(
            client, 
            nextRequest.msg, 
            nextRequest.args, 
            nextRequest.userId, 
            nextRequest.userNumber, 
            nextRequest.prompt,
            nextRequest.chatId,
            nextRequest.isGroup
        );
    }
}

// Optimized cleanup functions with better performance
function cleanupInactiveSessions() {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 20 * 60 * 1000; // Reduced to 20 minutes for better memory management

    let cleanedCount = 0;
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.lastActivity > INACTIVE_THRESHOLD) {
            userSessions.delete(userId);
            userRateLimits.delete(`${userId}_general`);
            userRateLimits.delete(`${userId}_ai`);
            userRateLimits.delete(`${userId}_sticker`);
            activeProcesses.delete(userId);
            userRequestQueues.delete(userId);
            downloadQueue.delete(userId);
            memoryCache.delete(`memory_${userId.split('@')[0]}`);
            cleanedCount++;
        }
    }
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} inactive sessions`);
    }
}

// Enhanced memory cache cleanup with size limits
function cleanupMemoryCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Clean expired entries first
    for (const [key, value] of memoryCache.entries()) {
        if (now - value.timestamp > MEMORY_CACHE_TTL) {
            memoryCache.delete(key);
            cleanedCount++;
        }
    }
    
    // If still over limit, remove oldest entries
    if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
        const entries = Array.from(memoryCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = memoryCache.size - MAX_MEMORY_CACHE_SIZE + 50; // Remove extra for buffer
        for (let i = 0; i < toRemove && i < entries.length; i++) {
            memoryCache.delete(entries[i][0]);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} memory cache entries`);
    }
}

// Optimized cleanup intervals
setInterval(cleanupInactiveSessions, CLEANUP_INTERVAL);
setInterval(cleanupMemoryCache, 2 * 60 * 1000); // Every 2 minutes

// Input validation and sanitization helper
function validateAndSanitizeInput(input, maxLength = 2000) {
    if (!input || typeof input !== 'string') {
        return { valid: false, error: 'Invalid input' };
    }
    
    const sanitized = input.trim();
    
    if (sanitized.length === 0) {
        return { valid: false, error: 'Empty input' };
    }
    
    if (sanitized.length > maxLength) {
        return { valid: false, error: `Input too long (max ${maxLength} characters)` };
    }
    
    return { valid: true, sanitized };
}

// Enhanced AI Chat Handler with concurrent processing support
async function handleChatCommand(client, msg, args) {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const actualSender = isGroup ? msg.key.participant : chatId;
    const userId = actualSender; // Use actual sender for individual tracking
    const userNumber = userId.split('@')[0];
    const prompt = args.join(" ");

    // Validate and sanitize input
    const validation = validateAndSanitizeInput(prompt, 2000);
    if (!validation.valid) {
        const errorMsg = isGroup 
            ? `❌ @${userNumber} ${validation.error}. Usage: !chat <prompt>`
            : `❌ ${validation.error}. Usage: !chat <prompt>`;
        return client.sendMessage(chatId, { 
            text: errorMsg,
            mentions: isGroup ? [userId] : undefined
        });
    }

    // Use sanitized prompt
    const sanitizedPrompt = validation.sanitized;

    // Check rate limiting (per individual user)
    const rateCheck = checkRateLimit(userId, 'ai');
    if (!rateCheck.allowed) {
        const rateLimitMsg = isGroup 
            ? `⏰ @${userNumber} ${rateCheck.reason}`
            : `⏰ ${rateCheck.reason}`;
        return client.sendMessage(chatId, { 
            text: rateLimitMsg,
            mentions: isGroup ? [userId] : undefined
        });
    }

    const userQueue = getUserQueue(userId);
    
    // Check if we can process immediately or need to queue
    if (globalActiveAIRequests < MAX_CONCURRENT_AI_REQUESTS && userQueue.length === 0) {
        // Process immediately with sanitized prompt
        await handleAIRequestInternal(client, msg, args, userId, userNumber, sanitizedPrompt, chatId, isGroup);
    } else {
        // Check queue size limit
        if (userQueue.length >= MAX_USER_QUEUE_SIZE) {
            const queueFullMsg = isGroup 
                ? `⏰ @${userNumber} Your request queue is full (${MAX_USER_QUEUE_SIZE} requests). Please wait for current requests to complete.`
                : `⏰ Your request queue is full (${MAX_USER_QUEUE_SIZE} requests). Please wait for current requests to complete.`;
            return client.sendMessage(chatId, { 
                text: queueFullMsg,
                mentions: isGroup ? [userId] : undefined
            });
        }

        // Add to queue with sanitized prompt
        userQueue.push({ msg, args, userId, userNumber, prompt: sanitizedPrompt, chatId, isGroup });
        
        // Send queue position feedback
        const queuePosition = userQueue.length;
        const queueMsg = isGroup 
            ? `🔄 @${userNumber} *Request queued!*\n\n📊 Position in queue: ${queuePosition}\n⚡ Active requests: ${globalActiveAIRequests}/${MAX_CONCURRENT_AI_REQUESTS}\n\n⏳ Your request will be processed shortly...`
            : `🔄 *Request queued!*\n\n📊 Position in queue: ${queuePosition}\n⚡ Active requests: ${globalActiveAIRequests}/${MAX_CONCURRENT_AI_REQUESTS}\n\n⏳ Your request will be processed shortly...`;
        await client.sendMessage(chatId, { 
            text: queueMsg,
            mentions: isGroup ? [userId] : undefined
        });
    }
}

// Internal AI request handler for actual processing - Optimized for speed
async function handleAIRequestInternal(client, msg, args, userId, userNumber, prompt, chatId, isGroup) {
    // If chatId not provided, extract from msg (for backward compatibility)
    if (!chatId) {
        chatId = msg.key.remoteJid;
        isGroup = chatId.endsWith('@g.us');
    }
    // Increment global counter
    globalActiveAIRequests++;
    
    // Mark as active
    activeProcesses.set(`${userId}_ai`, Date.now());

    // Get user session
    const session = getUserSession(userId);

    try {
        // Show typing indicator (non-blocking and optimized)
        setImmediate(() => {
            client.sendPresenceUpdate('composing', chatId).catch(() => {});
        });

        // Parallel operations for better performance
        const memoryPromise = getMemoryFast(userNumber);
        
        // Start memory fetch and typing indicator in parallel
        const [memory] = await Promise.all([
            memoryPromise,
            new Promise(resolve => setTimeout(resolve, TYPING_INDICATOR_DELAY)) // Minimal delay
        ]);

        // Build conversation context with memory (optimized)
        const conversationContext = buildConversationContext(memory, prompt);

        console.log(`🧠 Processing AI request for user ${userNumber} (${globalActiveAIRequests} active requests)`);

        // Optimized API request with better timeout handling
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: conversationContext }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    topP: 0.8,
                    topK: 40
                }
            },
            {
                timeout: RESPONSE_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'IRON-MAN-Bot/1.5.0'
                }
            }
        );

        const aiReply = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 No response.";

        // Stop typing indicator (non-blocking)
        setImmediate(() => {
            client.sendPresenceUpdate('available', chatId).catch(() => {});
        });

        // Send response with group awareness
        const responseText = isGroup 
            ? `🧠 @${userNumber} *Response:*\n\n${aiReply}`
            : `🧠 *Response:*\n\n${aiReply}`;
        
        await client.sendMessage(chatId, {
            text: responseText,
            mentions: isGroup ? [userId] : undefined
        });

        // Update memory asynchronously for better performance
        updateMemoryAsync(userNumber, prompt, aiReply);

        console.log(`✅ AI response sent to user ${session.id} (Message #${session.messageCount}) - memory updating in background`);

    } catch (err) {
        console.error(`❌ Gemini error for user ${userId}:`, err.message);

        // Stop typing indicator on error (non-blocking)
        setImmediate(() => {
            client.sendPresenceUpdate('available', chatId).catch(() => {});
        });

        let errorMessage = "❌ Error with Gemini AI.";
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            errorMessage = "⏰ AI request timed out. Please try a shorter prompt.";
        } else if (err.response?.status === 429) {
            errorMessage = "🚫 AI service is busy. Try again in a moment.";
        } else if (err.response?.status >= 500) {
            errorMessage = "🔧 AI service temporarily unavailable. Please retry.";
        }

        const errorText = isGroup 
            ? `❌ @${userNumber} ${errorMessage}`
            : errorMessage;

        client.sendMessage(chatId, { 
            text: errorText,
            mentions: isGroup ? [userId] : undefined
        }).catch(() => {}); // Don't wait for error message
    } finally {
        // Decrement global counter
        globalActiveAIRequests--;
        
        // Remove from active processes
        activeProcesses.delete(`${userId}_ai`);
        
        // Process next request in this user's queue (optimized delay)
        setImmediate(() => processUserQueue(userId, client));
    }
}

// YouTube to MP3 Conversion Function
// Extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
    // Support various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Get YouTube video information and formats using YTStream API
async function getYouTubeVideoFormats(videoId) {
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '2f04d689f3msh8b4ddfc2299fa37p1e8d90jsn35709382433c';
    
    const options = {
        method: 'GET',
        url: `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`,
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
        },
        timeout: 30000
    };

    try {
        console.log(`📹 Fetching video formats for: ${videoId}`);
        const response = await axios.request(options);
        console.log(`✅ Video formats retrieved successfully`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching video formats:`, error.message);
        throw error;
    }
}

// Download YouTube video/audio using YTStream API
async function downloadYouTubeMedia(url, quality = 'mp3') {
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '2f04d689f3msh8b4ddfc2299fa37p1e8d90jsn35709382433c';
    
    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        throw new Error('Invalid YouTube URL or video ID');
    }
    
    console.log(`� Processing YouTube video: ${videoId} (Quality: ${quality})`);
    
    // Get video formats and info
    const data = await getYouTubeVideoFormats(videoId);
    
    if (data.status !== 'OK') {
        throw new Error('Failed to fetch video information');
    }
    
    // Extract video info
    const videoInfo = {
        title: data.title,
        duration: data.lengthSeconds,
        views: data.viewCount,
        channel: data.channelTitle,
        thumbnail: data.thumbnail?.[data.thumbnail.length - 1]?.url
    };
    
    // Find the appropriate format based on quality
    let downloadUrl;
    let format;
    let fileType;
    let mimeType;
    
    if (quality === 'mp3' || quality === 'audio') {
        // Find best audio format (prefer 140 - 128kbps AAC)
        const audioFormats = data.adaptiveFormats.filter(f => 
            f.mimeType?.includes('audio') && 
            (f.itag === 140 || f.itag === 251 || f.itag === 139)
        );
        
        if (audioFormats.length > 0) {
            // Prefer itag 140 (128kbps AAC), then 251 (Opus), then 139 (48kbps AAC)
            format = audioFormats.find(f => f.itag === 140) || 
                    audioFormats.find(f => f.itag === 251) || 
                    audioFormats[0];
            downloadUrl = format.url;
            fileType = 'mp3';
            mimeType = 'audio/mpeg';
        }
    } else {
        // Find video format with quality
        let videoFormat;
        
        if (quality === '360p') {
            videoFormat = data.formats?.find(f => f.qualityLabel === '360p');
        } else if (quality === '480p') {
            videoFormat = data.formats?.find(f => f.qualityLabel === '480p');
        } else if (quality === '720p') {
            videoFormat = data.formats?.find(f => f.qualityLabel === '720p');
        }
        
        // Fallback to 360p if requested quality not found
        if (!videoFormat) {
            videoFormat = data.formats?.find(f => f.qualityLabel === '360p') || data.formats?.[0];
        }
        
        if (videoFormat) {
            format = videoFormat;
            downloadUrl = videoFormat.url;
            fileType = 'mp4';
            mimeType = 'video/mp4';
        }
    }
    
    if (!downloadUrl) {
        throw new Error(`No suitable ${quality} format found for this video`);
    }
    
    console.log(`⬇️ Downloading ${fileType.toUpperCase()} from URL...`);
    
    // Download the file
    const response = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 120000 // 2 minutes for download
    });
    
    console.log(`✅ Download stream ready`);
    
    return {
        stream: response.data,
        videoInfo,
        videoId,
        format,
        fileType,
        mimeType,
        quality
    };
}

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pasinduogdev:PasinduDev678@cluster0.4ns3c.mongodb.net/iron-man-bot';

// For Heroku deployment - Please don't edit this code (Use .env instead)
const PORT = process.env.PORT || 3000;

// Store QR code data
let currentQR = null;
let isConnected = false;

async function startBot() {
    const { state, saveCreds, clearExpiredAuth } = await useMongoDBAuthState(MONGODB_URI);
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
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log('❌ Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            // Handle 401 Unauthorized - clear expired auth
            if (statusCode === 401 || lastDisconnect?.error?.message === 'Connection Failure') {
                console.log('🔄 Auth session expired (401) - clearing old credentials...');
                clearExpiredAuth()
                    .then(() => {
                        console.log('✅ Ready for fresh QR code scan');
                        setTimeout(() => {
                            console.log('🔄 Restarting with new authentication...');
                            startBot();
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('❌ Error clearing auth:', err);
                        // Still attempt restart even if clear fails
                        setTimeout(() => {
                            console.log('🔄 Attempting restart despite auth clear error...');
                            startBot();
                        }, 3000);
                    });
            } else if (shouldReconnect) {
                // Normal reconnection for other errors
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
        try {
            const msg = messages[0];
            if (!msg.message) return;

            // Ignore messages from the bot itself to prevent infinite loops
            if (msg.key.fromMe) return;

            const chatId = msg.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            const actualSender = isGroup ? msg.key.participant : chatId;
            const userId = actualSender; // Use actual sender for individual tracking
            const senderName = msg.pushName || 'User';

        // Get or create user session (individual user tracking even in groups)
        const userSession = getUserSession(userId);

        // Log message with group context
        const contextInfo = isGroup ? `${senderName} in group ${chatId.split('@')[0]}` : senderName;
        console.log(`📨 Message #${userSession.messageCount} from ${contextInfo} (${userId})`);

        // Extract message text from different message types
        const messageText = (msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.gifMessage?.caption ||
            '').trim();

        // Check general rate limiting for commands (per individual user)
        if (messageText.startsWith('!')) {
            const rateCheck = checkRateLimit(userId, 'general');
            if (!rateCheck.allowed) {
                return sock.sendMessage(chatId, { 
                    text: `⏰ @${userId.split('@')[0]} ${rateCheck.reason}`,
                    mentions: [userId]
                });
            }
        }

        const welcomeRegex = /^(hi|hello|hey)(\s|$)/i;
        const greetingRegex = /^(jarvis)(\s|$)/i;

        if (welcomeRegex.test(messageText)) {
            const personalizedWelcome = isGroup 
                ? `Hello @${userId.split('@')[0]}! 👋 ${welcomeMessage}`
                : welcomeMessage;
            sock.sendMessage(chatId, { 
                text: personalizedWelcome,
                mentions: isGroup ? [userId] : undefined
            });
        }

        if (greetingRegex.test(messageText)) {
            const personalizedGreeting = isGroup 
                ? `@${userId.split('@')[0]} ${greetingMessge}`
                : greetingMessge;
            sock.sendMessage(chatId, { 
                text: personalizedGreeting,
                mentions: isGroup ? [userId] : undefined
            });
        }

        if (messageText === '!help') {
            const imageBuffer = fs.readFileSync('./src/ironman.jpg') // your image path
            
            const helpCaption = `🤖 *IRON-MAN Bot Help Center*

📋 *Primary Commands:*
- *!commands* : List all commands
- *!help* : Show this help center
- *!sticker* : Convert image/video/GIF to sticker
- *!chat <prompt>* : Get AI-powered responses with memory
- *!conv <youtube_url>* : Convert YouTube videos to MP3 and auto-send as document
- *!aboutdev* : Live GitHub developer info with image
- *!stats* : Show your usage statistics

🧠 *Memory Management:*
- *!memory* : Show your conversation memory stats
- *!forgetme* : Clear all your conversation memory
- *!clearcontext* : Clear conversation context (same as forgetme)

🔧 *Quick Commands:*
- *!ping* : Check bot status

${isGroup ? `\n👥 *Group Features:*
- Each user has individual memory & stats
- Personal rate limits per user
- Mentions in responses for clarity
- Individual AI request queues

💡 *Tip:* @${userId.split('@')[0]} Your commands and conversations are tracked individually even in groups!` : ''}`;

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpCaption,
                mentions: isGroup ? [userId] : undefined
            });
        }

        if (messageText === '!commands') {
            const commandsText = `📝 *All Available Commands:*

📋 *Primary Commands:*
- !commands : Show all commands
- !help : Get help info with image
- !sticker : Convert image/video/GIF to sticker
- !chat <prompt> : Get AI-powered responses with memory
- !conv <youtube_url> : Convert YouTube videos to MP3 and auto-send as document
- !aboutdev : Live GitHub developer info with image
- !stats : Show your usage statistics

🧠 *Memory Management:*
- !memory : Show your conversation memory stats
- !forgetme : Clear all your conversation memory
- !clearcontext : Clear conversation context (same as forgetme)

🔧 *Quick Commands:*
- !ping, !test, !alive : Check bot status
- !info, !about, !version : Bot information
- !menu, !start : Welcome menu
- !bot, !uptime, !status : Bot uptime and status

💬 *Natural Language:*
- hi, hello, hey : Casual Jarvis greeting
- jarvis : Formal greeting

⚙️ Bot created by *Pasindu OG Dev*
📌 Version: 1.5.0 - AI Memory & Media Edition
👤 Session: ${userSession.messageCount} messages

${isGroup ? `\n👥 *Group Mode:* @${userId.split('@')[0]} Your data is tracked individually!` : ''}`;

            await sock.sendMessage(chatId, {
                text: commandsText,
                mentions: isGroup ? [userId] : undefined
            });
        }

        if (messageText === '!stats') {
            const joinedAgo = Math.floor((Date.now() - userSession.joinedAt) / 1000 / 60); // minutes
            const lastActiveAgo = Math.floor((Date.now() - userSession.lastActivity) / 1000); // seconds
            const userNumber = userId.split('@')[0];

            // Get memory stats
            const memoryStats = await getMemoryStats(userNumber);

            const statsText = `📊 *Your Bot Statistics*

👤 *User Session:*
• Messages sent: ${userSession.messageCount}
• Joined: ${joinedAgo} minutes ago
• Last active: ${lastActiveAgo} seconds ago

🧠 *AI Memory Stats:*
• Total messages in memory: ${memoryStats.totalMessages}
• Your messages: ${memoryStats.userMessages}
• AI responses: ${memoryStats.aiMessages}
• Last memory update: ${memoryStats.lastUpdated ? new Date(memoryStats.lastUpdated).toLocaleString() : 'Never'}

🤖 *Bot Status:*
• Total active users: ${userSessions.size}
• Active processes: ${activeProcesses.size}
• Your session ID: ${userSession.id.substring(0, 15)}***

⚡ *Rate Limits:*
• General commands: Available
• AI requests: Available  
• Sticker creation: Available

🎯 Keep chatting with IRON-MAN Bot for smarter AI conversations!

${isGroup ? `\n👥 *Group Context:* @${userId.split('@')[0]} These stats are personal to you, not the group!` : ''}`;

            await sock.sendMessage(chatId, {
                text: statsText,
                mentions: isGroup ? [userId] : undefined
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
                            'User-Agent': `IRON-MAN-Bot/${BOT_VERSION}`
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
                await sock.sendMessage(chatId, {
                    image: developerImageBuffer,
                    caption: developerInfo,
                    mentions: isGroup ? [userId] : undefined
                });

                console.log(`✅ Developer info sent successfully to ${senderName} with image preview (Live GitHub data)`);
            } catch (error) {
                console.error(`❌ Error sending developer info to ${senderName}:`, error);

                try {
                    // Fallback: Try to get GitHub profile and send text-only
                    const githubProfile = await fetchGithubProfile();
                    const developerInfoText = await generateDeveloperInfoFallback(githubProfile);

                    await sock.sendMessage(chatId, {
                        text: developerInfoText,
                        mentions: isGroup ? [userId] : undefined
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

                    await sock.sendMessage(chatId, {
                        text: basicInfo,
                        mentions: isGroup ? [userId] : undefined
                    });
                }
            }
        }

        // Enhanced sticker creation command (supports both images and videos/GIFs)
        if (messageText.startsWith('!sticker') || messageText === '!sticker') {
            // Check rate limiting for sticker creation
            const rateCheck = checkRateLimit(userId, 'sticker');
            if (!rateCheck.allowed) {
                const rateLimitMsg = isGroup 
                    ? `⏰ @${userId.split('@')[0]} ${rateCheck.reason}`
                    : `⏰ ${rateCheck.reason}`;
                return sock.sendMessage(chatId, { 
                    text: rateLimitMsg,
                    mentions: isGroup ? [userId] : undefined
                });
            }

            // Check if user already has an active sticker process
            if (activeProcesses.has(`${userId}_sticker`)) {
                const processingMsg = isGroup 
                    ? `🎬 @${userId.split('@')[0]} Please wait, I'm still processing your previous sticker request...`
                    : "🎬 Please wait, I'm still processing your previous sticker request...";
                return sock.sendMessage(chatId, { 
                    text: processingMsg,
                    mentions: isGroup ? [userId] : undefined
                });
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

                        await sock.sendMessage(chatId, {
                            sticker: webpBuffer
                        }, quoted ? { quoted: msg } : {});

                        console.log(`✅ Static sticker sent successfully to ${senderName}`);

                    } else if (mediaType === 'video') {
                        // Process as animated sticker using existing animated sticker functionality
                        console.log(`🎬 Processing animated sticker for user ${senderName}...`);

                        const processingMsg = isGroup 
                            ? `🎬 @${userId.split('@')[0]} Sir, converting your video/GIF to animated sticker... This may take a moment.\n⏱️ Maximum duration: ${MAX_STICKER_DURATION} seconds`
                            : `🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.\n⏱️ Maximum duration: ${MAX_STICKER_DURATION} seconds`;

                        await sock.sendMessage(chatId, {
                            text: processingMsg,
                            mentions: isGroup ? [userId] : undefined
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
                            await sock.sendMessage(chatId, {
                                sticker: stickerBuffer
                            }, quoted ? { quoted: msg } : {});

                            console.log(`✅ Animated sticker sent successfully to ${senderName}`);

                        } catch (conversionError) {
                            console.error(`❌ Error converting video to animated sticker for ${senderName}:`, conversionError);
                            const errorMsg = isGroup 
                                ? `❌ @${userId.split('@')[0]} Sir, failed to convert video to animated sticker. The video might be too large or in an unsupported format.`
                                : '❌ Sir, failed to convert video to animated sticker. The video might be too large or in an unsupported format.';
                            await sock.sendMessage(chatId, {
                                text: errorMsg,
                                mentions: isGroup ? [userId] : undefined
                            });
                        } finally {
                            // Clean up temporary files
                            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        }
                    }

                } else {
                    const usageMsg = isGroup 
                        ? `❗ @${userId.split('@')[0]} Sir. Please send an image or video/GIF with !sticker caption or reply to media with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker (creates static sticker)\n• Send video/GIF with caption: !sticker (creates animated sticker)\n• Reply to image with: !sticker\n• Reply to video/GIF with: !sticker`
                        : '❗ Sir. Please send an image or video/GIF with !sticker caption or reply to media with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker (creates static sticker)\n• Send video/GIF with caption: !sticker (creates animated sticker)\n• Reply to image with: !sticker\n• Reply to video/GIF with: !sticker';
                    await sock.sendMessage(chatId, {
                        text: usageMsg,
                        mentions: isGroup ? [userId] : undefined
                    });
                }
            } catch (error) {
                console.error(`❌ Error creating sticker for ${senderName}:`, error);
                const errorMsg = isGroup 
                    ? `❌ @${userId.split('@')[0]} Failed to create sticker. Please try again with a valid image or video/GIF.`
                    : '❌ Failed to create sticker. Please try again with a valid image or video/GIF.';
                await sock.sendMessage(chatId, {
                    text: errorMsg,
                    mentions: isGroup ? [userId] : undefined
                });
            } finally {
                // Remove from active processes
                activeProcesses.delete(`${userId}_sticker`);
            }
        }

        // Invalid command detection with video preview (GIF-like)
        if (messageText.startsWith('!') &&
            messageText !== '!commands' &&
            messageText !== '!help' &&
            messageText !== '!sticker' &&
            messageText !== '!aboutdev' &&
            messageText !== '!stats' &&
            messageText !== '!memory' &&
            messageText !== '!forgetme' &&
            messageText !== '!clearcontext' &&
            messageText !== '!ping' &&
            messageText !== '!test' &&
            messageText !== '!info' &&
            messageText !== '!about' &&
            messageText !== '!version' &&
            messageText !== '!menu' &&
            messageText !== '!start' &&
            messageText !== '!bot' &&
            messageText !== '!alive' &&
            messageText !== '!uptime' &&
            messageText !== '!status' &&
            !messageText.startsWith('!chat ') &&
            !messageText.startsWith('!conv ')) {

            console.log(`❌ Invalid command "${messageText}" from ${senderName}, sending video GIF response...`);

            try {
                console.log(`📂 Reading IRON-MAN video file for ${senderName}...`);
                const ironmanVideoBuffer = fs.readFileSync('./src/ironman.mp4');
                console.log(`📏 Video file size: ${(ironmanVideoBuffer.length / 1024).toFixed(2)} KB`);

                const invalidCommandMessage = `❌ *Invalid Command: "${messageText}"*\n\n` +
                    `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}🤖 Sir, that command is not recognized in my database.\n\n` +
                    `📝 Type *!commands* to show all commands\n` +
                    `⚙️ *IRON-MAN Bot v${BOT_VERSION}*\n` +
                    `👤 Your session: ${userSession.messageCount} messages`;

                // Try multiple methods to send the video as GIF-like preview
                try {
                    console.log(`🎬 Attempting to send video as GIF playback to ${senderName}...`);
                    const mentions = isGroup ? [actualSender] : [];
                    await sock.sendMessage(chatId, {
                        video: ironmanVideoBuffer,
                        gifPlayback: true,
                        caption: invalidCommandMessage,
                        mimetype: 'video/mp4',
                        fileName: 'ironman.mp4',
                        mentions
                    });
                    console.log(`✅ Invalid command video sent successfully as GIF playback to ${senderName}`);
                } catch (videoGifError) {
                    console.log(`⚠️ Video as GIF failed for ${senderName}:`, videoGifError.message);
                    try {
                        console.log(`🎥 Attempting to send as regular video to ${senderName}...`);
                        const mentions = isGroup ? [actualSender] : [];
                        await sock.sendMessage(chatId, {
                            video: ironmanVideoBuffer,
                            caption: invalidCommandMessage,
                            mimetype: 'video/mp4',
                            fileName: 'ironman.mp4',
                            mentions
                        });
                        console.log(`✅ Invalid command video sent successfully as regular video to ${senderName}`);
                    } catch (regularVideoError) {
                        console.log(`⚠️ Regular video failed for ${senderName}:`, regularVideoError.message);
                        // Try sending as document
                        console.log(`📄 Attempting to send video as document to ${senderName}...`);
                        const mentions = isGroup ? [actualSender] : [];
                        await sock.sendMessage(chatId, {
                            document: ironmanVideoBuffer,
                            fileName: 'ironman.mp4',
                            mimetype: 'video/mp4',
                            caption: invalidCommandMessage,
                            mentions
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
                    const mentions = isGroup ? [actualSender] : [];
                    await sock.sendMessage(chatId, {
                        image: ironmanImageBuffer,
                        caption: invalidCommandMessage,
                        mimetype: 'image/jpeg',
                        mentions
                    });
                    console.log(`✅ Invalid command response sent as static image fallback to ${senderName}`);
                } catch (finalError) {
                    console.error(`🚨 All fallback methods failed for ${senderName}:`, finalError.message);
                    // Ultimate fallback - text only
                    const mentions = isGroup ? [actualSender] : [];
                    await sock.sendMessage(chatId, { text: invalidCommandMessage, mentions });
                    console.log(`✅ Invalid command response sent as text-only (ultimate fallback) to ${senderName}`);
                }
            }
        }

        // AI-powered Chat command
        if (messageText.startsWith('!chat ')) {
            const prompt = messageText.substring(6).trim(); // Remove '!chat ' and trim whitespace
            if (!prompt) {
                const errorMsg = isGroup 
                    ? `❌ @${userId.split('@')[0]} Usage: !chat <prompt>`
                    : "❌ Usage: !chat <prompt>";
                await sock.sendMessage(chatId, { 
                    text: errorMsg,
                    mentions: isGroup ? [userId] : undefined
                });
            } else {
                await handleChatCommand(sock, msg, [prompt]);
            }
        }

        // YouTube to MP3/MP4 conversion command
        if (messageText.startsWith('!conv ')) {
            const args = messageText.substring(6).trim().split(/\s+/); // Remove '!conv ' and split by whitespace
            const url = args[0];
            const quality = args[1]?.toLowerCase() || 'mp3'; // Default to MP3
            
            if (!url) {
                const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, { 
                    text: `${mentionText}❌ Usage: !conv <youtube_url> [quality]\n\n📌 Examples:\n` +
                          `• !conv <url>          → Download as MP3 (audio)\n` +
                          `• !conv <url> mp3      → Download as MP3\n` +
                          `• !conv <url> 360p     → Download as 360p video\n` +
                          `• !conv <url> 480p     → Download as 480p video\n` +
                          `• !conv <url> 720p     → Download as 720p video\n\n` +
                          `🎵 Supported qualities: mp3, 360p, 480p, 720p\n` +
                          `💡 Files will be sent as documents!`,
                    mentions
                });
                return;
            }

            // Validate quality parameter
            const validQualities = ['mp3', 'audio', '360p', '480p', '720p'];
            if (!validQualities.includes(quality)) {
                const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, { 
                    text: `${mentionText}❌ Invalid quality: ${quality}\n\n🎵 Supported qualities: mp3, 360p, 480p, 720p`,
                    mentions
                });
                return;
            }

            // Check rate limiting
            const rateCheck = checkRateLimit(userId, 'general');
            if (!rateCheck.allowed) {
                const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';
                const mentions = isGroup ? [actualSender] : [];
                return sock.sendMessage(chatId, { text: `${mentionText}⏰ ${rateCheck.reason}`, mentions });
            }

            // Check if user already has an active conversion process
            if (activeProcesses.has(`${userId}_conv`)) {
                const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';
                const mentions = isGroup ? [actualSender] : [];
                return sock.sendMessage(chatId, { text: `${mentionText}🎵 Please wait, I'm still processing your previous conversion request...`, mentions });
            }

            // Mark as active
            activeProcesses.set(`${userId}_conv`, Date.now());

            try {
                const isAudio = quality === 'mp3' || quality === 'audio';
                const mediaType = isAudio ? 'MP3' : `${quality.toUpperCase()} video`;
                
                console.log(`� YouTube download requested by ${senderName}: ${url} (${quality})`);
                
                // Send processing message
                const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, { 
                    text: `${mentionText}${isAudio ? '🎵' : '🎬'} Converting YouTube video to ${mediaType}...\n⏳ Please wait, this may take a few moments.\n\n🔗 URL: ${url}`,
                    mentions
                });

                // Download YouTube media
                const result = await downloadYouTubeMedia(url, quality);
                
                if (result && result.stream) {
                    const { stream, videoInfo, videoId, fileType, mimeType } = result;
                    
                    try {
                        // Send downloading message with video info
                        const videoTitle = videoInfo?.title || 'Unknown';
                        const videoDuration = videoInfo?.duration || null;
                        const durationFormatted = videoDuration ? `${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}` : 'Unknown';
                        
                        await sock.sendMessage(chatId, {
                            text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}📥 *Downloading ${fileType.toUpperCase()} file...*\n\n${isAudio ? '🎵' : '🎬'} *${videoTitle}*\n⏱️ Duration: ${durationFormatted}\n⏳ Please wait while I prepare your file.`,
                            mentions: isGroup ? [actualSender] : []
                        });

                        console.log(`📥 Downloading ${fileType.toUpperCase()} stream for video: ${videoId}`);
                        
                        // Convert stream to buffer
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const mediaBuffer = Buffer.concat(chunks);
                        console.log(`✅ ${fileType.toUpperCase()} downloaded successfully. Size: ${(mediaBuffer.length / 1024 / 1024).toFixed(2)} MB`);

                        // Check file size (WhatsApp limit is ~100MB for documents)
                        const fileSizeMB = mediaBuffer.length / 1024 / 1024;
                        if (fileSizeMB > 95) {
                            await sock.sendMessage(chatId, {
                                text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}❌ File is too large (${fileSizeMB.toFixed(2)} MB).\n\n💡 Try downloading a lower quality:\n• !conv ${url} mp3 (audio only)\n• !conv ${url} 360p (smaller video)`,
                                mentions: isGroup ? [actualSender] : []
                            });
                            return;
                        }

                        // Generate a clean filename
                        let filename = videoTitle.replace(/[^\w\s-]/g, '').trim();
                        filename = filename.substring(0, 50); // Limit to 50 characters
                        filename = `${filename}.${fileType}`;

                        // Send the file as a document
                        await sock.sendMessage(chatId, {
                            document: mediaBuffer,
                            fileName: filename,
                            mimetype: mimeType,
                            caption: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}${isAudio ? '🎵' : '🎬'} *${videoTitle}*\n\n` +
                                   `⏱️ *Duration:* ${durationFormatted}\n` +
                                   `📁 *File Size:* ${fileSizeMB.toFixed(2)} MB\n` +
                                   `🎯 *Quality:* ${quality.toUpperCase()}\n` +
                                   `👁️ *Views:* ${videoInfo?.views ? parseInt(videoInfo.views).toLocaleString() : 'Unknown'}\n` +
                                   `👤 *Channel:* ${videoInfo?.channel || 'Unknown'}\n` +
                                   `⚡ *Downloaded by IRON-MAN Bot v${BOT_VERSION}*`,
                            mentions: isGroup ? [actualSender] : []
                        });

                        console.log(`✅ ${fileType.toUpperCase()} document sent successfully to ${senderName}: ${videoTitle}`);

                    } catch (downloadError) {
                        console.error(`❌ Download/send error for ${senderName}:`, downloadError.message);
                        
                        await sock.sendMessage(chatId, {
                            text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}❌ Failed to download or send the file.\n\n` +
                                  `⚠️ Error: ${downloadError.message}\n\n` +
                                  `� The video might be too large or unavailable. Try with a shorter video!`,
                            mentions: isGroup ? [actualSender] : []
                        });
                    }
                } else {
                    await sock.sendMessage(chatId, { 
                        text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}❌ Download failed. Invalid YouTube URL or video ID.\n\n💡 Please check the URL and try again.`,
                        mentions: isGroup ? [actualSender] : []
                    });
                    console.log(`❌ Conversion failed for ${senderName}. Invalid result structure.`);
                }

            } catch (error) {
                console.error(`❌ YouTube download error for ${senderName}:`, error.message);
                
                let errorMessage = `❌ Failed to download YouTube ${quality === 'mp3' || quality === 'audio' ? 'audio' : 'video'}.`;
                if (error.message.includes('timeout')) {
                    errorMessage = "⏰ Download timed out. The video might be too long.";
                } else if (error.message.includes('No suitable') || error.message.includes('format')) {
                    errorMessage = `❌ ${quality.toUpperCase()} quality is not available for this video.\n\n💡 Try a different quality: mp3, 360p, 480p, or 720p`;
                } else if (error.response?.status === 429) {
                    errorMessage = "🚫 Download service is busy. Please try again in a few moments.";
                } else if (error.response?.status === 400) {
                    errorMessage = "❌ Invalid YouTube URL or video is not available.";
                } else if (error.response?.status === 401) {
                    errorMessage = "🔑 API key authentication failed. Please check the API configuration.";
                } else if (error.response?.status === 403) {
                    errorMessage = "🚫 API access forbidden. The API key might be invalid or suspended.";
                } else if (error.response?.status >= 500) {
                    errorMessage = "🔧 Download service is experiencing technical difficulties. Please try again later.";
                }
                
                await sock.sendMessage(chatId, { 
                    text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}${errorMessage}`,
                    mentions: isGroup ? [actualSender] : []
                });
            } finally {
                // Remove from active processes
                activeProcesses.delete(`${userId}_conv`);
            }
        }

        // Common command redirects - Handle commands users might expect
        if (messageText === '!ping' || messageText === '!test' || messageText === '!alive') {
            await sock.sendMessage(chatId, {
                text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}🏓 *Pong!* Bot is alive and running!\n\n` +
                    `⚡ Response time: ${Date.now() - userSession.lastActivity}ms\n` +
                    `🤖 Status: Online\n` +
                    `📊 Type *!stats* for detailed statistics\n` +
                    `📝 Type *!commands* for all available commands`,
                mentions: isGroup ? [actualSender] : []
            });
        }

        if (messageText === '!info' || messageText === '!about' || messageText === '!version') {
            await sock.sendMessage(chatId, {
                text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}🤖 *IRON-MAN Bot Information*\n\n` +
                    `🔥 Version: 1.5.0 - AI Memory & Media Edition\n` +
                    `👨‍💻 Developer: Pasindu Madhuwantha (PasinduOG)\n` +
                    `⚙️ Built with: Node.js, Baileys, MongoDB\n` +
                    `🌟 Features: AI Chat with Memory, Sticker Creation, YouTube to MP3, Session Persistence\n\n` +
                    `📝 Type *!help* for detailed help\n` +
                    `👨‍💻 Type *!aboutdev* for developer info with GitHub data`,
                mentions: isGroup ? [actualSender] : []
            });
        }

        if (messageText === '!menu' || messageText === '!start') {
            await sock.sendMessage(chatId, {
                text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}🤖 *Welcome to IRON-MAN Bot!*\n\n` +
                    `Hi ${senderName}! I'm your AI-powered WhatsApp assistant.\n\n` +
                    `📋 Type *!commands* to see all available commands\n` +
                    `❓ Type *!help* for detailed help and instructions\n` +
                    `🧠 Try *!chat <your question>* for AI-powered responses\n\n` +
                    `Let's get started! 🚀`,
                mentions: isGroup ? [actualSender] : []
            });
        }

        if (messageText === '!bot' || messageText === '!uptime' || messageText === '!status') {
            const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
            const uptimeMinutes = Math.floor(uptimeSeconds / 60);
            const uptimeHours = Math.floor(uptimeMinutes / 60);
            const uptimeDays = Math.floor(uptimeHours / 24);

            let uptimeText = '';
            if (uptimeDays > 0) uptimeText += `${uptimeDays}d `;
            if (uptimeHours % 24 > 0) uptimeText += `${uptimeHours % 24}h `;
            if (uptimeMinutes % 60 > 0) uptimeText += `${uptimeMinutes % 60}m `;
            uptimeText += `${uptimeSeconds % 60}s`;

            await sock.sendMessage(chatId, {
                text: `${isGroup ? `@${actualSender.split('@')[0]} ` : ''}🤖 *Bot Status Report*\n\n` +
                    `✅ Status: Online & Active\n` +
                    `⏰ Uptime: ${uptimeText}\n` +
                    `👥 Active users: ${userSessions.size}\n` +
                    `⚙️ Active processes: ${activeProcesses.size}\n` +
                    `🔄 Your session: ${userSession.messageCount} messages\n\n` +
                    `📊 Type *!stats* for your personal statistics`,
                mentions: isGroup ? [actualSender] : []
            });
        }

        // Memory management commands
        if (messageText === '!memory') {
            const userNumber = userId.split('@')[0];
            const memoryStats = await getMemoryStats(userNumber);
            const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';

            if (memoryStats.totalMessages > 0) {
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, {
                    text: `${mentionText}🧠 *Your AI Memory Statistics*

📊 *Memory Overview:*
• Total messages: ${memoryStats.totalMessages}
• Your messages: ${memoryStats.userMessages}  
• AI responses: ${memoryStats.aiMessages}

📅 *Timeline:*
• First message: ${memoryStats.oldestMessage ? new Date(memoryStats.oldestMessage).toLocaleString() : 'N/A'}
• Latest message: ${memoryStats.newestMessage ? new Date(memoryStats.newestMessage).toLocaleString() : 'N/A'}
• Last updated: ${memoryStats.lastUpdated ? new Date(memoryStats.lastUpdated).toLocaleString() : 'Never'}

💡 *How it works:*
• I remember our last 10 conversation exchanges
• This helps me provide more personalized responses
• Use *!forgetme* to clear your memory if needed

🤖 Keep chatting to build better AI conversations!`,
                    mentions
                });
            } else {
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, {
                    text: `${mentionText}🧠 *Your AI Memory*

📊 No conversation history found yet.

💡 Start chatting with *!chat <your message>* to build memory!
The AI will remember your last 10 conversation exchanges for more personalized responses.`,
                    mentions
                });
            }
        }

        if (messageText.toLowerCase().trim() === '!forgetme' || messageText.toLowerCase().trim() === '!clearcontext') {
            console.log(`🗑️ Memory clear command received from ${senderName} (${userId})`);
            const userNumber = userId.split('@')[0];
            const mentionText = isGroup ? `@${actualSender.split('@')[0]} ` : '';

            try {
                console.log(`🔄 Attempting to clear memory for user: ${userNumber}`);
                await clearAllMemory(userNumber);
                console.log(`✅ Memory cleared successfully for user: ${userNumber}`);
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, {
                    text: `${mentionText}🧠 *Memory Cleared Successfully*

✅ All your conversation memory has been cleared.
🔄 Future AI conversations will start fresh.
💡 Use *!chat <message>* to start building new memory.

Your session statistics and other data remain unchanged.`,
                    mentions
                });
            } catch (error) {
                console.error(`❌ Error clearing memory for ${userNumber}:`, error);
                const mentions = isGroup ? [actualSender] : [];
                await sock.sendMessage(chatId, {
                    text: `${mentionText}❌ Failed to clear memory. Please try again later.`,
                    mentions
                });
            }
        }
        } catch (error) {
            // Handle session/decryption errors gracefully
            if (error.message?.includes('MessageCounterError') || 
                error.message?.includes('decrypt') ||
                error.message?.includes('session')) {
                console.error('⚠️ Session decryption error (common WhatsApp issue):', error.message);
                console.log('💡 This is usually temporary and will resolve on the next message');
                // Don't crash the bot, just skip this message
                return;
            }
            
            // For other errors, log them but don't crash
            console.error('❌ Error processing message:', error);
        }
    });

    return sock;
}

// Helper: Optimized image media download with streaming
async function downloadMedia(sock, message) {
    const stream = await downloadContentFromMessage(message, 'image');
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

// Helper: Optimized video/GIF media download with streaming
async function downloadVideoMedia(sock, message, mediaType = 'video') {
    const stream = await downloadContentFromMessage(message, mediaType);
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
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

// Helper: Ultra-compressed conversion optimized for speed
async function convertToAnimatedStickerUltraCompressed(inputPath, outputPath, maxDuration = 3) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Conversion timeout'));
        }, STICKER_PROCESSING_TIMEOUT);

        ffmpeg(inputPath)
            .inputOptions([
                '-t', maxDuration.toString(),  // Reduced max duration for faster processing
                '-ss', '0'
            ])
            .outputOptions([
                '-vf', 'scale=320:320:force_original_aspect_ratio=decrease,fps=10', // Reduced size and fps for speed
                '-c:v', 'libwebp',
                '-quality', '35',        // Reduced quality for faster processing
                '-preset', 'picture',
                '-loop', '0',
                '-compression_level', '4', // Reduced compression for speed
                '-method', '4',            // Faster method
                '-an'
            ])
            .format('webp')
            .on('start', (commandLine) => {
                console.log('🎬 Ultra-compressed FFmpeg command: ' + commandLine);
                console.log(`⏱️ Ultra-compressed duration set to: ${maxDuration} seconds`);
                console.log('📐 Using optimized scaling (320x320 max) for speed');
            })
            .on('end', () => {
                clearTimeout(timeout);
                console.log('✅ Ultra-compressed animated sticker conversion completed');
                resolve(true);
            })
            .on('error', (err) => {
                clearTimeout(timeout);
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
                        <p style="margin: 5px 0; font-weight: bold; color: #333;">� Primary Commands:</p>
                        <p style="margin: 5px 0;">🧠 <strong>!chat &lt;prompt&gt;</strong> - Get AI-powered responses</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image/video/GIF to sticker</p>
                        <p style="margin: 5px 0;">👨‍💻 <strong>!aboutdev</strong> - Live GitHub developer info with image</p>
                        <p style="margin: 5px 0;">❓ <strong>!help</strong> - Bot help center</p>
                        <p style="margin: 5px 0;">📋 <strong>!commands</strong> - Command list</p>
                        <p style="margin: 5px 0;">📊 <strong>!stats</strong> - Show your usage statistics</p>
                        
                        <p style="margin: 15px 0 5px 0; font-weight: bold; color: #333;">🧠 Memory Management:</p>
                        <p style="margin: 5px 0;">📊 <strong>!memory</strong> - Show your conversation memory stats</p>
                        <p style="margin: 5px 0;">🗑️ <strong>!forgetme</strong> - Clear all your conversation memory</p>
                        <p style="margin: 5px 0;">🔄 <strong>!clearcontext</strong> - Clear conversation context (same as forgetme)</p>
                        
                        <p style="margin: 15px 0 5px 0; font-weight: bold; color: #333;">🔧 Quick Commands:</p>
                        <p style="margin: 5px 0;">🏓 <strong>!ping, !test, !alive</strong> - Check bot status</p>
                        <p style="margin: 5px 0;">ℹ️ <strong>!info, !about, !version</strong> - Bot information</p>
                        <p style="margin: 5px 0;">🚀 <strong>!menu, !start</strong> - Welcome menu</p>
                        <p style="margin: 5px 0;">⏰ <strong>!bot, !uptime, !status</strong> - Bot uptime and status</p>
                        
                        <p style="margin: 15px 0 5px 0; font-weight: bold; color: #333;">🧠 Memory Management:</p>
                        <p style="margin: 5px 0;">📊 <strong>!memory</strong> - Show your conversation memory stats</p>
                        <p style="margin: 5px 0;">🗑️ <strong>!forgetme</strong> - Clear all your conversation memory</p>
                        <p style="margin: 5px 0;">🧹 <strong>!clearcontext</strong> - Clear conversation context (same as forgetme)</p>
                        
                        <p style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-left: 4px solid #4CAF50;">
                            <span style="font-weight: bold; color: #2e7d32;">🧠 AI Memory System</span><br>
                            Conversations are now remembered for personalized AI responses with 10-message context!
                        </p>
                        <p style="margin-top: 15px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-left: 4px solid #4CAF50;">
                            <span style="font-weight: bold; color: #2e7d32;">🗄️ Session Persistence</span><br>
                            Your session is safely stored in MongoDB and will persist across deployments!
                        </p>
                        <p style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 10px; border-left: 4px solid #2196F3;">
                            <span style="font-weight: bold; color: #1976d2;">👥 Multi-User Support</span><br>
                            Optimized for concurrent users with rate limiting and session management!
                        </p>
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
