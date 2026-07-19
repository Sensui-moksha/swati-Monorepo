import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * OTP (One-Time Password) utility functions
 * Supports both numeric OTP and TOTP (Time-based OTP)
 */

// Configuration constants
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_HASH_ROUNDS = 10;
const TOTP_STEP = 300; // 5 minutes in seconds
const TOTP_DIGITS = 6;

/**
 * OTP configuration options
 */
export interface OTPConfig {
  length?: number;
  expiryMinutes?: number;
  type?: "numeric" | "alphanumeric";
}

/**
 * OTP result with metadata
 */
export interface OTPResult {
  otp: string;
  hashedOTP: string;
  expiresAt: Date;
  otpId: string;
}

/**
 * TOTP verification result
 */
export interface TOTPVerificationResult {
  isValid: boolean;
  delta: number;
}

/**
 * Generate a numeric OTP
 * @param config - OTP configuration options
 * @returns OTPResult with plain OTP, hashed OTP, expiry, and ID
 */
export function generateOTP(config: OTPConfig = {}): OTPResult {
  const length = config.length || OTP_LENGTH;
  const expiryMinutes = config.expiryMinutes || OTP_EXPIRY_MINUTES;
  const type = config.type || "numeric";

  let otp: string;
  if (type === "numeric") {
    // Generate cryptographically secure numeric OTP
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    const randomValue = crypto.randomInt(min, max + 1);
    otp = randomValue.toString().padStart(length, "0");
  } else {
    // Alphanumeric OTP
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const randomBytes = crypto.randomBytes(length);
    otp = Array.from(randomBytes)
      .map((byte) => charset[byte % charset.length])
      .join("");
  }

  const otpId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  const hashedOTP = hashOTP(otp);

  return {
    otp,
    hashedOTP,
    expiresAt,
    otpId,
  };
}

/**
 * Hash an OTP for secure storage
 * @param otp - Plain OTP
 * @returns Hashed OTP
 */
export function hashOTP(otp: string): string {
  return bcrypt.hashSync(otp, OTP_HASH_ROUNDS);
}

/**
 * Verify an OTP against its hash (timing-safe)
 * @param otp - Plain OTP provided by user
 * @param hashedOTP - Hashed OTP from database
 * @returns True if OTP matches
 */
export function verifyOTP(otp: string, hashedOTP: string): boolean {
  if (!otp || !hashedOTP) {
    return false;
  }
  return bcrypt.compareSync(otp, hashedOTP);
}

/**
 * Verify OTP with expiry check
 * @param otp - Plain OTP provided by user
 * @param hashedOTP - Hashed OTP from database
 * @param expiresAt - Expiry timestamp
 * @returns True if OTP is valid and not expired
 */
export function verifyOTPWithExpiry(
  otp: string,
  hashedOTP: string,
  expiresAt: Date,
): boolean {
  if (new Date() > expiresAt) {
    return false;
  }
  return verifyOTP(otp, hashedOTP);
}

/**
 * Generate a TOTP secret for authenticator apps
 * @returns Base32 encoded secret
 */
export function generateTOTPSecret(): string {
  const secret = crypto.randomBytes(20);
  return base32Encode(secret);
}

/**
 * Generate TOTP token from secret
 * @param secret - Base32 encoded secret
 * @param counter - Time counter (default: current time step)
 * @returns TOTP token
 */
export function generateTOTP(secret: string, counter?: number): string {
  const timeStep = counter ?? Math.floor(Date.now() / 1000 / TOTP_STEP);
  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
  timeBuffer.writeUInt32BE(timeStep % 0x100000000, 4);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = (hash[hash.length - 1] ?? 0) & 0xf;
  const offsetBytes = hash.subarray(offset, offset + 4);
  const byte0 = offsetBytes[0] ?? 0;
  const byte1 = offsetBytes[1] ?? 0;
  const byte2 = offsetBytes[2] ?? 0;
  const byte3 = offsetBytes[3] ?? 0;
  const code =
    ((byte0 & 0x7f) << 24) |
    ((byte1 & 0xff) << 16) |
    ((byte2 & 0xff) << 8) |
    (byte3 & 0xff);

  return (code % Math.pow(10, TOTP_DIGITS))
    .toString()
    .padStart(TOTP_DIGITS, "0");
}

/**
 * Verify TOTP token with time window tolerance
 * @param token - TOTP token from user
 * @param secret - Base32 encoded secret
 * @param window - Number of time steps to check before/after (default: 1)
 * @returns Verification result with time delta
 */
export function verifyTOTP(
  token: string,
  secret: string,
  window = 1,
): TOTPVerificationResult {
  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_STEP);

  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTP(secret, currentCounter + i);
    if (timingSafeEqual(token, expectedToken)) {
      return { isValid: true, delta: i };
    }
  }

  return { isValid: false, delta: 0 };
}

/**
 * Generate backup codes for 2FA recovery
 * @param count - Number of backup codes to generate
 * @returns Array of backup codes
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Generate QR code URL for TOTP setup
 * @param email - User's email/account name
 * @param secret - Base32 encoded TOTP secret
 * @param issuer - Service/provider name
 * @returns otpauth:// URL for QR code generation
 */
export function generateQRCodeURL(
  email: string,
  secret: string,
  issuer: string,
): string {
  const encodedEmail = encodeURIComponent(email);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Hash backup codes for storage
 * @param codes - Array of backup codes
 * @returns Array of hashed backup codes
 */
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) =>
    bcrypt.hashSync(code.replace("-", ""), OTP_HASH_ROUNDS),
  );
}

/**
 * Verify a backup code
 * @param code - Backup code provided by user
 * @param hashedCodes - Array of hashed backup codes
 * @returns Index of matched code, or -1 if not found
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const normalizedCode = code.replace("-", "").toUpperCase();
  for (let i = 0; i < hashedCodes.length; i++) {
    const hashedCode = hashedCodes[i];
    if (hashedCode && bcrypt.compareSync(normalizedCode, hashedCode)) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if OTP is expired
 * @param expiresAt - Expiry timestamp
 * @returns True if expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Get remaining time until OTP expires (in seconds)
 * @param expiresAt - Expiry timestamp
 * @returns Seconds remaining (0 if expired)
 */
export function getOTPTimeRemaining(expiresAt: Date): number {
  const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Timing-safe string comparison
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  // Pad to multiple of 8 characters
  while (output.length % 8 !== 0) {
    output += "=";
  }

  return output;
}

/**
 * Base32 decoding
 */
function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanStr = str.replace(/=/g, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleanStr) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Create OTP payload for JWT token (used in email verification, password reset)
 * @param userId - User ID
 * @param email - User email
 * @param purpose - Purpose of OTP (verification, password_reset, 2fa)
 * @returns OTP payload object
 */
export function createOTPPayload(
  userId: string,
  email: string,
  purpose: "verification" | "password_reset" | "2fa",
): object {
  return {
    userId,
    email,
    purpose,
    type: "otp",
    iat: Math.floor(Date.now() / 1000),
  };
}

/**
 * Validate OTP format
 * @param otp - OTP string to validate
 * @param expectedLength - Expected length (default: 6)
 * @returns True if valid format
 */
export function validateOTPFormat(
  otp: string,
  expectedLength = OTP_LENGTH,
): boolean {
  if (!otp || typeof otp !== "string") {
    return false;
  }
  return /^\d+$/.test(otp) && otp.length === expectedLength;
}
