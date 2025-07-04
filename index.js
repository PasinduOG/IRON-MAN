const { useMultiFileAuthState, default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { useMongoDBAuthState } = require('./mongoAuth');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const Pino = require('pino');
const fs = require('fs');
const sharp = require('sharp');

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
        console.log(`New message from ${msg.key.remoteJid}:`, msg.message);

        // Extract message text from different message types
        const messageText = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
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
- *!sticker* : Convert image/video to sticker

⚙️ Bot created by *Pasindu OG Dev*
📌 Version: 1.1.0`
            });
        }

        if (messageText === '!commands') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📝 Available Commands:
- hi, hello, hey : Casual Jarvis greeting
- jarvis : Formal greeting  
- !commands : Show all commands
- !help : Get help info
- !sticker : Convert image/video to sticker

Use them in chat to try them out! 👌` })
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
                        text: '❗ Sir. Please send an image with !sticker caption or reply to an image with !sticker\n\n📝 Usage:\n• Send image with caption: !sticker\n• Reply to image with: !sticker'
                    });
                }
            } catch (error) {
                console.error('Error creating sticker:', error);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Failed to create sticker. Please try again with a valid image.'
                });
            }
        }

        // Alternative: Just detect any image and provide sticker option
        else if (msg.message?.imageMessage && !messageText) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '📸 Sir I see you sent an image! Send "!sticker" to convert it to a sticker.'
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
                    <title>Iron Man Bot - WhatsApp QR Code</title>
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
                        <h1>Iron Man Bot</h1>
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
                <h1>🤖 Iron Man Bot</h1>
                <p>Generating QR Code...</p>
                <script>setTimeout(() => window.location.reload(), 3000);</script>
            `);
        }
    } else if (isConnected) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Iron Man Bot - Connected</title>
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
                    <h1>Iron Man Bot Connected!</h1>
                    <p>Your WhatsApp bot is now online and ready to receive messages.</p>
                    <p><strong>Available Commands:</strong></p>
                    <div style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0;">💬 <strong>hi, hello, hey</strong> - Jarvis greeting</p>
                        <p style="margin: 5px 0;">🤵 <strong>jarvis</strong> - Formal greeting</p>
                        <p style="margin: 5px 0;">❓ <strong>!help</strong> - Bot help center</p>
                        <p style="margin: 5px 0;">📋 <strong>!commands</strong> - Command list</p>
                        <p style="margin: 5px 0;">🎯 <strong>!sticker</strong> - Convert image to sticker</p>
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
                <title>Iron Man Bot - Starting</title>
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
                    <h1>Iron Man Bot Starting...</h1>
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