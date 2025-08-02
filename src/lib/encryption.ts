
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_STRING = process.env.ENCRYPTION_KEY;

// Safely get the encryption key
function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY_STRING || ENCRYPTION_KEY_STRING.length !== 32) {
    console.error('FATAL: ENCRYPTION_KEY is not set or is not 32 bytes (256 bits) long. Please check your .env file.');
    throw new Error('Server configuration error: Encryption key is missing or invalid.');
  }
  return Buffer.from(ENCRYPTION_KEY_STRING, 'utf8');
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const parts = text.split(':');
    // Ensure parts has at least two elements before proceeding
    if (parts.length < 2) {
        throw new Error("Invalid encrypted text format.");
    }
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error: Data Rusak"; // Return a default or error state
  }
}
