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

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const welcomeMessage = "Hello!... I'm Jarvis. How can I assist you today?...😊";
const greetingMessge = "At your service, sir";

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
- *!sticker* : Convert image to sticker
- *!asticker* : Convert video/GIF to animated sticker

⚙️ Bot created by *Pasindu OG Dev*
📌 Version: 1.2.1`
            });
        }

        if (messageText === '!commands') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📝 Available Commands:
- hi, hello, hey : Casual Jarvis greeting
- jarvis : Formal greeting  
- !commands : Show all commands
- !help : Get help info
- !sticker : Convert image to sticker
- !asticker : Convert video/GIF to animated sticker

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
                            'User-Agent': 'IRON-MAN-Bot/1.2.1'
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

        // Sticker creation command
        if (messageText.startsWith('!sticker') || messageText === '!sticker') {
            try {
                const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

                if (quoted?.imageMessage) {
                    console.log('Processing sticker from quoted image...');
                    const buffer = await downloadMedia(sock, quoted.imageMessage);

                    const webpBuffer = await sharp(buffer)
                        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .webp({ quality: 80 })
                        .toBuffer();

                    await sock.sendMessage(msg.key.remoteJid, {
                        sticker: webpBuffer
                    }, { quoted: msg });

                } else if (msg.message?.imageMessage) {
                    console.log('Processing sticker from direct image...');
                    const buffer = await downloadMedia(sock, msg.message.imageMessage);

                    const webpBuffer = await sharp(buffer)
                        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .webp({ quality: 80 })
                        .toBuffer();

                    await sock.sendMessage(msg.key.remoteJid, {
                        sticker: webpBuffer
                    });

                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '❗ Sir. Please send an image with !sticker caption or reply to an image with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker\n• Reply to image with: !sticker\n• Send video/GIF with caption: !asticker\n• Reply to video/GIF with: !asticker'
                    });
                }
            } catch (error) {
                console.error('Error creating sticker:', error);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Failed to create sticker. Please try again with a valid image.'
                });
            }
        }

        // Animated sticker creation command (check BEFORE the video suggestion)
        if (messageText.startsWith('!asticker') || messageText === '!asticker') {
            try {
                const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                let mediaMessage = null;
                let mediaType = null;

                // Check for quoted video/GIF
                if (quoted?.videoMessage) {
                    mediaMessage = quoted.videoMessage;
                    mediaType = 'video';
                } else if (quoted?.gifMessage) {
                    mediaMessage = quoted.gifMessage;
                    mediaType = 'video'; // GIFs are treated as videos in Baileys
                }
                // Check for direct video/GIF
                else if (msg.message?.videoMessage) {
                    mediaMessage = msg.message.videoMessage;
                    mediaType = 'video';
                } else if (msg.message?.gifMessage) {
                    mediaMessage = msg.message.gifMessage;
                    mediaType = 'video';
                }

                if (mediaMessage) {
                    console.log(`Processing animated sticker from ${mediaType}...`);

                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '🎬 Sir, converting your video/GIF to animated sticker... This may take a moment.'
                    });

                    // Download the video/GIF
                    const buffer = await downloadVideoMedia(sock, mediaMessage, mediaType);

                    // Save to temporary file
                    const inputPath = `./temp_input_${Date.now()}.mp4`;
                    const outputPath = `./temp_output_${Date.now()}.webp`;

                    fs.writeFileSync(inputPath, buffer);

                    try {
                        // Convert to animated WebP
                        await convertToAnimatedSticker(inputPath, outputPath);

                        // Check file size (WhatsApp limit is around 500KB for stickers)
                        const stats = fs.statSync(outputPath);
                        const fileSizeInKB = stats.size / 1024;
                        console.log(`📏 Generated sticker size: ${fileSizeInKB.toFixed(2)} KB`);

                        if (fileSizeInKB > 500) {
                            console.log('⚠️ File too large, attempting to compress further...');
                            // Try again with even lower quality
                            await convertToAnimatedStickerUltraCompressed(inputPath, outputPath);
                            const newStats = fs.statSync(outputPath);
                            const newFileSizeInKB = newStats.size / 1024;
                            console.log(`📏 Compressed sticker size: ${newFileSizeInKB.toFixed(2)} KB`);
                        }

                        // Read the converted file
                        const stickerBuffer = fs.readFileSync(outputPath);

                        // Send as sticker
                        await sock.sendMessage(msg.key.remoteJid, {
                            sticker: stickerBuffer
                        }, quoted ? { quoted: msg } : {});

                        console.log('✅ Animated sticker sent successfully');

                    } catch (conversionError) {
                        console.error('Error converting to animated sticker:', conversionError);
                        await sock.sendMessage(msg.key.remoteJid, {
                            text: '❌ Sir, failed to convert to animated sticker. The video might be too large or in an unsupported format.'
                        });
                    } finally {
                        // Clean up temporary files
                        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    }

                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '❗ Sir, please send a video or GIF with !asticker caption or reply to a video/GIF with !asticker\n\n📝 Usage:\n• Send video/GIF with caption: !asticker\n• Reply to video/GIF with: !asticker\n• Send image with caption: !sticker\n• Reply to image with: !sticker\n\n⚠️ Note: Large videos may take longer to process'
                    });
                }
            } catch (error) {
                console.error('Error creating animated sticker:', error);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Failed to create animated sticker. Please try again with a valid video or GIF.'
                });
            }
        }

        // Alternative: Just detect any image and provide sticker option
        else if (msg.message?.imageMessage && !messageText) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '📸 Sir I see you sent an image! Send "!sticker" to convert it to a sticker.'
            });
        }

        // Alternative: Just detect any video/GIF and provide animated sticker option  
        else if ((msg.message?.videoMessage || msg.message?.gifMessage) && !messageText) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🎬 Sir I see you sent a video/GIF! Send "!asticker" to convert it to an animated sticker.'
            });
        }

        // Invalid command detection with video preview (GIF-like)
        if (messageText.startsWith('!') && 
            messageText !== '!commands' && 
            messageText !== '!help' && 
            messageText !== '!sticker' && 
            messageText !== '!asticker') {
            
            console.log(`❌ Invalid command "${messageText}", sending video GIF response...`);
            
            try {
                console.log('📂 Reading IRON-MAN video file...');
                const ironmanVideoBuffer = fs.readFileSync('./src/ironman.mp4');
                console.log(`📏 Video file size: ${(ironmanVideoBuffer.length / 1024).toFixed(2)} KB`);
                
                const invalidCommandMessage = `❌ *Invalid Command: "${messageText}"*\n\n` +
                    `🤖 Sir, that command is not recognized in my database.\n\n` +
                    `📝 Type *!commands* to show all commands\n` +
                    `⚙️ *IRON-MAN Bot v1.2.1*`;

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
async function convertToAnimatedSticker(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions([
                '-t', '6',  // Limit to 6 seconds for smaller size
                '-ss', '0'  // Start from beginning
            ])
            .outputOptions([
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,fps=15', // Reduce FPS to 15
                '-c:v', 'libwebp',
                '-quality', '50',        // Lower quality for smaller size
                '-preset', 'picture',    // Better compression preset
                '-loop', '0',
                '-compression_level', '6', // Higher compression
                '-method', '6',          // Better compression method
                '-an'                    // Remove audio
            ])
            .format('webp')
            .on('start', (commandLine) => {
                console.log('🎬 FFmpeg command: ' + commandLine);
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
async function convertToAnimatedStickerUltraCompressed(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions([
                '-t', '4',  // Even shorter duration
                '-ss', '0'
            ])
            .outputOptions([
                '-vf', 'scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0,fps=10', // Smaller size and lower FPS
                '-c:v', 'libwebp',
                '-quality', '30',        // Much lower quality
                '-preset', 'picture',
                '-loop', '0',
                '-compression_level', '6',
                '-method', '6',
                '-an'
            ])
            .format('webp')
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
                        <p style="margin: 5px 0;">❓ <strong>!help</strong> - Bot help center</p>
                        <p style="margin: 5px 0;">📋 <strong>!commands</strong> - Command list</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image to sticker</p>
                        <p style="margin: 5px 0;">🎬 <strong>!asticker</strong> - Convert video/GIF to animated sticker</p>
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