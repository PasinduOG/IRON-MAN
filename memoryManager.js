const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config();

// MongoDB Configuration - Optimized for performance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pasinduogdev:PasinduDev678@cluster0.4ns3c.mongodb.net/iron-man-bot';
const DB_NAME = 'iron-man-bot';
const COLLECTION_NAME = 'memory';

let client;
let db;
let memoryCollection;

// Connection pool for better performance
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000, // Reduced for faster failure detection
    connectTimeoutMS: 5000,         // Reduced for faster connections
    maxPoolSize: 10,                // Connection pool for performance
    minPoolSize: 2,                 // Minimum connections
    maxIdleTimeMS: 30000,           // Close connections after 30 seconds idle
    bufferMaxEntries: 0,            // Disable mongoose buffering for faster errors
    retryWrites: true,              // Enable retry for better reliability
    writeConcern: { w: 1, j: false } // Faster writes with journal disabled
};

// Connect to MongoDB with optimized settings
async function connectToMongoDB() {
    try {
        if (!client) {
            console.log('🔄 Connecting to MongoDB for memory management...');
            client = new MongoClient(MONGODB_URI, connectionOptions);
            
            await client.connect();
            db = client.db(DB_NAME);
            memoryCollection = db.collection(COLLECTION_NAME);
            
            // Create optimized indexes for better performance
            await Promise.all([
                memoryCollection.createIndex({ number: 1 }, { background: true }),
                memoryCollection.createIndex({ updatedAt: 1 }, { background: true, expireAfterSeconds: 2592000 }), // 30 days TTL
                memoryCollection.createIndex({ "memory.timestamp": 1 }, { background: true })
            ]);
            
            console.log('✅ MongoDB connected successfully for memory management');
        }
        return { client, db, memoryCollection };
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

// Ensure connection before operations
async function ensureConnection() {
    if (!client || !memoryCollection) {
        await connectToMongoDB();
    }
    return memoryCollection;
}

/**
 * Retrieve conversation memory array for a given WhatsApp number - Optimized
 * @param {string} number - WhatsApp number
 * @returns {Array} - Array of message objects with role and message
 */
async function getMemory(number) {
    try {
        const collection = await ensureConnection();
        
        // Optimized query with projection to reduce data transfer
        const userMemory = await collection.findOne(
            { number }, 
            { 
                projection: { memory: 1 },
                maxTimeMS: 2000 // 2 second timeout for reads
            }
        );
        
        if (userMemory && userMemory.memory) {
            console.log(`📋 Retrieved ${userMemory.memory.length} messages from memory for ${number}`);
            return userMemory.memory;
        }
        
        console.log(`📋 No existing memory found for ${number}`);
        return [];
    } catch (error) {
        console.error(`❌ Error retrieving memory for ${number}:`, error);
        return [];
    }
}

/**
 * Add a message to a user's memory
 * @param {string} number - WhatsApp number
 * @param {string} role - Message role ('user' or 'ai')
 * @param {string} message - Message content
 */
async function addMemory(number, role, message) {
    try {
        const collection = await ensureConnection();
        const messageObj = {
            role,
            message,
            timestamp: new Date()
        };
        
        await collection.updateOne(
            { number },
            {
                $push: { memory: messageObj },
                $set: { updatedAt: new Date() }
            },
            { upsert: true }
        );
        
        console.log(`💾 Added ${role} message to memory for ${number}`);
    } catch (error) {
        console.error(`❌ Error adding memory for ${number}:`, error);
    }
}

/**
 * Push both user and AI message to memory - Optimized with bulk operations
 * @param {string} number - WhatsApp number
 * @param {string} userMessage - User's message
 * @param {string} aiReply - AI's reply
 */
async function updateMemory(number, userMessage, aiReply) {
    try {
        const collection = await ensureConnection();
        const timestamp = new Date();
        
        const userMessageObj = {
            role: 'user',
            message: userMessage,
            timestamp
        };
        
        const aiMessageObj = {
            role: 'ai',
            message: aiReply,
            timestamp
        };
        
        // Optimized bulk operation with write concern for speed
        await collection.updateOne(
            { number },
            {
                $push: { 
                    memory: { 
                        $each: [userMessageObj, aiMessageObj],
                        $slice: -20 // Keep only last 20 messages for performance
                    } 
                },
                $set: { updatedAt: timestamp }
            },
            { 
                upsert: true,
                writeConcern: { w: 1, j: false } // Faster writes
            }
        );
        
        console.log(`💾 Updated memory with user and AI messages for ${number}`);
    } catch (error) {
        console.error(`❌ Error updating memory for ${number}:`, error);
    }
}

/**
 * Keep only the latest `limit` messages in memory - Optimized
 * @param {string} number - WhatsApp number
 * @param {number} limit - Maximum number of messages to keep
 */
async function clearOldMemory(number, limit = 20) {
    try {
        const collection = await ensureConnection();
        
        // Use aggregation for better performance
        await collection.updateOne(
            { number },
            [
                {
                    $set: {
                        memory: { $slice: ["$memory", -limit] },
                        updatedAt: new Date()
                    }
                }
            ],
            { writeConcern: { w: 1, j: false } }
        );
        
        console.log(`🧹 Cleared old memory for ${number}, kept latest ${limit} messages`);
    } catch (error) {
        console.error(`❌ Error clearing old memory for ${number}:`, error);
    }
}

/**
 * Get memory statistics for a user
 * @param {string} number - WhatsApp number
 * @returns {Object} - Memory statistics
 */
async function getMemoryStats(number) {
    try {
        const collection = await ensureConnection();
        const userMemory = await collection.findOne({ number });
        
        if (userMemory && userMemory.memory) {
            const userMessages = userMemory.memory.filter(m => m.role === 'user').length;
            const aiMessages = userMemory.memory.filter(m => m.role === 'ai').length;
            
            return {
                totalMessages: userMemory.memory.length,
                userMessages,
                aiMessages,
                lastUpdated: userMemory.updatedAt,
                oldestMessage: userMemory.memory[0]?.timestamp,
                newestMessage: userMemory.memory[userMemory.memory.length - 1]?.timestamp
            };
        }
        
        return {
            totalMessages: 0,
            userMessages: 0,
            aiMessages: 0,
            lastUpdated: null,
            oldestMessage: null,
            newestMessage: null
        };
    } catch (error) {
        console.error(`❌ Error getting memory stats for ${number}:`, error);
        return null;
    }
}

/**
 * Clear all memory for a user
 * @param {string} number - WhatsApp number
 */
async function clearAllMemory(number) {
    try {
        const collection = await ensureConnection();
        await collection.deleteOne({ number });
        console.log(`🗑️ Cleared all memory for ${number}`);
    } catch (error) {
        console.error(`❌ Error clearing all memory for ${number}:`, error);
    }
}

/**
 * Build conversation context for Gemini AI
 * @param {Array} memory - User's memory array
 * @param {string} currentMessage - Current user message
 * @returns {string} - Formatted conversation context
 */
function buildConversationContext(memory, currentMessage) {
    let context = "Previous conversation:\n\n";
    
    // Add recent memory messages
    memory.forEach(msg => {
        if (msg.role === 'user') {
            context += `User: ${msg.message}\n`;
        } else if (msg.role === 'ai') {
            context += `Assistant: ${msg.message}\n`;
        }
    });
    
    context += `\nCurrent message: ${currentMessage}\n\n`;
    context += "Please respond naturally based on the conversation history above.";
    
    return context;
}

/**
 * Close MongoDB connection
 */
async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        memoryCollection = null;
        console.log('🔌 MongoDB connection closed');
    }
}

// Initialize connection when module is loaded
connectToMongoDB().catch(console.error);

module.exports = {
    getMemory,
    addMemory,
    updateMemory,
    clearOldMemory,
    getMemoryStats,
    clearAllMemory,
    buildConversationContext,
    closeConnection
};
