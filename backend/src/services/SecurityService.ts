import crypto from 'crypto';
import * as otplib from 'otplib';
const authenticator = (otplib as any).authenticator;

export class SecurityService {
  private static readonly AES_ALGORITHM = 'aes-256-gcm';
  private static readonly MASTER_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

  /**
   * Encrypts sensitive data using AES-256-GCM
   */
  static encrypt(text: string): { iv: string; encryptedData: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.MASTER_KEY, 'hex');
    const cipher = crypto.createCipheriv(this.AES_ALGORITHM, key, iv);
    
    let encryptedData = cipher.update(text, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return { iv: iv.toString('hex'), encryptedData, authTag };
  }

  /**
   * Decrypts sensitive data using AES-256-GCM
   */
  static decrypt(ivHex: string, encryptedData: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(this.MASTER_KEY, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.AES_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generates a TOTP secret and provisioning URI for Authenticator apps
   */
  static generateMfaSecret(email: string) {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(email, 'SwathiPublications', secret);
    return { secret, uri };
  }

  /**
   * Verifies a TOTP token against a secret
   */
  static verifyMfaToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  /**
   * Generates a signed URL for secure file access (e.g. PDFs)
   * Validates time and path using HMAC SHA-256
   */
  static generateSignedUrl(filePath: string, expiresInMs: number): string {
    const expiresAt = Date.now() + expiresInMs;
    const dataToSign = `${filePath}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', this.MASTER_KEY)
      .update(dataToSign)
      .digest('hex');
      
    return `${filePath}?expires=${expiresAt}&signature=${signature}`;
  }

  /**
   * Verifies a signed URL for file access
   */
  static verifySignedUrl(filePath: string, expiresAt: number, signature: string): boolean {
    if (Date.now() > expiresAt) return false;
    const dataToSign = `${filePath}:${expiresAt}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.MASTER_KEY)
      .update(dataToSign)
      .digest('hex');
      
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  }
}
