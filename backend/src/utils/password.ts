import bcrypt from "bcryptjs";
import { ApiError } from "../middleware/errorHandler";

/**
 * Password utility functions for hashing, verification, and strength validation
 */

// Configuration constants
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/**
 * Password strength requirements
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password meets minimum requirements
 * @param password - Password to validate
 * @throws ApiError if password is invalid
 */
export function validatePassword(password: string): void {
  if (!password) {
    throw ApiError.badRequest("Password is required");
  }

  if (typeof password !== "string") {
    throw ApiError.badRequest("Password must be a string");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw ApiError.badRequest(
      `Password must not exceed ${MAX_PASSWORD_LENGTH} characters`,
    );
  }
}

/**
 * Check password strength and return detailed feedback
 * @param password - Password to check
 * @returns PasswordStrength object with score and feedback
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ["Password is required"], isValid: false };
  }

  // Length checks
  if (password.length >= MIN_PASSWORD_LENGTH) {
    score += 1;
  } else {
    feedback.push(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Password should contain lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Password should contain uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Password should contain numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Password should contain special characters");
  }

  // Common patterns that reduce strength
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push("Avoid repeating characters");
  }

  if (/^(?:password|123456|qwerty|admin|letmein)/i.test(password)) {
    score = 0;
    feedback.push("Password is too common");
  }

  // Sequential characters check
  if (hasSequentialChars(password)) {
    score = Math.max(0, score - 1);
    feedback.push("Avoid sequential characters");
  }

  return {
    score: Math.min(4, score),
    feedback,
    isValid: score >= 3 && password.length >= MIN_PASSWORD_LENGTH,
  };
}

/**
 * Check for sequential characters (e.g., abc, 123)
 * @param str - String to check
 * @returns True if sequential characters found
 */
function hasSequentialChars(str: string): boolean {
  const lower = str.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const char1 = lower.charCodeAt(i);
    const char2 = lower.charCodeAt(i + 1);
    const char3 = lower.charCodeAt(i + 2);
    if (char2 === char1 + 1 && char3 === char2 + 1) {
      return true;
    }
  }
  return false;
}

/**
 * Generate a secure random password
 * @param length - Length of password (default: 16)
 * @returns Random password
 */
export function generateRandomPassword(length = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    const randomIndex = (randomValues[i] ?? 0) % charset.length;
    password += charset[randomIndex];
  }

  // Ensure at least one of each required character type
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + "a";
  if (!/[A-Z]/.test(password)) password = password.slice(0, -1) + "A";
  if (!/[0-9]/.test(password)) password = password.slice(0, -1) + "1";
  if (!/[^a-zA-Z0-9]/.test(password)) password = password.slice(0, -1) + "!";

  return password;
}

/**
 * Check if a password has been compromised (placeholder for integration with HaveIBeenPwned API)
 * @param password - Password to check
 * @returns True if password appears in known breaches
 */
export async function isPasswordCompromised(
  _password: string,
): Promise<boolean> {
  // TODO: Integrate with HaveIBeenPwned API (k-anonymity model)
  // For now, return false - implement when API key is available
  return false;
}

/**
 * Timing-safe password comparison to prevent timing attacks
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns True if passwords match
 */
export async function timingSafeComparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // bcrypt.compare is already timing-safe, but we add an extra layer
  const result = await comparePassword(password, hashedPassword);

  // Add a small random delay to further mitigate timing attacks
  const delay = Math.random() * 10;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return result;
}

/**
 * Re-hash password if bcrypt rounds have increased
 * @param password - Plain text password
 * @param hashedPassword - Current hashed password
 * @returns New hash if re-hashing needed, otherwise null
 */
export async function rehashIfNeeded(
  password: string,
  hashedPassword: string,
): Promise<string | null> {
  const rounds = bcrypt.getRounds(hashedPassword);
  if (rounds < BCRYPT_ROUNDS) {
    return hashPassword(password);
  }
  return null;
}
