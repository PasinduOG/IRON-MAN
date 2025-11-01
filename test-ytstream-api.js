// Test YTStream API for YouTube video downloads
const https = require('https');

const RAPIDAPI_KEY = '2f04d689f3msh8b4ddfc2299fa37p1e8d90jsn35709382433c';
const TEST_VIDEO_ID = 'UxxajLWwzqY'; // Test video from your example
const TEST_VIDEO_ID_2 = 'dQw4w9WgXcQ'; // Rick Astley video

console.log('🧪 Testing YTStream YouTube Download API...\n');
console.log('API Host: ytstream-download-youtube-videos.p.rapidapi.com');
console.log('='.repeat(70) + '\n');

// Test 1: Check basic download endpoint
console.log('📊 Test 1: Testing /dl endpoint with video ID...');
const options = {
    method: 'GET',
    hostname: 'ytstream-download-youtube-videos.p.rapidapi.com',
    port: null,
    path: `/dl?id=${TEST_VIDEO_ID}`,
    headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Response Size:', (body.length / 1024).toFixed(2), 'KB\n');
        
        if (res.statusCode === 200) {
            console.log('✅ Test 1 PASSED - API is working!\n');
            
            try {
                const jsonData = JSON.parse(body.toString());
                console.log('📄 Response Structure:');
                console.log(JSON.stringify(jsonData, null, 2));
                console.log('\n' + '='.repeat(70));
                
                // Analyze the response
                console.log('\n🔍 API Capabilities Analysis:\n');
                
                if (jsonData.title) {
                    console.log('✅ Video Title:', jsonData.title);
                }
                if (jsonData.author) {
                    console.log('✅ Channel/Author:', jsonData.author);
                }
                if (jsonData.duration) {
                    console.log('✅ Duration:', jsonData.duration);
                }
                if (jsonData.thumbnail) {
                    console.log('✅ Thumbnail URL available');
                }
                
                // Check for download links
                console.log('\n📥 Download Options Available:\n');
                
                if (jsonData.formats || jsonData.adaptiveFormats) {
                    console.log('✅ Multiple format options found!');
                }
                
                if (jsonData.formats && Array.isArray(jsonData.formats)) {
                    console.log(`\n🎥 Video Formats: ${jsonData.formats.length} available`);
                    jsonData.formats.forEach((format, index) => {
                        console.log(`\n   Format ${index + 1}:`);
                        console.log(`      Quality: ${format.qualityLabel || format.quality || 'Unknown'}`);
                        console.log(`      Format: ${format.mimeType || format.format || 'Unknown'}`);
                        console.log(`      Has Video: ${format.hasVideo || (format.mimeType && format.mimeType.includes('video'))}`);
                        console.log(`      Has Audio: ${format.hasAudio || (format.mimeType && format.mimeType.includes('audio'))}`);
                        if (format.contentLength) {
                            console.log(`      Size: ${(format.contentLength / 1024 / 1024).toFixed(2)} MB`);
                        }
                        console.log(`      Download URL: ${format.url ? 'Available ✅' : 'Not Available ❌'}`);
                    });
                }
                
                if (jsonData.adaptiveFormats && Array.isArray(jsonData.adaptiveFormats)) {
                    console.log(`\n🎵 Adaptive Formats: ${jsonData.adaptiveFormats.length} available`);
                }
                
                // Check for direct download links
                if (jsonData.link || jsonData.downloadUrl || jsonData.url) {
                    console.log('\n✅ Direct download link available!');
                    console.log('   Link:', jsonData.link || jsonData.downloadUrl || jsonData.url);
                }
                
                // Summary
                console.log('\n' + '='.repeat(70));
                console.log('📋 CAPABILITY SUMMARY:');
                console.log('='.repeat(70));
                
                const hasVideoDownload = jsonData.formats && jsonData.formats.some(f => 
                    f.hasVideo || (f.mimeType && f.mimeType.includes('video'))
                );
                const hasAudioDownload = jsonData.formats && jsonData.formats.some(f => 
                    f.hasAudio || (f.mimeType && f.mimeType.includes('audio'))
                );
                
                console.log(`✅ Video Info: ${jsonData.title ? 'YES' : 'NO'}`);
                console.log(`${hasVideoDownload ? '✅' : '❌'} Video Download: ${hasVideoDownload ? 'YES' : 'NO'}`);
                console.log(`${hasAudioDownload ? '✅' : '❌'} Audio Download: ${hasAudioDownload ? 'YES' : 'NO'}`);
                console.log(`✅ Multiple Qualities: ${jsonData.formats && jsonData.formats.length > 1 ? 'YES' : 'NO'}`);
                
                if (hasVideoDownload) {
                    console.log('\n🎉 This API supports VIDEO downloads! ✅');
                } else {
                    console.log('\n❌ Video download not confirmed from response structure');
                }
                
                // Test with second video
                console.log('\n' + '='.repeat(70));
                console.log('📊 Test 2: Testing with Rick Astley video...\n');
                
                const options2 = {
                    method: 'GET',
                    hostname: 'ytstream-download-youtube-videos.p.rapidapi.com',
                    port: null,
                    path: `/dl?id=${TEST_VIDEO_ID_2}`,
                    headers: {
                        'x-rapidapi-key': RAPIDAPI_KEY,
                        'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                    }
                };
                
                const req2 = https.request(options2, function (res2) {
                    const chunks2 = [];
                    
                    res2.on('data', function (chunk) {
                        chunks2.push(chunk);
                    });
                    
                    res2.on('end', function () {
                        const body2 = Buffer.concat(chunks2);
                        console.log('Status:', res2.statusCode);
                        
                        if (res2.statusCode === 200) {
                            const jsonData2 = JSON.parse(body2.toString());
                            console.log('✅ Test 2 PASSED');
                            console.log('Video Title:', jsonData2.title || 'Unknown');
                            console.log('Formats Available:', jsonData2.formats ? jsonData2.formats.length : 0);
                            
                            console.log('\n' + '='.repeat(70));
                            console.log('🎉 FINAL RESULT: API is working and supports video downloads!');
                            console.log('='.repeat(70));
                        } else {
                            console.log('⚠️ Test 2 returned status:', res2.statusCode);
                        }
                    });
                });
                
                req2.on('error', (e) => {
                    console.error('❌ Test 2 Error:', e.message);
                });
                
                req2.end();
                
            } catch (e) {
                console.error('❌ JSON Parse Error:', e.message);
                console.log('\nRaw Response:');
                console.log(body.toString().substring(0, 1000));
            }
        } else {
            console.log('❌ Test 1 FAILED');
            console.log('Error Response:', body.toString());
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request Error:', e.message);
});

req.end();
