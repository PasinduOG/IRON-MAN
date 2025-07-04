const { useMultiFileAuthState, default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const qrcode = require('qrcode-terminal');
const Pino = require('pino');
const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios');

const welcomeMessage = "Hello!... I'm Jarvis. How can I assist you?...😊";

// For Heroku deployment
const PORT = process.env.PORT || 3000;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
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
            qrcode.generate(qr, { small: true });
            console.log('Scan the QR code above with your WhatsApp');
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
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        console.log(`New message from ${msg.key.remoteJid}:`, msg.message);

        const messageText = msg.message?.conversation || '';
        const greetingRegex = /^(hi|hello|hey)(\s|$)/i;

        if (greetingRegex.test(messageText)) {
            sock.sendMessage(msg.key.remoteJid, { text: welcomeMessage });
        }
    });

    return sock;
}

// Start the bot
startBot().catch(err => {
    console.error('Error starting bot:', err);
    setTimeout(() => {
        console.log('🔄 Retrying after error...');
        startBot();
    }, 5000);
});

// Keep-alive ping for Heroku
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Iron Man Bot is running! 🤖');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});