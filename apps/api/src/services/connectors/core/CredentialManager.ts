import crypto from 'crypto';

export class CredentialManager {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * Derive 32-byte encryption key from environment master key.
   */
  private static getEncryptionKey(): Buffer {
    const rawKey = 
      process.env.CONNECTOR_ENCRYPTION_KEY || 
      process.env.ENCRYPTION_KEY || 
      'voicepilot_connector_secret_32b_key_prod!';
    
    return crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Encrypt sensitive credentials (object or string) into AES-256-GCM cipher payload.
   */
  public static encrypt(data: Record<string, any> | string): string {
    const textToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = this.getEncryptionKey();

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    const payload = {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted,
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Decrypt AES-256-GCM cipher payload back into original object or string form.
   */
  public static decrypt<T = any>(encryptedPayload: string): T {
    if (!encryptedPayload) return {} as T;

    try {
      const decodedPayload = JSON.parse(Buffer.from(encryptedPayload, 'base64').toString('utf8'));
      const iv = Buffer.from(decodedPayload.iv, 'hex');
      const authTag = Buffer.from(decodedPayload.authTag, 'hex');
      const key = this.getEncryptionKey();

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(decodedPayload.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted) as T;
      } catch {
        return decrypted as unknown as T;
      }
    } catch (err: any) {
      throw new Error(`Credential decryption failed: ${err.message}`);
    }
  }

  /**
   * Redact string content (e.g. log text, error stack trace, authorization headers).
   */
  public static redactString(text: string): string {
    if (!text || typeof text !== 'string') return text;

    return text
      // Redact Authorization headers: "Authorization: Bearer <token>" or "Bearer <token>"
      .replace(/(authorization\s*:\s*)?(bearer\s+)[a-zA-Z0-9_\-\.\~]+(?=\s|$|;|,|"|')/gi, '$1Bearer [REDACTED]')
      // Redact access_token / refresh_token parameters in URLs or JSON strings
      .replace(/(access_token|refresh_token|api_key|apiKey|client_secret|clientSecret|x-api-key|secret)\s*(=|:)\s*["']?[a-zA-Z0-9_\-\.\~]+["']?/gi, '$1$2"[REDACTED]"');
  }

  /**
   * Redact sensitive credentials recursively from objects, arrays, error messages, or headers.
   */
  public static redactCredentials<T = any>(data: T): T {
    if (!data) return data;

    if (typeof data === 'string') {
      return this.redactString(data) as unknown as T;
    }

    if (data instanceof Error) {
      const redactedError = new Error(this.redactString(data.message));
      redactedError.stack = data.stack ? this.redactString(data.stack) : undefined;
      return redactedError as unknown as T;
    }

    if (typeof data === 'object') {
      const sensitiveKeys = /token|secret|key|password|authorization|auth|credential|jwt|bearer/i;
      const redacted: Record<string, any> = Array.isArray(data) ? [] : {};

      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.test(key)) {
          redacted[key] = '[REDACTED]';
        } else if (typeof value === 'string') {
          redacted[key] = this.redactString(value);
        } else if (value && typeof value === 'object') {
          redacted[key] = this.redactCredentials(value);
        } else {
          redacted[key] = value;
        }
      }

      return redacted as T;
    }

    return data;
  }

  /**
   * Alias for redactCredentials to maintain full backward compatibility.
   */
  public static sanitizeData<T = any>(data: T): T {
    return this.redactCredentials(data);
  }
}
