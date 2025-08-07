const https = require('https');

// Test if the Firebase Function endpoint is accessible
const testEndpoint = () => {
  const url = 'https://us-central1-future-step-nursery.cloudfunctions.net/saveAttendanceCentralized';
  
  console.log('Testing Firebase Function endpoint:', url);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const req = https.request(url, options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  // Send empty request to test endpoint accessibility
  req.write(JSON.stringify({}));
  req.end();
};

testEndpoint();
