# Prepaid Billing and Code Cleanup

Last updated: 2026-08-13

## Purpose

This document records the repository cleanup and the secured Razorpay Order flow. The current plan product is a one-time 30-day prepaid purchase with manual renewal. It is not a recurring Razorpay subscription.

## Application Boundaries

- `apps/web` owns Next.js pages, client UI, authenticated server actions, and dashboard data presentation.
- `apps/api` owns payment authority, Razorpay secret operations, payment validation, provider calls, and billing mutations.
- `packages/database` owns ordered Postgres migrations and atomic billing functions.

The browser never receives `RAZORPAY_KEY_SECRET` or the Supabase service-role key.

## Redundancy Cleanup

### Shared Supabase workspace access

`apps/web/lib/workspace.ts` is now the canonical web helper for:

- Creating the service-role Supabase client.
- Resolving the authenticated user's single owned workspace.
- Requiring a workspace for protected server actions.

Billing, KYC, Setu DigiLocker, phone-number, campaign, call, and assistant code now reuse these helpers instead of creating local admin clients or independently selecting workspace memberships.

The admin helper now requires `SUPABASE_SERVICE_ROLE_KEY`. It no longer falls back to a public Supabase key.

### Shared Vomyra access

`apps/web/lib/vomyra.ts` is the canonical web-side Vomyra HTTP client. It owns:

- Provider base URL normalization.
- API-key injection.
- Calls-list fetching.
- Phone-number fetching.
- Failure handling for missing credentials.

Direct provider credential handling was removed from call actions, campaign actions, phone-number actions, KYC administration, analytics, call logs, campaign history, and assistant details. A hardcoded Vomyra API-key fallback was removed.

### Removed dead or duplicate behavior

- Removed unused `buyPhoneNumberAction`. The active acquisition path is KYC approval and the Express `/api/v1/phone-numbers/buy` endpoint remains available.
- Consolidated `getDigiLockerKycStatus` into `getWorkspaceKycStatus`. The old action name remains as a compatibility wrapper; PAN verification, DigiLocker initiation, callback handling, and status retrieval remain intact.
- Removed duplicate local assistant deletion after the Express API had already deleted the same assistant and related records.
- Removed the accidental duplicate `packages/ui/@/components/ui/button.tsx` file.
- Calls, campaigns, and analytics now share provider request setup instead of each rebuilding it.

## Prepaid Billing Architecture

```text
BillingClient.tsx
  -> apps/web/app/actions/billing.ts
  -> authenticated Express payment endpoint
  -> Razorpay Orders API
  -> payment_intents
  -> Razorpay Checkout
  -> authenticated verification endpoint
  -> signature and captured-payment validation
  -> process_payment_intent RPC
  -> workspace entitlement and credit ledger
```

### Web responsibilities

`apps/web/app/actions/billing.ts` is a thin authenticated proxy for payment operations.

It:

- Reads the Supabase session through the SSR cookie client.
- Forwards the access token as `Authorization: Bearer <token>`.
- Calls the Express create-order and verify-payment endpoints.
- Revalidates `/dashboard/billing` after successful verification.
- Reads billing display data for the authenticated workspace.

It does not create Razorpay orders, verify HMAC signatures, activate plans, or insert credits.

### API responsibilities

`apps/api/src/routes/payments.ts` is the authoritative payment controller.

Create order:

1. Verifies the Supabase access token with `auth.getUser(token)`.
2. Resolves the user's owned workspace server-side.
3. Accepts only `plan_purchase` or `top_up`.
4. Loads prepaid plan prices from `plans`; browser plan amounts are ignored.
5. Restricts top-ups to INR 500 through INR 25,000.
6. Creates the Razorpay Order.
7. Stores an authoritative pending `payment_intents` row before returning checkout data.

Verify payment:

1. Verifies the Supabase access token and workspace ownership again.
2. Verifies the Razorpay checkout signature with a constant-time comparison.
3. Loads the stored intent by Razorpay Order ID.
4. Fetches the payment from Razorpay.
5. Requires `captured` status and matching order ID, amount, and INR currency.
6. Calls the atomic `process_payment_intent` database function.

### Database responsibilities

Migration `0007_recurring_subscriptions.sql` has a historical filename but implements prepaid billing. It adds:

- `payment_intents` with unique Razorpay Order and Payment IDs.
- Razorpay purchase references on `workspace_subscriptions`.
- A 30-day entitlement period.
- An atomic payment-processing function.
- RLS and revoked client access for payment intents.
- Service-role-only execution of payment processing.

The legacy `stripe_subscription_id` column is retained to avoid destructive data loss. New purchases do not write to it.

Migration `0008_harden_prepaid_billing.sql` is corrective and must also be applied. It protects databases where an earlier version of migration 0007 was already run.

The atomic function:

- Locks the payment intent against concurrent processing.
- Rejects a different payment ID for a completed order.
- Returns consistent data for safe retries.
- Grants credits once.
- Activates or extends the prepaid entitlement by 30 days.
- Synchronizes `profiles.current_plan` in the same transaction.

Payment ledger uniqueness applies only to `grant` and `top_up`. Call reservation, release, and charge entries may intentionally share a reference ID.

## Terminology

Use these terms:

- `plan_purchase`: a one-time plan payment.
- `prepaid plan`: 30 days of access requiring manual renewal.
- `top_up`: a one-time wallet recharge.

Do not describe the current flow as auto-renewing or recurring. The billing UI displays `/30 days` and tells users that renewal is manual.

## Required Environment Variables

`apps/api`:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`apps/web`:

```text
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
API_URL or NEXT_PUBLIC_API_URL
```

`API_URL` is preferred for server-to-server traffic. It can be the API origin, such as `http://localhost:8000`, or include `/api/v1`.

There are no dummy Razorpay credential fallbacks. Missing credentials fail explicitly.

## Deployment Order

1. Apply database migrations 0007 and 0008 in order.
2. Configure Razorpay and Supabase secrets in the API environment.
3. Configure the public Razorpay key and API URL in the web environment.
4. Deploy `apps/api`.
5. Deploy `apps/web`.
6. Run one plan purchase and one wallet top-up in Razorpay Test Mode.
7. Retry each verification request and confirm credits are not granted twice.
8. Confirm expired plans are not displayed as active.

## Verification Completed

- Web TypeScript check passed.
- Web ESLint passed with zero warnings.
- Express API TypeScript build passed.
- Next.js production build passed after the redundancy cleanup.
- Razorpay payment verification was checked against the official captured-payment fields.

The Supabase CLI is not installed in the local environment, so migrations were reviewed statically but were not executed against a local Supabase database during this review.

## Deferred Work

- Add a verified Razorpay `payment.captured` webhook or reconciliation job. Without it, a captured payment needs manual reconciliation if the browser closes before verification completes.
- Add rate limiting to payment order creation.
- Add integration tests for invalid tokens, altered amounts, duplicate callbacks, mismatched payment IDs, and early plan renewal.
- Implement real Razorpay recurring subscriptions only when automatic renewal is required.
