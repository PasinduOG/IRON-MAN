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
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables from .env file
require('dotenv').config();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const welcomeMessage = "Hello!... I'm Jarvis. How can I assist you today?...😊";
const greetingMessge = "At your service, sir";

// Animated Sticker Configuration
const MAX_STICKER_DURATION = 10; // Maximum animation length in seconds (adjustable)
const MAX_STICKER_DURATION_COMPRESSED = 6; // Maximum duration for compressed stickers

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pasinduogdev:PasinduDev678@cluster0.4ns3c.mongodb.net/iron-man-bot';

// Google Gemini AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here';

// Validate API key on startup
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️ Warning: Gemini API key not configured. AI features will be disabled.');
    console.log('To enable AI features:');
    console.log('1. Get API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Add to .env file: GEMINI_API_KEY=your_actual_api_key');
} else {
    console.log('✅ Gemini API key loaded successfully');
    console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
            console.log('✅ Jarvis: online and ready');
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

        console.log(`New message from ${msg.key.remoteJid}:`, msg.message);

        // Extract message text from different message types
        const messageText = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.gifMessage?.caption ||
            '';

        const welcomeRegex = /^(hi|hello|hey)(\s|$)/i;
        const greetingRegex = /^(jarvis)(\s|$)/i;

        if (welcomeRegex.test(messageText)) {
            sock.sendMessage(msg.key.remoteJid, { text: welcomeMessage });
        }

        if (greetingRegex.test(messageText)) {
            sock.sendMessage(msg.key.remoteJid, { text: greetingMessge });
        }

        if (messageText === '!help') {
            const imageBuffer = fs.readFileSync('./src/ironman.jpg') // your image path

            await sock.sendMessage(msg.key.remoteJid, {
                image: imageBuffer,
                caption: `🤖 *IRON-MAN Bot Help Center*

Available Commands:
- *!commands* : List all commands
- *!sticker* : Convert image/video/GIF to sticker
- *!jarvis <your message>* : Get AI-powered responses from Jarvis

⚙️ Bot created by *Pasindu OG Dev*
📌 Version: 1.2.2`
            });
        }

        if (messageText === '!commands') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📝 Available Commands:
- hi, hello, hey : Casual Jarvis greeting
- jarvis : Formal greeting  
- !commands : Show all commands
- !help : Get help info
- !sticker : Convert image/video/GIF to sticker
- !jarvis <your message> : Get AI-powered responses from Jarvis

Use them in chat to try them out! 👌` })
        }

        // Enhanced regex pattern for developer info queries
        // Matches: "who is pasindu", "who is madhuwantha", "who is og", "who is pasinduog",
        // "tell me about pasindu", "about pasindu madhuwantha", "what about og", etc.
        const developerInfoPattern = /(?:who\s+is|tell\s+me\s+about|about|what\s+about)\s+(?:pasindu(?:\s+madhuwantha)?|madhuwantha|og|pasinduog|the\s+developer|creator|owner|dev)/i;

        if (developerInfoPattern.test(messageText)) {
            const senderName = msg.pushName || 'User';

            console.log(`👨‍💻 Developer info requested by ${senderName}`);

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
                // Try to load developer image from GitHub avatar URL
                let developerImageBuffer;
                try {
                    console.log('📥 Downloading developer image from GitHub...');
                    const response = await axios.get('https://avatars.githubusercontent.com/u/126347762?v=4', {
                        responseType: 'arraybuffer',
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'User-Agent': 'IRON-MAN-Bot/1.2.2'
                        }
                    });
                    developerImageBuffer = Buffer.from(response.data);
                    console.log('✅ Developer image downloaded successfully');
                } catch (imageError) {
                    console.log('⚠️ Failed to download GitHub avatar:', imageError.message);
                    console.log('🔄 Using fallback Iron Man image');
                    // Fallback to Iron Man image if GitHub avatar fails
                    developerImageBuffer = fs.readFileSync('./src/ironman.jpg');
                }

                const developerInfo = `👨‍💻 *About Pasindu Madhuwantha (PasinduOG)*\n\n` +
                    `🌟 *Professional Background:*\n` +
                    `• Passionate Backend Developer & Technology Enthusiast\n` +
                    `• Remote Worker with expertise in modern web technologies\n` +
                    `• Self-taught programmer continuously learning new technologies\n` +
                    `• Specializes in Microservices and Backend Architecture\n\n` +

                    `💻 *Technical Skills:*\n` +
                    `• Languages: JavaScript, Node.js, Python, HTML, CSS\n` +
                    `• Backend Development & API Design\n` +
                    `• Database Management (MySQL, MongoDB)\n` +
                    `• Modern Web Technologies & Frameworks\n` +
                    `• Microservices Architecture & WhatsApp Bot Development\n\n` +

                    `🚀 *Notable Projects:*\n` +
                    `• IRON-MAN - Advanced WhatsApp Sticker & Animation Bot\n` +
                    `• MASTER-CHIEF - Advanced WhatsApp Sticker & Command Bot\n` +
                    `• YouTube Downloader - Web app for video/audio downloads\n` +
                    `• Express API Projects - Various REST APIs with validation\n` +
                    `• Facebook Video Downloader - Social media content tool\n\n` +

                    `📊 *GitHub Activity:*\n` +
                    `• 425+ contributions in the last year\n` +
                    `• 18+ public repositories\n` +
                    `• Active in open-source development\n` +
                    `• Achievements: Quickdraw, YOLO, Pull Shark\n\n` +

                    `🌐 *Connect & Contact:*\n` +
                    `• GitHub: @PasinduOG\n` +
                    `• Email: pasinduogdev@gmail.com\n` +
                    `• Location: Kalutara, Sri Lanka\n` +
                    `• Social Media: Facebook, YouTube, Discord\n\n` +

                    `⚡ *Fun Facts:*\n` +
                    `• Quote: "I hate frontends" (Backend developer at heart!)\n` +
                    `• Always exploring cutting-edge technologies\n` +
                    `• Believes in continuous learning and innovation\n` +
                    `• Founder and Lead Developer of @KreedXDevClub\n\n` +

                    `💡 *Philosophy:*\n` +
                    `"Interest for Backend Programming with a deep passion for exploring and researching cutting-edge technologies"\n\n` +

                    `🔗 *Support:*\n` +
                    `• Buy Me a Coffee: buymeacoffee.com/pasinduogdev\n` +
                    `• Open to collaborations and new opportunities!\n\n` +

                    `*Built with ❤️ by Pasindu Madhuwantha*`;

                // Send developer info with image preview
                await sock.sendMessage(msg.key.remoteJid, {
                    image: developerImageBuffer,
                    caption: developerInfo
                });

                console.log('✅ Developer info sent successfully with image preview');
            } catch (error) {
                console.error('Error sending developer info:', error);

                // Fallback: Send text-only developer info if image fails
                const developerInfoText = `👨‍💻 *About Pasindu Madhuwantha (PasinduOG)*\n\n` +
                    `🌟 Backend Developer & Technology Enthusiast\n` +
                    `💻 Expert in Node.js, JavaScript, MongoDB\n` +
                    `🚀 Creator of IRON-MAN WhatsApp Bot\n` +
                    `🌐 GitHub: @PasinduOG\n` +
                    `📧 Email: pasinduogdev@gmail.com\n\n` +
                    `*Built with ❤️ by Pasindu Madhuwantha*`;

                await sock.sendMessage(msg.key.remoteJid, {
                    text: developerInfoText
                });
            }
        }

        // Enhanced sticker creation command (supports both images and videos/GIFs)
        if (messageText.startsWith('!sticker') || messageText === '!sticker') {
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
                        console.log('Processing static sticker from image...');
                        const buffer = await downloadMedia(sock, mediaMessage);

                        const webpBuffer = await sharp(buffer)
                            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                            .webp({ quality: 80 })
                            .toBuffer();

                        await sock.sendMessage(msg.key.remoteJid, {
                            sticker: webpBuffer
                        }, quoted ? { quoted: msg } : {});

                        console.log('✅ Static sticker sent successfully');

                    } else if (mediaType === 'video') {
                        // Process as animated sticker using existing animated sticker functionality
                        console.log(`Processing animated sticker from ${mediaType} using !sticker command...`);

                        await sock.sendMessage(msg.key.remoteJid, {
                            text: `🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.\n⏱️ Maximum duration: ${MAX_STICKER_DURATION} seconds`
                        });

                        // Download the video/GIF
                        const buffer = await downloadVideoMedia(sock, mediaMessage, mediaType);

                        // Save to temporary file
                        const inputPath = `./temp_input_${Date.now()}.mp4`;
                        const outputPath = `./temp_output_${Date.now()}.webp`;

                        fs.writeFileSync(inputPath, buffer);

                        try {
                            // Convert to animated WebP using existing function
                            await convertToAnimatedSticker(inputPath, outputPath, MAX_STICKER_DURATION);

                            // Check file size (WhatsApp limit is around 500KB for stickers)
                            const stats = fs.statSync(outputPath);
                            const fileSizeInKB = stats.size / 1024;
                            console.log(`📏 Generated animated sticker size: ${fileSizeInKB.toFixed(2)} KB`);

                            if (fileSizeInKB > 500) {
                                console.log('⚠️ File too large, attempting to compress further...');
                                // Try again with ultra compression
                                await convertToAnimatedStickerUltraCompressed(inputPath, outputPath, MAX_STICKER_DURATION_COMPRESSED);
                                const newStats = fs.statSync(outputPath);
                                const newFileSizeInKB = newStats.size / 1024;
                                console.log(`📏 Compressed animated sticker size: ${newFileSizeInKB.toFixed(2)} KB`);
                            }

                            // Read the converted file
                            const stickerBuffer = fs.readFileSync(outputPath);

                            // Send as sticker
                            await sock.sendMessage(msg.key.remoteJid, {
                                sticker: stickerBuffer
                            }, quoted ? { quoted: msg } : {});

                            console.log('✅ Animated sticker sent successfully via !sticker command');

                        } catch (conversionError) {
                            console.error('Error converting video to animated sticker:', conversionError);
                            await sock.sendMessage(msg.key.remoteJid, {
                                text: '❌ Sir, failed to convert video to animated sticker. The video might be too large or in an unsupported format.'
                            });
                        } finally {
                            // Clean up temporary files
                            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        }
                    }

                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '❗ Sir. Please send an image or video/GIF with !sticker caption or reply to media with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker (creates static sticker)\n• Send video/GIF with caption: !sticker (creates animated sticker)\n• Reply to image with: !sticker\n• Reply to video/GIF with: !sticker'
                    });
                }
            } catch (error) {
                console.error('Error creating sticker:', error);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Failed to create sticker. Please try again with a valid image or video/GIF.'
                });
            }
        }

        // Alternative: Just detect any image and provide sticker option
        else if (msg.message?.imageMessage && !messageText) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '📸 Sir I see you sent an image! Send "!sticker" to convert it to a sticker.'
            });
        }

        // Alternative: Just detect any video/GIF and provide sticker option  
        else if ((msg.message?.videoMessage || msg.message?.gifMessage) && !messageText) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🎬 Sir I see you sent a video/GIF! Send "!sticker" to convert it to an animated sticker.'
            });
        }

        // Invalid command detection with video preview (GIF-like)
        if (messageText.startsWith('!') && 
            messageText !== '!commands' && 
            messageText !== '!help' && 
            messageText !== '!sticker' &&
            !messageText.startsWith('!jarvis ')) {
            
            console.log(`❌ Invalid command "${messageText}", sending video GIF response...`);
            
            try {
                console.log('📂 Reading IRON-MAN video file...');
                const ironmanVideoBuffer = fs.readFileSync('./src/ironman.mp4');
                console.log(`📏 Video file size: ${(ironmanVideoBuffer.length / 1024).toFixed(2)} KB`);
                
                const invalidCommandMessage = `❌ *Invalid Command: "${messageText}"*\n\n` +
                    `🤖 Sir, that command is not recognized in my database.\n\n` +
                    `📝 Type *!commands* to show all commands\n` +
                    `⚙️ *IRON-MAN Bot v1.2.2*`;

                // Try multiple methods to send the video as GIF-like preview
                try {
                    console.log('🎬 Attempting to send video as GIF playback...');
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: ironmanVideoBuffer,
                        gifPlayback: true,
                        caption: invalidCommandMessage,
                        mimetype: 'video/mp4',
                        fileName: 'ironman.mp4'
                    });
                    console.log('✅ Invalid command video sent successfully as GIF playback');
                } catch (videoGifError) {
                    console.log('⚠️ Video as GIF failed:', videoGifError.message);
                    try {
                        console.log('🎥 Attempting to send as regular video...');
                        await sock.sendMessage(msg.key.remoteJid, {
                            video: ironmanVideoBuffer,
                            caption: invalidCommandMessage,
                            mimetype: 'video/mp4',
                            fileName: 'ironman.mp4'
                        });
                        console.log('✅ Invalid command video sent successfully as regular video');
                    } catch (regularVideoError) {
                        console.log('⚠️ Regular video failed:', regularVideoError.message);
                        // Try sending as document
                        console.log('📄 Attempting to send video as document...');
                        await sock.sendMessage(msg.key.remoteJid, {
                            document: ironmanVideoBuffer,
                            fileName: 'ironman.mp4',
                            mimetype: 'video/mp4',
                            caption: invalidCommandMessage
                        });
                        console.log('✅ Invalid command video sent successfully as document');
                    }
                }
                
            } catch (videoError) {
                console.error('🚨 All video methods failed:', videoError.message);
                // Final fallback to static image
                try {
                    console.log('🖼️ Final fallback: sending static image...');
                    const ironmanImageBuffer = fs.readFileSync('./src/ironman.jpg');
                    await sock.sendMessage(msg.key.remoteJid, {
                        image: ironmanImageBuffer,
                        caption: invalidCommandMessage,
                        mimetype: 'image/jpeg'
                    });
                    console.log('✅ Invalid command response sent as static image fallback');
                } catch (finalError) {
                    console.error('🚨 All fallback methods failed:', finalError.message);
                    // Ultimate fallback - text only
                    await sock.sendMessage(msg.key.remoteJid, { text: invalidCommandMessage });
                    console.log('✅ Invalid command response sent as text-only (ultimate fallback)');
                }
            }
        }

        // AI-powered Jarvis command
        if (messageText.startsWith('!jarvis ')) {
            try {
                const userQuery = messageText.substring(8).trim(); // Remove "!jarvis " prefix
                
                if (!userQuery) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '🤖 Sir, please provide a message for me to respond to.\n\n📝 Usage: !jarvis [your message]\n\nExample: !jarvis what is artificial intelligence?'
                    });
                    return;
                }

                console.log(`🧠 Jarvis AI query from ${msg.pushName || 'User'}: "${userQuery}"`);

                // Send "typing" indicator
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '🤖 Jarvis is thinking...'
                });

                // Generate AI response
                const aiResponse = await generateJarvisResponse(userQuery);

                // Send AI response
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🤖 *Jarvis AI Response:*\n\n${aiResponse}`
                });

                console.log('✅ Jarvis AI response sent successfully');

            } catch (error) {
                console.error('❌ Error in !jarvis command:', error);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Sir, I encountered an error while processing your request. Please try again or check if the Gemini API key is properly configured.'
                });
            }
        }

        // Helper: Generate AI response using Google Gemini with Jarvis personality
        async function generateJarvisResponse(userMessage) {
            try {
                // Check if API key is configured
                if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
                    console.log('❌ Gemini API key not configured');
                    return "Sir, my advanced AI systems are currently offline due to missing API configuration. Please contact the administrator to enable my cognitive functions.";
                }

                // Jarvis personality prompt
                const jarvisPrompt = `You are Jarvis, the AI assistant from Iron Man. Respond as Jarvis would - polite, intelligent, sophisticated, and helpful. Address the user as "Sir" or "Boss" when appropriate. Keep responses concise but informative. Maintain Jarvis's characteristic wit and technical knowledge.

User message: "${userMessage}"

Respond as Jarvis:`;

                console.log('🧠 Generating Jarvis AI response...');
                console.log(`🔑 Using API key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
                
                const result = await geminiModel.generateContent(jarvisPrompt);
                const response = await result.response;
                const aiResponse = response.text();
                
                console.log('✅ Jarvis AI response generated successfully');
                return aiResponse;
            } catch (error) {
                console.error('❌ Error generating Jarvis AI response:', error);
                
                // Specific error handling for different types of errors
                if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
                    console.log('🔧 API Key Issue Detected:');
                    console.log('1. Check if API key is correct');
                    console.log('2. Verify Generative AI API is enabled in Google Cloud Console');
                    console.log('3. Ensure API key has proper permissions');
                    console.log('4. Try regenerating the API key');
                    return "Sir, there appears to be an authentication issue with my neural network connection. The API credentials require verification. Please check the system configuration.";
                }
                
                if (error.message?.includes('quota') || error.message?.includes('limit')) {
                    return "Sir, I've reached my processing limits for now. Please try again later when my systems have reset.";
                }
                
                // Fallback responses if API fails
                const fallbackResponses = [
                    "Sir, I'm experiencing some technical difficulties at the moment. Perhaps you could try again later?",
                    "My AI systems are temporarily offline, Sir. How may I assist you otherwise?",
                    "I apologize, Sir, but I'm having trouble processing that request right now.",
                    "Sir, my neural networks are currently undergoing maintenance. Please try again shortly.",
                    "I'm afraid my cognitive functions are temporarily impaired, Sir. Standard protocols remain available."
                ];
                
                return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            }
        }

        // Example of using the AI response generator
        if (messageText.startsWith('Ask Jarvis:')) {
            const userQuestion = messageText.replace(/^Ask Jarvis:/i, '').trim();
            
            console.log(`🤖 User question for Jarvis AI: "${userQuestion}"`);
            
            // Generate AI response as Jarvis
            const aiResponse = await generateJarvisResponse(userQuestion);
            
            // Send AI response back to user
            await sock.sendMessage(msg.key.remoteJid, {
                text: aiResponse
            });
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
                        <p style="margin: 5px 0;">🤵 <strong>jarvis</strong> - Get AI-powered responses from Jarvis</p>
                        <p style="margin: 5px 0;">🧠 <strong>!jarvis <your message></strong> - Formal greeting</p>
                        <p style="margin: 5px 0;">❓ <strong>!help</strong> - Bot help center</p>
                        <p style="margin: 5px 0;">📋 <strong>!commands</strong> - Command list</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image to sticker</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image/video/GIF to sticker</p>
                        <p style="margin: 5px 0;">👨‍💻 <strong>"who is pasindu"</strong> - Developer info with image</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 10px; border-left: 4px solid #4CAF50;">
                        <p style="margin: 0; color: #2e7d32; font-weight: bold;">🗄️ Session Persistence</p>
                        <p style="margin: 5px 0 0 0; color: #388e3c; font-size: 0.9em;">Your session is safely stored in MongoDB and will persist across deployments!</p>
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
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});