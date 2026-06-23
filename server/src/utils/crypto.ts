import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  // Use centralized config, guaranteed to be defined on start
  return crypto.createHash('sha256').update(config.mfaEncryptionKey).digest();
}

export interface EncryptedPayload {
  encryptedSecret: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param text The plaintext string to encrypt.
 * @returns The EncryptedPayload containing the encrypted hex string, iv, and authTag.
 */
export function encrypt(text: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedSecret: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 * @param payload The EncryptedPayload containing the encrypted hex string, iv, and authTag.
 * @returns The decrypted plaintext string.
 */
export function decrypt(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.authTag, 'hex');
  const encrypted = Buffer.from(payload.encryptedSecret, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}
