import crypto from 'crypto';
import { CredentialManager } from './CredentialManager';
import { ConnectorError } from './errors';

export interface OAuthStatePayload {
  userId?: string | null;
  workspaceId: string;
  providerSlug: string;
  codeVerifier?: string | null;
  redirectUrl?: string | null;
  nonce: string;
  expiresAt: number;
}

export class OAuthStateInvalidError extends ConnectorError {
  constructor(message: string = 'Invalid OAuth state parameter') {
    super('invalid_state', message, 400);
  }
}

export class OAuthStateExpiredError extends ConnectorError {
  constructor(message: string = 'OAuth authorization state has expired') {
    super('state_expired', message, 400);
  }
}

export class OAuthAccessDeniedError extends ConnectorError {
  constructor(message: string = 'User or provider denied authorization request') {
    super('access_denied', message, 400);
  }
}

export class OAuthStateManager {
  private static readonly DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private static consumedNonces: Set<string> = new Set();

  /**
   * Generate an encrypted, signed base64 state token containing state metadata.
   */
  public static generateState(payload: {
    workspaceId: string;
    providerSlug: string;
    userId?: string | null;
    codeVerifier?: string | null;
    redirectUrl?: string | null;
    ttlMs?: number;
  }): string {
    const expiresAt = Date.now() + (payload.ttlMs || this.DEFAULT_TTL_MS);
    const nonce = crypto.randomBytes(12).toString('hex');

    const stateObj: OAuthStatePayload = {
      workspaceId: payload.workspaceId,
      providerSlug: payload.providerSlug,
      userId: payload.userId || null,
      codeVerifier: payload.codeVerifier || null,
      redirectUrl: payload.redirectUrl || null,
      nonce,
      expiresAt,
    };

    return CredentialManager.encrypt(stateObj);
  }

  /**
   * Decrypt and validate state strictly against expected provider and expiry.
   */
  public static validateState(stateString: string, expectedProviderSlug: string): OAuthStatePayload {
    if (!stateString) {
      throw new OAuthStateInvalidError('Missing state parameter');
    }

    let payload: OAuthStatePayload;
    try {
      payload = CredentialManager.decrypt<OAuthStatePayload>(stateString);
    } catch (e: any) {
      throw new OAuthStateInvalidError('State parameter could not be decrypted or verified');
    }

    if (!payload || !payload.workspaceId || !payload.providerSlug || !payload.expiresAt || !payload.nonce) {
      throw new OAuthStateInvalidError('Malformed state payload structure');
    }

    if (this.consumedNonces.has(payload.nonce)) {
      throw new OAuthStateInvalidError('OAuth state has already been consumed (replay attack prevented)');
    }

    if (payload.providerSlug !== expectedProviderSlug) {
      throw new OAuthStateInvalidError(
        `State provider mismatch: expected '${expectedProviderSlug}', got '${payload.providerSlug}'`
      );
    }

    if (Date.now() > payload.expiresAt) {
      throw new OAuthStateExpiredError('OAuth authorization state expired. Please try authorizing again.');
    }

    // Mark nonce as consumed (single-use)
    this.consumedNonces.add(payload.nonce);

    return payload;
  }

  /**
   * Generate RFC 7636 PKCE code verifier and S256 challenge pair.
   */
  public static generatePKCE(): {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
  } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }
}
