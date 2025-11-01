// Fix Session Error - Clear corrupted sessions from MongoDB
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function clearCorruptedSessions() {
    console.log('🔧 IRON-MAN Session Fix Tool\n');
    console.log('This will clear corrupted WhatsApp sessions from MongoDB');
    console.log('You will need to scan QR code again after this.\n');
    
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        
        // Clear all sessions from the auth collection
        const authCollection = db.collection('auth');
        const result = await authCollection.deleteMany({});
        
        console.log(`✅ Cleared ${result.deletedCount} session records`);
        
        await client.close();
        console.log('✅ MongoDB connection closed\n');
        
        console.log('🎯 Session fix complete!');
        console.log('\nNext steps:');
        console.log('1. Start your bot: npm start');
        console.log('2. Scan the QR code with your phone');
        console.log('3. Bot will create a fresh session\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

clearCorruptedSessions();
