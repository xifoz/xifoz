import bcrypt from 'bcrypt';
import { config } from '../config/index.js';

/**
 * Hashes a plaintext password using bcrypt with the configured rounds.
 * @param password The plaintext password to hash.
 * @returns A promise resolving to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password against a hashed password.
 * @param password The plaintext password to verify.
 * @param hash The hashed password to compare against.
 * @returns A promise resolving to true if passwords match, false otherwise.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
