const http = require('http');

const postData = JSON.stringify({
  email: 'student@vitam.edu',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5100,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Origin': 'http://localhost:5178' // Emulate browser on different port
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`CORS Headers: ${res.headers['access-control-allow-origin']}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
