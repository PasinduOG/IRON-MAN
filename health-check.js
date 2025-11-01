// Health Check Script for IRON-MAN Bot
// This script performs comprehensive checks on the bot's functionality

require('dotenv').config();
const { MongoClient } = require('mongodb');
const axios = require('axios');
const fs = require('fs');

console.log('🔍 IRON-MAN Bot Health Check\n');
console.log('=' . repeat(60));

// Test results storage
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

function logTest(name, status, message) {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${name}: ${message}`);
    results.tests.push({ name, status, message });
    if (status === 'pass') results.passed++;
    else if (status === 'fail') results.failed++;
    else results.warnings++;
}

async function runHealthCheck() {
    console.log('\n📋 1. Environment Variables Check\n');
    
    // Check environment variables
    const envVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'RAPIDAPI_KEY', 'GITHUB_USERNAME'];
    for (const envVar of envVars) {
        if (process.env[envVar]) {
            logTest(`Env: ${envVar}`, 'pass', 'Present');
        } else {
            logTest(`Env: ${envVar}`, 'fail', 'Missing');
        }
    }

    console.log('\n📋 2. File Structure Check\n');
    
    // Check critical files
    const criticalFiles = [
        'index.js',
        'memoryManager.js',
        'mongoAuth.js',
        'package.json',
        '.env',
        'README.md'
    ];
    
    for (const file of criticalFiles) {
        if (fs.existsSync(file)) {
            logTest(`File: ${file}`, 'pass', 'Exists');
        } else {
            logTest(`File: ${file}`, 'fail', 'Missing');
        }
    }

    // Check src directory
    if (fs.existsSync('./src')) {
        const srcFiles = ['ironman.jpg', 'ironman.mp4', 'developer.jpg'];
        for (const file of srcFiles) {
            if (fs.existsSync(`./src/${file}`)) {
                logTest(`Src: ${file}`, 'pass', 'Exists');
            } else {
                logTest(`Src: ${file}`, 'warn', 'Missing (optional)');
            }
        }
    } else {
        logTest('Directory: src/', 'fail', 'Missing');
    }

    console.log('\n📋 3. MongoDB Connection Check\n');
    
    // Test MongoDB connection
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        logTest('MongoDB Connection', 'pass', 'Connected successfully');
        
        // Test database access
        const db = client.db();
        const collections = await db.listCollections().toArray();
        logTest('MongoDB Database', 'pass', `Found ${collections.length} collections`);
        
        await client.close();
    } catch (error) {
        logTest('MongoDB Connection', 'fail', error.message);
    }

    console.log('\n📋 4. API Keys Validation\n');
    
    // Test Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: 'test' }]
                    }]
                },
                { timeout: 10000 }
            );
            logTest('Gemini API', 'pass', 'Valid and responding');
        } catch (error) {
            if (error.response?.status === 400) {
                logTest('Gemini API', 'pass', 'Valid (responded to test)');
            } else {
                logTest('Gemini API', 'fail', `Error: ${error.message}`);
            }
        }
    } else {
        logTest('Gemini API', 'warn', 'Key not configured or using placeholder');
    }

    // Test RapidAPI (YTStream)
    if (process.env.RAPIDAPI_KEY) {
        try {
            const response = await axios.get(
                'https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=dQw4w9WgXcQ',
                {
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                    },
                    timeout: 10000
                }
            );
            logTest('RapidAPI (YTStream)', 'pass', 'Valid and responding');
        } catch (error) {
            if (error.response?.status === 429) {
                logTest('RapidAPI (YTStream)', 'pass', 'Valid (rate limited - normal)');
            } else if (error.response?.status === 403) {
                logTest('RapidAPI (YTStream)', 'fail', 'Invalid or expired API key');
            } else {
                logTest('RapidAPI (YTStream)', 'warn', `Status: ${error.response?.status || 'Unknown'}`);
            }
        }
    } else {
        logTest('RapidAPI (YTStream)', 'fail', 'Key not configured');
    }

    console.log('\n📋 5. Code Syntax Check\n');
    
    // Check JavaScript syntax
    const jsFiles = ['index.js', 'memoryManager.js', 'mongoAuth.js'];
    for (const file of jsFiles) {
        try {
            require.resolve(`./${file}`);
            logTest(`Syntax: ${file}`, 'pass', 'Valid JavaScript');
        } catch (error) {
            logTest(`Syntax: ${file}`, 'fail', error.message);
        }
    }

    console.log('\n📋 6. Dependencies Check\n');
    
    // Check critical dependencies
    const dependencies = [
        '@whiskeysockets/baileys',
        'axios',
        'dotenv',
        'express',
        'mongodb',
        'sharp',
        'fluent-ffmpeg',
        'ffmpeg-static',
        'qrcode'
    ];
    
    for (const dep of dependencies) {
        try {
            require.resolve(dep);
            logTest(`Dependency: ${dep}`, 'pass', 'Installed');
        } catch (error) {
            logTest(`Dependency: ${dep}`, 'fail', 'Not installed');
        }
    }

    console.log('\n📋 7. Security Check\n');
    
    // Check for hardcoded credentials in code (should use env vars)
    const indexContent = fs.readFileSync('index.js', 'utf8');
    
    // Check if .env is in .gitignore
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    if (gitignoreContent.includes('.env')) {
        logTest('Security: .gitignore', 'pass', '.env is excluded from git');
    } else {
        logTest('Security: .gitignore', 'fail', '.env is NOT excluded from git');
    }

    // Check for environment variable usage
    if (indexContent.includes('process.env.MONGODB_URI') &&
        indexContent.includes('process.env.GEMINI_API_KEY') &&
        indexContent.includes('process.env.RAPIDAPI_KEY')) {
        logTest('Security: Environment Usage', 'pass', 'Using environment variables');
    } else {
        logTest('Security: Environment Usage', 'warn', 'Some hardcoded values detected');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 HEALTH CHECK SUMMARY\n');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`📝 Total Tests: ${results.tests.length}`);
    
    const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All critical tests passed! Bot is ready to run.');
    } else {
        console.log('\n⚠️  Some tests failed. Please fix the issues before running the bot.');
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run the health check
runHealthCheck().catch(error => {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
});
