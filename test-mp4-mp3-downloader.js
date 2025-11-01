const https = require('https');

console.log('Testing youtube-mp4-mp3-downloader.p.rapidapi.com API...\n');
console.log('='.repeat(70));

// Test video IDs
const testVideos = [
  { id: 'UxxajLWwzqY', title: 'Icona Pop - I Love It' },
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' }
];

async function testVideoDownload(videoId, title) {
  return new Promise((resolve, reject) => {
    console.log(`\n📊 Testing: ${title}`);
    console.log(`Video ID: ${videoId}`);
    console.log('-'.repeat(70));

    const options = {
      method: 'GET',
      hostname: 'youtube-mp4-mp3-downloader.p.rapidapi.com',
      port: null,
      path: `/api/v1/download?url=https://www.youtube.com/watch?v=${videoId}`,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '2f04d689f3msh8b4ddfc2299fa37p1e8d90jsn35709382433c',
        'x-rapidapi-host': 'youtube-mp4-mp3-downloader.p.rapidapi.com'
      }
    };

    const req = https.request(options, function (res) {
      const chunks = [];
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Status Message: ${res.statusMessage}`);

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        try {
          const body = Buffer.concat(chunks);
          const response = JSON.parse(body.toString());
          
          console.log('\n📦 Response Structure:');
          console.log(JSON.stringify(response, null, 2));
          
          // Analyze capabilities
          console.log('\n🔍 Capability Analysis:');
          
          if (response.error) {
            console.log('❌ Error:', response.error);
            resolve({ success: false, error: response.error });
            return;
          }
          
          // Check for MP3 support
          let hasMp3 = false;
          let hasMp4WithAudio = false;
          let formats = [];
          
          if (response.formats) {
            formats = response.formats;
          } else if (response.links) {
            formats = response.links;
          } else if (response.download) {
            formats = [response.download];
          }
          
          console.log(`\n📋 Total Formats Found: ${Array.isArray(formats) ? formats.length : (formats ? 1 : 0)}`);
          
          if (Array.isArray(formats)) {
            formats.forEach((format, index) => {
              console.log(`\nFormat ${index + 1}:`);
              console.log(`  Type: ${format.type || format.format || format.quality || 'N/A'}`);
              console.log(`  Quality: ${format.quality || format.qualityLabel || 'N/A'}`);
              console.log(`  Extension: ${format.ext || format.extension || 'N/A'}`);
              console.log(`  Has Audio: ${format.hasAudio || format.audio || 'unknown'}`);
              console.log(`  Has Video: ${format.hasVideo || format.video || 'unknown'}`);
              
              const formatStr = JSON.stringify(format).toLowerCase();
              if (formatStr.includes('mp3') || formatStr.includes('audio')) {
                hasMp3 = true;
              }
              if (formatStr.includes('mp4') && (formatStr.includes('audio') || format.hasAudio)) {
                hasMp4WithAudio = true;
              }
            });
          } else if (formats) {
            console.log('\nSingle Format/Download:');
            console.log(JSON.stringify(formats, null, 2));
          }
          
          console.log('\n' + '='.repeat(70));
          console.log('📊 CAPABILITY SUMMARY:');
          console.log('='.repeat(70));
          console.log(`✅ MP3 Downloads: ${hasMp3 ? 'YES' : 'NO'}`);
          console.log(`✅ MP4 with Audio: ${hasMp4WithAudio ? 'YES' : 'NO'}`);
          console.log('='.repeat(70));
          
          resolve({ 
            success: true, 
            hasMp3, 
            hasMp4WithAudio,
            response 
          });
          
        } catch (error) {
          console.log('❌ Parse Error:', error.message);
          console.log('Raw Response:', body.toString());
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', function (error) {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test progress endpoint
async function testProgressEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\n📊 Testing Progress Endpoint...');
    console.log('-'.repeat(70));

    const options = {
      method: 'GET',
      hostname: 'youtube-mp4-mp3-downloader.p.rapidapi.com',
      port: null,
      path: '/api/v1/progress?id=OUNI96Qi9JOscCsgeLpbnrH',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '2f04d689f3msh8b4ddfc2299fa37p1e8d90jsn35709382433c',
        'x-rapidapi-host': 'youtube-mp4-mp3-downloader.p.rapidapi.com'
      }
    };

    const req = https.request(options, function (res) {
      const chunks = [];
      
      console.log(`Status Code: ${res.statusCode}`);

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log('Response:', body.toString());
        resolve({ statusCode: res.statusCode, body: body.toString() });
      });
    });

    req.on('error', function (error) {
      console.log('❌ Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run tests
(async () => {
  try {
    // Test progress endpoint first
    await testProgressEndpoint();
    
    console.log('\n\n' + '='.repeat(70));
    console.log('🎬 TESTING VIDEO DOWNLOADS');
    console.log('='.repeat(70));
    
    // Test video downloads
    for (const video of testVideos) {
      await testVideoDownload(video.id, video.title);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
    }
    
    console.log('\n\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
})();
