import crypto from 'crypto';
import { ProviderError } from '../../core/errors';

export interface VerifiedGoogleIdentity {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  verificationMethod: 'id_token_sig_verified' | 'userinfo_endpoint';
}

interface JWKKey {
  kty: string;
  alg: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

export class GoogleIdentityVerifier {
  private static cachedJwks: { keys: JWKKey[]; fetchedAt: number } | null = null;
  private static readonly JWKS_CACHE_TTL_MS = 3600 * 1000; // 1 hour

  /**
   * Fetch Google's public RSA signing keys from official JWKS endpoint.
   */
  private static async getGooglePublicKeys(): Promise<JWKKey[]> {
    const now = Date.now();
    if (this.cachedJwks && now - this.cachedJwks.fetchedAt < this.JWKS_CACHE_TTL_MS) {
      return this.cachedJwks.keys;
    }

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
      if (!res.ok) {
        throw new Error(`Google JWKS fetch failed with status ${res.status}`);
      }
      const data = (await res.json()) as { keys: JWKKey[] };
      if (Array.isArray(data.keys)) {
        this.cachedJwks = { keys: data.keys, fetchedAt: now };
        return data.keys;
      }
    } catch (e: any) {
      console.warn(`[GoogleIdentityVerifier] Could not fetch live JWKS: ${e.message}`);
    }

    return this.cachedJwks?.keys || [];
  }

  /**
   * Convert RSA JWK (n, e) to Node.js KeyObject for cryptographic verification.
   */
  private static jwkToPublicKey(jwk: JWKKey): crypto.KeyObject | null {
    try {
      return crypto.createPublicKey({
        key: {
          kty: jwk.kty || 'RSA',
          n: jwk.n,
          e: jwk.e,
        },
        format: 'jwk',
      });
    } catch (e: any) {
      console.warn(`[GoogleIdentityVerifier] Failed to convert JWK to KeyObject: ${e.message}`);
      return null;
    }
  }

  /**
   * Cryptographically verify a Google ID Token (RSA-SHA256 signature, issuer, audience, expiration).
   */
  public static async verifyIdToken(
    idToken: string,
    expectedClientId: string
  ): Promise<VerifiedGoogleIdentity | null> {
    if (!idToken || typeof idToken !== 'string') return null;

    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        console.warn(`[GoogleIdentityVerifier] Malformed ID Token structure`);
        return null;
      }

      const [headerB64, payloadB64, signatureB64] = parts;
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));

      // 1. Validate Expiration
      const nowSec = Math.floor(Date.now() / 1000);
      if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
        console.warn(`[GoogleIdentityVerifier] ID Token expired (exp: ${payload.exp}, now: ${nowSec})`);
        return null;
      }

      // 2. Validate Issuer
      const isGoogleIssuer =
        payload.iss === 'https://accounts.google.com' || payload.iss === 'accounts.google.com';
      if (!isGoogleIssuer) {
        console.warn(`[GoogleIdentityVerifier] Invalid ID Token issuer: ${payload.iss}`);
        return null;
      }

      // 3. Validate Audience
      if (payload.aud !== expectedClientId) {
        console.warn(`[GoogleIdentityVerifier] ID Token audience mismatch (got: ${payload.aud}, expected: ${expectedClientId})`);
        return null;
      }

      // 4. Validate Email presence
      if (!payload.email || typeof payload.email !== 'string' || !payload.email.includes('@')) {
        console.warn(`[GoogleIdentityVerifier] ID Token missing valid email claim`);
        return null;
      }

      // 5. Cryptographic Signature Verification against Google JWKS
      const jwks = await this.getGooglePublicKeys();
      const targetJwk = jwks.find((k) => k.kid === header.kid);

      if (targetJwk) {
        const publicKey = this.jwkToPublicKey(targetJwk);
        if (publicKey) {
          const verifier = crypto.createVerify('RSA-SHA256');
          verifier.update(`${headerB64}.${payloadB64}`);
          const isValidSig = verifier.verify(publicKey, signatureB64, 'base64url');

          if (!isValidSig) {
            console.error(`[GoogleIdentityVerifier] CRYPTOGRAPHIC SIGNATURE VERIFICATION FAILED`);
            return null;
          }

          console.log(`[GoogleIdentityVerifier] Cryptographic RSA-SHA256 ID Token signature VERIFIED successfully`);
          return {
            sub: payload.sub || payload.id,
            email: payload.email,
            email_verified: Boolean(payload.email_verified),
            name: payload.name || payload.email,
            verificationMethod: 'id_token_sig_verified',
          };
        }
      }

      console.warn(`[GoogleIdentityVerifier] Matching JWK kid '${header.kid}' not available for signature verification`);
      return null;
    } catch (e: any) {
      console.warn(`[GoogleIdentityVerifier] ID token verification error: ${e.message}`);
      return null;
    }
  }

  /**
   * Fallback: Query Google UserInfo endpoint with OAuth Access Token.
   */
  public static async fetchUserInfo(accessToken: string): Promise<VerifiedGoogleIdentity | null> {
    if (!accessToken || typeof accessToken !== 'string') return null;

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[GoogleIdentityVerifier] Google userinfo HTTP ${res.status}: ${errText}`);
        return null;
      }

      const data = await res.json();
      if (data && data.email && typeof data.email === 'string' && data.email.includes('@')) {
        return {
          sub: data.id || data.sub,
          email: data.email,
          email_verified: Boolean(data.verified_email || data.email_verified),
          name: data.name || data.email,
          verificationMethod: 'userinfo_endpoint',
        };
      }
    } catch (e: any) {
      console.warn(`[GoogleIdentityVerifier] Userinfo fetch error: ${e.message}`);
    }

    return null;
  }
}
