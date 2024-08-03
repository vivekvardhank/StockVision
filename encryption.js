const crypto = require('crypto');
const fs = require('fs');

// Encryption function
function encrypt(text, key, iv) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Generate a 32-byte encryption key and a 16-byte initialization vector (IV)
const encryptionKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Read the service account JSON file
const jsonFile = './pantry.json';
const jsonData = fs.readFileSync(jsonFile, 'utf8');

// Encrypt the JSON data
const encryptedData = encrypt(jsonData, encryptionKey, iv);

console.log('Encrypted Data:', encryptedData);
console.log('Encryption Key:', encryptionKey.toString('hex'));
console.log('IV:', iv.toString('hex'));

// Store the encrypted data, key, and IV securely (e.g., in your .env file)
