const https = require('https');

const endpoints = [
  'getHomePageContent',
  'getAboutUsPageContent',
  'getContactUsPageContent',
  'getCareersPageContent'
];

const projectId = process.env.PROJECT_ID || 'future-step-nursery';

const testEndpoint = (endpoint) => {
  return new Promise((resolve, reject) => {
    const url = `https://us-central1-${projectId}.cloudfunctions.net/${endpoint}`;
    console.log(`Testing endpoint: ${url}`);

    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get ${endpoint}: ${res.statusCode}`));
      }
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.data) {
            console.log(`✅ ${endpoint} returned data.`);
            resolve();
          } else {
            reject(new Error(`❌ ${endpoint} did not return data.`));
          }
        } catch (e) {
          reject(new Error(`❌ Failed to parse JSON from ${endpoint}: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`❌ Error testing ${endpoint}: ${err.message}`));
    });
  });
};

const runTests = async () => {
  console.log('Running content management endpoint tests...');
  try {
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
    }
    console.log('\n✅ All content management endpoint tests passed!');
    process.exit(0);
  } catch (error) {
    console.error(`\n${error.message}`);
    process.exit(1);
  }
};

runTests();
