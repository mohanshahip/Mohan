const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Derive a 32-byte key using scrypt with a random salt per operation
const deriveKey = (salt) => crypto.scryptSync(ENCRYPTION_KEY, salt, 32);

const encrypt = (text) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = deriveKey(salt);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${salt}:${iv.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedText) => {
  const [salt, ivHex, encrypted] = encryptedText.split(':');
  const key = deriveKey(salt);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };