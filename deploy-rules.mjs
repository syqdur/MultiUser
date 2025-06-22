import https from 'https';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-service-account.json', 'utf8'));

// Function to get access token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const jwt = require('jsonwebtoken');
    
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.rules',
      aud: 'https://oauth2.googleapis.com/token',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });
    
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.access_token);
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function deployRules() {
  try {
    console.log('Getting access token...');
    const accessToken = await getAccessToken();
    
    console.log('Reading Firestore rules...');
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    
    const payload = {
      source: {
        files: [{
          name: 'firestore.rules',
          content: rules
        }]
      }
    };
    
    console.log('Deploying Firestore rules...');
    
    // Create ruleset
    const createRulesetData = JSON.stringify(payload);
    
    const createOptions = {
      hostname: 'firebaserules.googleapis.com',
      path: '/v1/projects/dev1-b3973/rulesets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(createRulesetData)
      }
    };
    
    const rulesetName = await new Promise((resolve, reject) => {
      const req = https.request(createOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response.name);
          } else {
            reject(new Error(`Failed to create ruleset: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(createRulesetData);
      req.end();
    });
    
    console.log('Ruleset created:', rulesetName);
    
    // Deploy ruleset
    const releaseData = JSON.stringify({
      name: `projects/dev1-b3973/releases/cloud.firestore`,
      rulesetName: rulesetName
    });
    
    const releaseOptions = {
      hostname: 'firebaserules.googleapis.com',
      path: '/v1/projects/dev1-b3973/releases/cloud.firestore',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(releaseData)
      }
    };
    
    await new Promise((resolve, reject) => {
      const req = https.request(releaseOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Firestore rules deployed successfully!');
            resolve();
          } else {
            reject(new Error(`Failed to deploy rules: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(releaseData);
      req.end();
    });
    
    console.log('🎉 All rules deployed! Please refresh your application.');
    
  } catch (error) {
    console.error('❌ Error deploying rules:', error.message);
  }
}

deployRules();