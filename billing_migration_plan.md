# Recurring Subscription Plan

## 1. Define Billing Rules
Decide these before implementation:
- Monthly billing cycle.
- Whether plan upgrades happen immediately or next cycle.
- Whether downgrades happen next cycle.
- Whether unused minutes roll over.
- Grace period after failed renewal, recommended 3–7 days.
- Cancellation behavior, recommended access until period end.
- Whether each plan includes exactly one dedicated number.
- Indian recurring payment limits and supported payment methods.

**Recommended defaults:**
- **Upgrade:** immediate
- **Downgrade:** next billing cycle
- **Cancel:** end of current period
- **Failed payment:** 5-day grace period
- **Included minutes:** reset each billing cycle
- **Wallet top-ups:** never expire

## 2. Create Razorpay Plans
Create one Razorpay Plan for each internal plan:
- `call_lite`  → ₹1,499 monthly
- `call_pro`   → ₹2,999 monthly
- `call_elite` → ₹7,999 monthly

Store the returned IDs in the plans table:
```sql
alter table public.plans
  add column razorpay_plan_id text unique,
  add column billing_interval text not null default 'monthly';
```
These will be real Razorpay IDs such as `plan_...`, not your internal `call_pro` identifier.

## 3. Replace Subscription Schema
Rename provider-specific and misleading fields:
`stripe_subscription_id` → `provider_subscription_id`

Add to `workspace_subscriptions`:
- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `provider_plan_id`
- `status`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `canceled_at`
- `ended_at`
- `grace_period_end`
- `last_payment_id`
- `last_webhook_at`

**Recommended statuses:**
`created`, `authenticated`, `active`, `pending`, `past_due`, `halted`, `canceled`, `completed`, `expired`

Add a unique constraint on: `provider + provider_subscription_id`

## 4. Add Billing Event Tables
Create a payment table (`subscription_payments`):
- id
- workspace_id
- subscription_id
- provider_payment_id
- provider_invoice_id
- amount
- currency
- status
- billing_period_start
- billing_period_end
- created_at

Create an idempotent webhook table (`billing_webhook_events`):
- provider_event_id (unique)
- event_type
- payload
- processing_status
- processed_at
- error

*(Sensitive webhook payloads should have a retention policy.)*

## 5. Create Subscription Server Endpoint
Replace plan checkout’s `/v1/orders` request with a protected server action that:
1. Authenticates the user.
2. Resolves their workspace server-side.
3. Loads the selected plan and price from the database.
4. Uses its `razorpay_plan_id`.
5. Calls Razorpay’s Subscriptions API.
6. Stores the resulting subscription as `created`.
7. Returns only its `subscription_id` and public key.

> Never accept authoritative price or workspace IDs from the browser.

## 6. Use Subscription Checkout
For a plan purchase, Checkout should receive:
```json
{
  "key": "razorpayKeyId",
  "subscription_id": "sub_12345",
  "name": "VoicePilot AI",
  "description": "CALL PRO monthly subscription"
}
```
It should no longer receive an `order_id` for plan subscriptions.
Keep Razorpay Orders only for one-time wallet top-ups.

## 7. Add Razorpay Webhooks
Create a dedicated endpoint such as: `POST /api/webhooks/razorpay`

Verify the raw request body with `RAZORPAY_WEBHOOK_SECRET` before parsing or modifying data.
Handle at least:
- `subscription.authenticated`
- `subscription.activated`
- `subscription.charged`
- `subscription.pending`
- `subscription.halted`
- `subscription.cancelled`
- `subscription.completed`
- `payment.failed`

> The webhook, not the browser callback, must be the source of truth.

## 8. Make Webhook Processing Idempotent
Inside one database transaction:
1. Insert the provider event ID.
2. Stop if it was already processed.
3. Lock the subscription row.
4. Update subscription status and billing period.
5. Insert the payment record.
6. Grant included minutes once.
7. Mark the event processed.

Use the Razorpay payment or invoice ID as a unique ledger reference so retries cannot grant minutes twice.

## 9. Change Credit Granting
Included plan minutes should be granted **only after**: `subscription.charged`
Do not grant them from the browser Checkout handler.

Wallet top-ups remain separate:
Razorpay Order → payment captured → top_up ledger entry

Use distinct ledger types such as:
`subscription_grant`, `top_up`, `reservation`, `reservation_release`, `charge`, `refund`, `expiration`

## 10. Enforce Subscription Access
Every protected operation should require:
`status = active` AND `current_period_end > now()`

Grace-period access may additionally allow:
`status = past_due` AND `grace_period_end > now()`

Enforce server-side:
- Maximum assistants
- Concurrent calls
- Campaign access
- Dedicated phone-number entitlement
- Recording and CRM features
- Subscription expiry

Middleware must fail closed when entitlement lookup fails.

## 11. Implement Lifecycle Actions
Add server actions for:
- Cancel at period end
- Reactivate before period end
- Upgrade plan
- Schedule downgrade
- Fetch provider subscription status
- Retry or replace payment authorization

Do not implement plan changes as another unrelated one-time payment.

## 12. Update Billing UI
Show real lifecycle information:
- Active / Renews on [Date] / Payment pending / Past due / Cancels on [Date] / Canceled

Add UI elements for:
- Renewal date
- Cancel subscription
- Resume subscription
- Payment-failure warning
- Scheduled plan change
- Billing/payment history
- Clear distinction between plan subscription and wallet top-up

Only display “Active Plan” from webhook-confirmed database state.

## 13. Migrate Existing Customers
Current records are one-time purchases, so they cannot silently become recurring mandates.

**Migration strategy:**
- Mark existing records as `legacy_prepaid`.
- Preserve their existing 30-day access.
- Do not auto-charge them.
- Invite users to authorize recurring billing.
- Activate the Razorpay subscription only after authorization.
- Prevent duplicate included-minute grants.
- Expire legacy access at its existing period end.

## 14. Security Corrections
As part of the implementation:
- Remove dummy Razorpay credential fallbacks.
- Compare signatures with constant-time comparison.
- Store server-created Order/Subscription IDs before Checkout.
- Verify captured payment state.
- Authenticate payment endpoints.
- Resolve workspace IDs server-side.
- Validate plan IDs and amounts server-side.
- Rate-limit checkout creation.
- Never log secrets, signatures, or complete payment payloads.
- Remove duplicate billing implementations and keep one authoritative service.

## 15. Testing And Rollout
Test in Razorpay Test Mode:
- Initial authorization, First activation, Successful renewal.
- Duplicate / Out-of-order webhook delivery.
- Failed renewal and grace period.
- Cancellation and reactivation.
- Upgrade and downgrade.
- Browser closes after payment.
- Webhook arrives without browser callback.
- Invalid webhook signature.
- Duplicate payment ID.
- Existing legacy customer migration.

**Rollout order:**
1. Database migration
2. Webhook endpoint
3. Subscription service
4. Entitlement enforcement
5. New checkout UI
6. Legacy customer migration
7. Production webhook monitoring

> **Key Architecture Summary:**
> Razorpay Subscription → Verified webhook → Workspace subscription state → Idempotent monthly credit grant → Server-side entitlement enforcement.
> *Wallet recharge should remain a separate one-time Razorpay Order flow.*
