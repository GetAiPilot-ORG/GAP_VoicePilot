import crypto from 'crypto';
import { supabaseAdmin as supabase } from '../../config/supabase';

export class IdempotencyManager {
  private static memoryCache = new Set<string>();

  /**
   * Verify HMAC-SHA256 webhook signature.
   */
  public static verifySignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if event has already been processed (deduplication).
   * Stores key if new.
   */
  public static async isDuplicate(provider: string, idempotencyKey: string, eventType: string): Promise<boolean> {
    if (!idempotencyKey) return false;

    const fullKey = `${provider}:${eventType}:${idempotencyKey}`;

    // Fast in-memory check
    if (this.memoryCache.has(fullKey)) {
      return true;
    }

    try {
      const { data } = await supabase
        .from('event_idempotency')
        .select('id')
        .eq('idempotency_key', fullKey)
        .limit(1)
        .maybeSingle();

      if (data) {
        this.memoryCache.add(fullKey);
        return true;
      }

      // Record in DB
      await supabase.from('event_idempotency').insert({
        provider,
        idempotency_key: fullKey,
        event_type: eventType,
        processed_at: new Date().toISOString(),
      });

      this.memoryCache.add(fullKey);

      // Limit memory cache size
      if (this.memoryCache.size > 5000) {
        const first = this.memoryCache.values().next().value;
        if (first) this.memoryCache.delete(first);
      }

      return false;
    } catch (err: any) {
      console.warn('[IdempotencyManager] DB check warning (falling back to memory):', err.message);
      if (this.memoryCache.has(fullKey)) return true;
      this.memoryCache.add(fullKey);
      return false;
    }
  }

  public static clearCache(): void {
    this.memoryCache.clear();
  }
}
