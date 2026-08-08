import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TDi7sLSJAYc8FV';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'eXaoIvfFBUqZuUwxkAF0Fzab';

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

  return expectedSignature === signature;
}
