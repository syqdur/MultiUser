import https from 'https';
import fs from 'fs';
import crypto from 'crypto';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-service-account.json', 'utf8'));

function createJWT() {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.rules",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signingInput = encodedHeader + '.' + encodedPayload;
  
  // Extract private key
  const privateKey = serviceAccount.private_key;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey);
  const encodedSignature = signature.toString('base64url');
  
  return signingInput + '.' + encodedSignature;
}

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const jwt = createJWT();
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    
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
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(`OAuth failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse OAuth response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function deployFirestoreRules() {
  console.log('Getting access token...');
  const accessToken = await getAccessToken();
  console.log('Access token obtained');

  console.log('Reading Firestore rules...');
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  const payload = JSON.stringify({
    source: {
      files: [{
        name: 'firestore.rules',
        content: rules
      }]
    }
  });

  console.log('Creating Firestore ruleset...');
  const createOptions = {
    hostname: 'firebaserules.googleapis.com',
    path: '/v1/projects/dev1-b3973/rulesets',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const rulesetResponse = await makeRequest(createOptions, payload);
  console.log('Ruleset created:', rulesetResponse.name);

  console.log('Deploying Firestore ruleset...');
  const releasePayload = JSON.stringify({
    name: `projects/dev1-b3973/releases/cloud.firestore`,
    rulesetName: rulesetResponse.name
  });

  const releaseOptions = {
    hostname: 'firebaserules.googleapis.com',
    path: '/v1/projects/dev1-b3973/releases/cloud.firestore',
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(releasePayload)
    }
  };

  await makeRequest(releaseOptions, releasePayload);
  console.log('✅ Firestore rules deployed successfully!');
}

async function deployStorageRules() {
  console.log('Getting access token for Storage...');
  const accessToken = await getAccessToken();

  console.log('Reading Storage rules...');
  const rules = fs.readFileSync('storage.rules', 'utf8');

  const payload = JSON.stringify({
    source: {
      files: [{
        name: 'storage.rules',
        content: rules
      }]
    }
  });

  console.log('Creating Storage ruleset...');
  const createOptions = {
    hostname: 'firebaserules.googleapis.com',
    path: '/v1/projects/dev1-b3973/rulesets',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const rulesetResponse = await makeRequest(createOptions, payload);
  console.log('Storage ruleset created:', rulesetResponse.name);

  console.log('Deploying Storage ruleset...');
  const releasePayload = JSON.stringify({
    name: `projects/dev1-b3973/releases/firebase.storage/dev1-b3973.firebasestorage.app`,
    rulesetName: rulesetResponse.name
  });

  const releaseOptions = {
    hostname: 'firebaserules.googleapis.com',
    path: '/v1/projects/dev1-b3973/releases/firebase.storage%2Fdev1-b3973.firebasestorage.app',
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(releasePayload)
    }
  };

  await makeRequest(releaseOptions, releasePayload);
  console.log('✅ Storage rules deployed successfully!');
}

async function main() {
  try {
    console.log('🚀 Deploying Firebase security rules...\n');
    
    await deployFirestoreRules();
    console.log('');
    await deployStorageRules();
    
    console.log('\n🎉 All Firebase rules deployed successfully!');
    console.log('💡 Refresh your application to see the changes.');
    console.log('✅ Profile settings, gallery uploads, stories, and timeline should now work.');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main();