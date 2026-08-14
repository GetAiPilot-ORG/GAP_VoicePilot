import Razorpay from 'razorpay';
import crypto from 'crypto';
import { requireEnv } from '../config/env';

const key_id = requireEnv('RAZORPAY_KEY_ID');
const key_secret = requireEnv('RAZORPAY_KEY_SECRET');

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret
});

/**
 * Create a Razorpay Order in INR paise
 */
export async function createOrder(amountInRupees: number, notes: Record<string, any> = {}) {
  const amountInPaise = Math.round(amountInRupees * 100);
  
  const order = await razorpayInstance.orders.create({
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
  return razorpayInstance.payments.fetch(paymentId);
}

/**
 * Verify Razorpay HMAC SHA256 Signature
 */
export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
