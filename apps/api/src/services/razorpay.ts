import Razorpay from 'razorpay';
import crypto from 'crypto';
import { optionalEnv } from '../config/env';

let _razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpayInstance) {
    const key_id = optionalEnv('RAZORPAY_KEY_ID');
    const key_secret = optionalEnv('RAZORPAY_KEY_SECRET');
    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials not configured (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)');
    }
    _razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }
  return _razorpayInstance;
}

/**
 * Create a Razorpay Order in INR paise
 */
export async function createOrder(amountInRupees: number, notes: Record<string, any> = {}) {
  const rzp = getRazorpay();
  const key_id = optionalEnv('RAZORPAY_KEY_ID') || '';
  const amountInPaise = Math.round(amountInRupees * 100);
  
  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: key_id
  };
}

export async function fetchPayment(paymentId: string) {
  const rzp = getRazorpay();
  return rzp.payments.fetch(paymentId);
}

/**
 * Verify Razorpay HMAC SHA256 Signature
 */
export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key_secret = optionalEnv('RAZORPAY_KEY_SECRET');
  if (!key_secret) {
    throw new Error('Missing RAZORPAY_KEY_SECRET');
  }
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
