const { MongoClient } = require('mongodb');
const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

class MongoAuthState {
    constructor(mongoUri, dbName = 'whatsapp_bot', collectionName = 'auth_state') {
        this.mongoUri = mongoUri;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.client = null;
        this.collection = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.mongoUri);
            await this.client.connect();
            const db = this.client.db(this.dbName);
            this.collection = db.collection(this.collectionName);
            console.log('✅ Connected to MongoDB for auth storage');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Disconnected from MongoDB');
        }
    }

    async readCreds() {
        try {
            const doc = await this.collection.findOne({ _id: 'creds' });
            if (doc && doc.data) {
                return JSON.parse(doc.data, BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            console.error('Error reading creds from MongoDB:', error);
            return null;
        }
    }

    async writeCreds(creds) {
        try {
            const serialized = JSON.stringify(creds, BufferJSON.replacer, 2);
            await this.collection.replaceOne(
                { _id: 'creds' },
                { _id: 'creds', data: serialized },
                { upsert: true }
            );
            console.log('💾 Credentials saved to MongoDB');
        } catch (error) {
            console.error('Error writing creds to MongoDB:', error);
        }
    }

    async readKey(keyId) {
        try {
            const doc = await this.collection.findOne({ _id: keyId });
            if (doc && doc.data) {
                return JSON.parse(doc.data, BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            console.error(`Error reading key ${keyId} from MongoDB:`, error);
            return null;
        }
    }

    async writeKey(keyId, keyData) {
        try {
            const serialized = JSON.stringify(keyData, BufferJSON.replacer, 2);
            await this.collection.replaceOne(
                { _id: keyId },
                { _id: keyId, data: serialized },
                { upsert: true }
            );
        } catch (error) {
            console.error(`Error writing key ${keyId} to MongoDB:`, error);
        }
    }

    async removeKey(keyId) {
        try {
            await this.collection.deleteOne({ _id: keyId });
        } catch (error) {
            console.error(`Error removing key ${keyId} from MongoDB:`, error);
        }
    }

    async clearAll() {
        try {
            await this.collection.deleteMany({});
            console.log('🗑️ Cleared all auth data from MongoDB');
        } catch (error) {
            console.error('Error clearing auth data from MongoDB:', error);
        }
    }
}

async function useMongoDBAuthState(mongoUri) {
    const mongoAuth = new MongoAuthState(mongoUri);
    await mongoAuth.connect();

    // Read existing creds or create new ones
    let creds = await mongoAuth.readCreds();
    if (!creds) {
        creds = initAuthCreds();
        await mongoAuth.writeCreds(creds);
        console.log('🔑 New credentials created and saved to MongoDB');
    } else {
        console.log('🔑 Existing credentials loaded from MongoDB');
    }

    const saveState = async () => {
        await mongoAuth.writeCreds(creds);
    };

    const state = {
        creds,
        keys: {
            get: async (type, ids) => {
                const data = {};
                for (const id of ids) {
                    const keyId = `${type}-${id}`;
                    const keyData = await mongoAuth.readKey(keyId);
                    if (keyData) {
                        data[id] = keyData;
                    }
                }
                return data;
            },
            set: async (data) => {
                for (const category in data) {
                    for (const id in data[category]) {
                        const keyId = `${category}-${id}`;
                        const keyData = data[category][id];
                        if (keyData) {
                            await mongoAuth.writeKey(keyId, keyData);
                        } else {
                            await mongoAuth.removeKey(keyId);
                        }
                    }
                }
            }
        }
    };

    return {
        state,
        saveCreds: saveState,
        clearState: () => mongoAuth.clearAll(),
        disconnect: () => mongoAuth.disconnect()
    };
}

module.exports = { useMongoDBAuthState };
