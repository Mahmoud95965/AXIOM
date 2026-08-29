import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || 'tolzy_axiom_lovable_mcp_secure_secret_key_32b';

// Ensure key is exactly 32 bytes
function getKey(): Buffer {
  return crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
}

/**
 * Encrypts a sensitive string (e.g. OAuth access token or refresh token) using AES-256-CBC
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return '';
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Token decryption error:', err);
    return '';
  }
}
