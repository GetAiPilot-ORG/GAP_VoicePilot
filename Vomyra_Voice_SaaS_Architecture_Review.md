## White-Label AI Voice Calling SaaS on Vomyra

## Architecture Review & Reference Design

Prepared for: Multi-tenant SaaS built on top of the Vomyra white-label voice API Reviewed against: docs.vomyra.com/docs/api-reference (last updated Aug 1, 2026)

## A. Architecture Validation

## Verdict: your instinct is correct, and it is the only workable approach.

The Vomyra documentation confirms your suspicion directly. The API reference states every endpoint is "scoped to the API key owner," that list endpoints return "the authenticated user's" resources, and that unauthorized lookups return 404 rather than 403 ("as if the resource does not exist"). There is no sub-account, tenant, org, or client-ID concept anywhere in the reference — no POST /v1/ accounts , no tenant_id parameter, no per-customer key issuance endpoint. Vomyra is a single-tenant API surface wrapped around a single dashboard user.

## That means:

- Vomyra is not, and cannot be treated as, your multi-tenancy layer.

- Vomyra is correctly modeled as infrastructure (comparable to Twilio/Stripe-as-a-processor), not as your SaaS backend.

- The "treat Vomyra as an execution provider, own all tenancy yourself" architecture is the right — and really the only — model available to you given the current API surface.

- Your own database must be the source of truth for anything customer-facing: identity, ownership, permissions, campaign structure, billing. Vomyra is the source of truth only for execution state (did the call connect, what was said, how long did it last).

This is not a workaround or a hack — it is the standard pattern used by every white-label SaaS built on a single-tenant upstream API (agencies reselling a single Twilio/SendGrid/OpenAI account are structured identically). It is a well-understood, production-proven shape.

## B. Critical Risks in the Current Plan

These are the places where your draft needs tightening before you build:

- 1. No native uniqueness guarantee from Vomyra on your side. Vomyra gives you a provider_resource_id per assistant/call/ number, but you are responsible for guaranteeing that internal ID maps to exactly one row. If two of your backend instances race to create the same resource, you can end up with orphaned Vomyra assistants with no local owner. Needs idempotency keys (see section I).

- 2. No confirmed webhook system. The public API reference lists only Catalog, Assistants, Calls, Numbers, Tools — there is no Webhooks section in the navigation. You must assume polling until Vomyra confirms otherwise in writing. Building your whole call-lifecycle sync around an assumed webhook is a real risk to your Phase 4 timeline.

- 3. GET /v1/calls/{id} is the only place transcript/recording/whatsapp_summary/notes live, and the docs show no updated_at / status changed timestamp on that payload, only active: true/false and call_duration . That has two consequences: (a) you cannot cheaply detect "did this call just finish," you must poll until active flips to false ; (b) there is no clean partial/incremental transcript field, so mid-call polling for live status will be expensive if you ever want live agent monitoring.

- 4. A single Vomyra API key is a single blast radius. Rate limits are 600 req/min per key (confirmed in docs) shared across all your tenants. A large campaign from one customer can throttle every other customer. This is a real multi-tenancy fairness problem you must solve in your own queue layer (see section I), not something Vomyra will solve for you.

- 5. Vomyra dashboard is a side channel you don't control. Anyone with access to the Vomyra admin dashboard (you, staff) can create/delete/modify assistants, numbers, and calls outside your API. Your database will drift from provider reality the moment someone touches the Vomyra UI directly. This makes reconciliation (section O) mandatory, not optional, from day one — not a "nice to have" in Phase 6.


- 6. Credits/billing race conditions. If two workers deduct from the same wallet concurrently (e.g., two calls complete near- simultaneously), naive balance = balance - cost update logic will lose updates. Needs atomic ledger design (section K).

- 7. Cost model asymmetry. You don't yet know Vomyra's own billing model (per-minute? per-call? does their usage also key off "authenticated user," i.e., does one invoice cover all your tenants combined?). If Vomyra bills you in aggregate, you must independently reconcile your per-tenant revenue against one lump provider cost — you cannot get authoritative per-tenant cost data from Vomyra itself.

- 8. Deletion cascade risk. If an assistant is deleted (by you or directly in Vomyra) while historical calls/campaigns reference it, naive foreign keys will break your call history UI. Needs soft-delete (section M/O).

None of these are architecture-breaking. They are exactly the risks that show up in this pattern and all have standard mitigations, covered below.

## C. Recommended Final Architecture

Key rule carried through the whole design: the frontend only ever talks to your backend. Your backend is the only thing holding the Vomyra key. Every Vomyra resource is invisible to the customer — they only ever see your internal UUIDs.

## D. Database / Schema

Your proposed schema is fundamentally sound. Below is the same shape hardened for production: explicit constraints, idempotency support, soft deletes, and a proper ledger instead of a mutable balance.


```
-- Identity -----------------------------------------------------
profiles (
id uuid primary key references auth.users(id),
email text not null,
name text,
created_at timestamptz default now()
);
workspaces (
id uuid primary key default gen_random_uuid(),
name text not null,
owner_id uuid not null references profiles(id),
status text not null default 'active', -- active|suspended
created_at timestamptz default now()
);
workspace_members (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
user_id uuid not null references profiles(id),
role text not null check (role in ('owner','admin','agent')),
created_at timestamptz default now(),
unique (workspace_id, user_id)
);
-- Provider resource mapping (generic, provider-agnostic) -------
-- Shared shape reused across assistants / numbers / tools
assistants (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
created_by uuid not null references profiles(id),
provider text not null default 'vomyra',
provider_resource_id text, -- null until provider call succeeds
name text not null,
config_snapshot jsonb not null, -- last known full config, for audit/rollback
status text not null default 'pending', -- pending|active|failed|archived
deleted_at timestamptz, -- soft delete
created_at timestamptz default now(),
updated_at timestamptz default now(),
unique (provider, provider_resource_id)
);
phone_numbers (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
provider text not null default 'vomyra',
provider_resource_id text not null,
phone_number text not null,
assigned_assistant_id uuid references assistants(id),
status text not null default 'active',
deleted_at timestamptz,
created_at timestamptz default now(),
unique (provider, provider_resource_id)
);
tools (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
created_by uuid not null references profiles(id),
provider text not null default 'vomyra',
provider_resource_id text,
name text not null,
type text not null,
config jsonb not null,
deleted_at timestamptz,
created_at timestamptz default now()
);
assistant_tools (
assistant_id uuid not null references assistants(id),
```


```
tool_id uuid not null references tools(id),
primary key (assistant_id, tool_id)
);
-- Contacts / campaigns ------------------------------------------
contacts (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
name text,
phone text not null,
metadata jsonb default '{}',
created_at timestamptz default now()
);
campaigns (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
created_by uuid not null references profiles(id),
assistant_id uuid not null references assistants(id),
phone_number_id uuid not null references phone_numbers(id),
name text not null,
status text not null default 'draft',
-- draft|queued|running|paused|completed|cancelled|failed
concurrency_limit int not null default 5,
total_contacts int not null default 0,
created_at timestamptz default now()
);
campaign_contacts (
id uuid primary key default gen_random_uuid(),
campaign_id uuid not null references campaigns(id),
contact_id uuid not null references contacts(id),
call_id uuid references calls(id),
status text not null default 'pending',
-- pending|queued|calling|completed|failed|skipped
attempts int not null default 0,
next_attempt_at timestamptz,
unique (campaign_id, contact_id)
);
-- Calls (idempotent, provider-mapped) ----------------------------
calls (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
campaign_id uuid references campaigns(id),
assistant_id uuid not null references assistants(id),
contact_id uuid references contacts(id),
initiated_by uuid references profiles(id),
idempotency_key text not null unique, -- see section I
provider text not null default 'vomyra',
provider_resource_id text, -- null until Vomyra accepts
customer_number text not null,
status text not null default 'queued',
-- queued|dialing|in_progress|completed|no_answer|busy|failed|cancelled
recording_url text,
transcript jsonb,
notes text,
whatsapp_summary text,
duration_seconds int,
started_at timestamptz,
ended_at timestamptz,
last_synced_at timestamptz,
created_at timestamptz default now(),
unique (provider, provider_resource_id)
);
-- Usage & billing (ledger, never a mutable balance) ---------------
usage_events (
id uuid primary key default gen_random_uuid(),
workspace_id uuid not null references workspaces(id),
call_id uuid references calls(id),
```


## Notes on choices:

- provider_resource_id is nullable and unique together with provider — this lets you insert your local row before calling Vomyra (status pending ), then fill in the ID on success. That gives you a durable idempotency key even if the process crashes mid- call.

- credit_ledger instead of a mutable wallets.balance column. This is the single highest-leverage change versus your draft: an append-only ledger makes race conditions structurally impossible to hide, gives you a free audit trail, and lets you compute balance as SUM(amount) (or read the latest balance_after if you want O(1) reads with a covering index on (workspace_id, created_at desc) ).

- Soft deletes ( deleted_at ) everywhere a historical call might reference the row — assistants, numbers, tools. Never hard- delete a resource that a calls row points to.

- Every tenant-owned table carries workspace_id NOT NULL as you specified — this is correct and is what RLS will key off.

## E. Authentication & Multi-Tenancy

## Identity flow:

- 1. Customer authenticates via Supabase Auth (email/password, OAuth, magic link — your choice). Supabase issues a JWT containing sub (user id).

- 2. Frontend attaches Authorization: Bearer <jwt> on every API call to your backend.

- 3. Your backend verifies the JWT (Supabase JWKS or shared secret, depending on your Supabase Auth config), extracts user_id .


- 4. Backend resolves current workspace — either from a workspace_id in the request path/query, or from an x-workspace-id header set by the frontend after the user picks a workspace, or the user's single default workspace if you don't support multi- workspace-per-user yet.

- 5. Backend checks workspace_members for (user_id, workspace_id) and loads role .

- 6. Never trust a workspace_id or user_id sent as JSON body from the frontend — only the JWT-derived user_id , and a workspace_id you've validated against membership, are trustworthy.

Supabase RLS policies — even though your backend is the only thing with the service-role key (RLS is bypassed by service role), you should still enable RLS as defense-in-depth in case any client ever gets scoped anon/authenticated access, and so that direct SQL/ Studio access is safe by default:

```
alter table assistants enable row level security;
create policy "workspace members can read their assistants"
on assistants for select
using (
workspace_id in (
select workspace_id from workspace_members
where user_id = auth.uid()
)
and deleted_at is null
);
create policy "workspace admins/owners can write assistants"
on assistants for insert with check (
workspace_id in (
select workspace_id from workspace_members
where user_id = auth.uid() and role in ('owner','admin')
)
);
```

Repeat this pattern ( select scoped to membership; insert/update/delete scoped to role) for phone_numbers , tools ,

contacts , campaigns , calls , usage_events . credit_ledger and audit_logs should be read-only to workspace owners,

insert-only via service role (never client-writable).

Role model (as you proposed, this is right-sized for v1):

| Role | Assistants | Campaigns/Calls | Contacts | Billing | Members |
| --- | --- | --- | --- | --- | --- |
| Owner | full | full | full | full | full |
| Admin | full | full | full | read | invite/remove agents |
| Agent | read | assigned only | read | none | none |

Don't over-engineer roles beyond this for v1 — you can add fine-grained permissions later without a schema migration if you keep role as a simple enum and add a separate permissions jsonb override column only when you actually need it.

## F. Assistant Lifecycle

POST /api/v1/assistants

- 1. verify JWT -> user, workspace, role (admin/owner required)

- 2. validate payload against your own schema (mirror Vomyra's Create Assistant fields)

- 3. insert local row: status='pending', provider_resource_id=null

- 4. call voiceProvider.createAssistant(payload) [synchronous, this is a fast call]

- 5a. success -> update row: status='active', provider_resource_id=<id>

- 5b. failure -> update row: status='failed', store error in audit_logs

- 6. return internal assistant object (never the Vomyra id) to frontend

Assistant create/update are fast enough to be synchronous (single HTTP call to Vomyra, no bulk fan-out) — no need to queue these. Keep it simple: request in, request out.


Update ( PUT /api/v1/assistants/{id} ) follows the same ownership check pattern you described: look up by id + workspace_id , 404 if absent, then call PUT /v1/assistants/{provider_resource_id} on Vomyra, then update

config_snapshot .

Deletion: Vomyra's reference doesn't list a DELETE /v1/assistants/{id} endpoint at all — only list/create/get/update and tool assign/unassign. That means you likely cannot hard-delete an assistant on the provider side through the API today. Treat "delete" in your product as archive: set status='archived' , hide from active lists, keep the row (and the Vomyra resource) intact so historical calls rows keep resolving. This is also your answer to "what if a call references a deleted assistant" — it can't happen if delete is soft.

## G. Campaign Lifecycle

Your campaigns / campaign_contacts model is correct — this is exactly how batch-calling is built on top of a single-call API (this is the same pattern used on top of Twilio Programmable Voice). Vomyra doesn't need to know what a campaign is; it only ever sees

individual POST /v1/calls .

State machine:

draft -> queued -> running -> (paused <-> running) -> completed

\-> cancelled

\-> failed (e.g. no valid number/assistant)

• Pause: stop enqueuing new campaign_contacts jobs; in-flight calls finish naturally (you cannot recall a call already placed). • Resume: re-enqueue contacts still in pending / queued status. • Cancel: mark remaining pending contacts as skipped ; in-flight calls still complete and are recorded normally.

campaign_contacts.status should transition pending -> queued -> calling -> completed|failed , driven entirely by your

worker and webhook/poll updates — never by the frontend directly.

## H. Call Lifecycle

1. Worker pulls next campaign_contact (or single-call API request comes in directly) 2. Worker checks: credit reservation succeeds? phone number still assigned? assistant still active? 3. Worker calls voiceProvider.initiateCall({ idempotency_key, assistant, to, from }) 4. Vomyra returns a call id -> store as provider_resource_id, status='dialing' 5. Sync loop (poll or webhook) updates status as it changes 6. On terminal status (completed/failed/no_answer/busy): - fetch full call detail (GET /v1/calls/{id}) for recording_url/transcript/notes/whatsapp_summary - compute duration_seconds, billable_minutes - write usage_events row - write credit_ledger 'charge' row (and release any unused reservation)

\- update campaign_contacts.status

Vomyra's Get Call response (confirmed from docs) includes call_duration , active , recording_url , transcript[] ,

notes , whatsapp_summary , additional_data . Map these directly onto your calls row — you don't need to re-derive duration

yourself, Vomyra provides call_duration as HH:MM:SS ; parse it to duration_seconds for consistent math.

Call statuses: normalize whatever Vomyra's status / active fields report into your own small enum ( queued|dialing| in_progress|completed|no_answer|busy|failed|cancelled ) so your product UI and billing logic never depend on Vomyra's raw vocabulary — this is exactly the abstraction your provider-adapter layer should own.

## I. Queue / Worker Design

Redis + BullMQ is the right choice at your scale. Structure:

• call-dispatch queue — one job per campaign_contacts row. Consumers call voiceProvider.initiateCall .


- call-sync queue — repeatable/delayed jobs that poll GET /v1/calls/{id} for any call still in a non-terminal state (or consume webhook events if/when Vomyra confirms support).

- reconciliation queue — scheduled job (e.g. every 15 min) diffing Vomyra list endpoints against local mappings (section O).

## Concurrency control — this is the answer to your "how do I stop one tenant’s campaign from starving everyone else" risk:

- Enforce concurrency per workspace, not just globally, using BullMQ's group/rate-limit features or a Redis semaphore keyed by workspace_id ( campaign.concurrency_limit , plus a global ceiling tied to Vomyra's 600 req/min key-wide rate limit).

- A simple, effective pattern: a global token-bucket limiter in front of all Vomyra calls (e.g. 8–10 req/sec, safely under the 600/min = 10/ sec ceiling) shared by every worker process, plus a per-workspace max-concurrent-calls setting so no single campaign can consume the whole bucket.

## Idempotency (your Q16/17: retries and duplicate-call prevention):

- Every call dispatch job carries a deterministic idempotency_key — e.g. sha256(campaign_contact_id) or sha256(campaign_id + contact_id + attempt_number) .

- Before calling Vomyra, INSERT ... ON CONFLICT (idempotency_key) DO NOTHING into calls . If the insert is skipped (row already exists), the job was already dispatched — do not call Vomyra again, just re-check status.

- This protects you against BullMQ's at-least-once delivery causing a job to run twice, and against your own retry logic accidentally double-dialing a contact.

Retries / dead-letter queues (Q38/39): yes, you need a DLQ. BullMQ supports this natively ( failed events + a separate DLQ queue you push to after N attempts). Use exponential backoff (e.g. 3 attempts, 30s/2m/10m) for transient Vomyra errors (5xx, timeouts, rate-limit 429), and do not retry on validation errors (4xx other than 429) — surface those to the campaign as failed immediately and move to DLQ for manual review.

## J. Webhook / Event Architecture

The public Vomyra reference does not list a Webhooks section — only Catalog, Assistants, Calls, Numbers, Tools. You must confirm this explicitly with Vomyra before you build Phase 4 (see section P). Design for both outcomes now so you don't have to re-architect later:

## If webhooks exist:

Vomyra -> POST https://yourapp.com/webhooks/vomyra 1. verify signature/shared secret (ask Vomyra for their signing scheme) 2. look up local call by provider_resource_id 3. idempotency check: has this event id (or event hash) been processed before? -> insert into a `webhook_events` table with a unique constraint on event id -> if already present, ack and skip (200 OK, no reprocessing) 4. update call status/fields 5. update campaign_contacts + usage_events + credit_ledger in the same transaction

6. always return 200 quickly; do heavy work async if needed

Add a webhook_events(id, provider, event_id unique, payload jsonb, processed_at) table specifically to make step 3

idempotent — webhook delivery is commonly at-least-once, so duplicate deliveries must be a no-op.

If no webhooks exist (current best assumption): poll. Your call-sync worker re-checks GET /v1/calls/{id} for every call in a non-terminal state on a short interval (e.g. every 5–10s for the first 2 minutes after dial, then back off to 30–60s), stopping once active: false and a terminal status is observed. This is more expensive on your side (extra Vomyra API calls count against your 600/min

budget) but functionally equivalent from the customer's point of view, just with slightly higher latency on status updates.

## K. Usage / Billing / Credits

## Reserve-then-settle, answering your Q26/Q27/Q30 directly:

- 1. Before dispatch, estimate a worst-case cost for the call (e.g. a configurable max-call-duration cap × per-minute rate) and insert a 0 for the workspace. If the check fails, the call is never dispatched — campaign_contacts.status='failed' with reason credit_ledger row of type='reservation' for -estimated_cost , inside a transaction that also checks SUM(amount) >= insufficient_credits .


- 2. On call completion, insert type='reservation_release' for +estimated_cost (undo the hold) and type='charge' for - actual_cost in the same transaction, computed from the real duration_seconds from Vomyra.

- 3. This directly answers Q27 ("prevent a user with insufficient credits from launching a large campaign"): don't gate at campaign- launch time (balance could be spent by the time each call actually dials) — gate per-call, at dispatch time, right before you enqueue the Vomyra request. A campaign with 500 contacts and enough credit for 50 calls will simply stop dispatching new calls once the balance hits zero, and remaining campaign_contacts stay pending with a visible "insufficient credits" reason in your UI.

- 4. Race-condition safety (Q30): perform the balance check and the reservation insert inside a single Postgres transaction using SELECT ... FOR UPDATE on a per-workspace advisory lock (or select sum(amount) from credit_ledger where workspace_id = \$1 for update ), so two concurrent dispatch workers can't both pass the check against a stale balance.

- 5. Provider cost vs customer price reconciliation (Q28): store both provider_cost and customer_cost on every usage_events row from day one, even before you know Vomyra's exact pricing — this gives you a running per-tenant margin report for free, and once you get a Vomyra invoice you can reconcile SUM(provider_cost) against the actual bill to catch any drift in your assumed per-minute provider rate.

## L. Provider Adapter Layer

Your instinct here is exactly right and worth locking in as a hard rule, not just a "nice to have":

services/voice/

index.ts

types.ts

providers/

vomyra/

assistants.ts

calls.ts

numbers.ts

tools.ts

client.ts

interface VoiceProvider { createAssistant(input: CreateAssistantInput): Promise<ProviderAssistant>; updateAssistant(id: string, input: UpdateAssistantInput): Promise<ProviderAssistant>; initiateCall(input: InitiateCallInput): Promise<ProviderCall>; getCall(id: string): Promise<ProviderCall>; listNumbers(): Promise<ProviderNumber[]>; assignNumber(numberId: string, assistantId: string): Promise<void>; // ...

}

Application/domain code (route handlers, workers) only ever imports VoiceProvider and never providers/vomyra/* directly. This is what makes Q35 ("how do I migrate away from Vomyra later") tractable: swapping providers means writing a new providers/ <newvendor>/* implementation of the same interface and changing one wiring line — zero changes to routes, workers, billing, or the database schema, since provider is already a column, not a hardcoded assumption.

// exports the active provider implementation

// VoiceProvider interface — the only contract app code depends on

// low-level HTTP client, auth header, rate limiter

## M. Security

- Never trust client-supplied user_id / workspace_id — derive from verified JWT + membership lookup on every request, as in

- section E. • Vomyra API key lives only in your backend's secret store (environment variable / secrets manager), never shipped to the frontend, never logged in plaintext (redact in application logs and audit_logs.metadata ).

- Rate-limit your own public API per workspace, independent of Vomyra's key-wide limit, so one tenant can't degrade your API for others even before reaching Vomyra.

- CORS: lock your backend's CORS policy to your own frontend origin(s) only.


- Soft delete + deleted_at is null in every RLS policy and query so archived resources never leak into another tenant's view and historical calls never 404 unexpectedly.

- PII in transcripts/recordings: recording_url and transcript may contain sensitive customer data. Scope access to these fields to owner / admin roles only if you want tighter control than plain workspace membership, and consider a signed, time-limited URL layer in front of recording_url rather than exposing Vomyra's raw URL to the frontend (this also lets you migrate storage later without breaking old links).

## N. Admin Architecture (Q45/Q46)

Build a separate internal admin app (or a role-gated /admin section of your backend, never exposed to customer JWTs) that:

- Authenticates via a distinct admin identity (your team only — don't reuse workspace_members ).

- Can query across workspaces (bypassing normal RLS via service-role, with every access written to audit_logs with actor_type='admin' ).

- Surfaces: per-workspace usage/credit balance, failed jobs, reconciliation drift, raw Vomyra resource state next to your mapped state (for support debugging), and a manual "force resync" action per resource.

- This is also where you'd handle the Vomyra dashboard itself — your ops team uses the Vomyra dashboard as the low-level provider console, and your admin app as the tenant-aware support console. Customers see neither.

## O. Failure / Retry / Reconciliation

Reconciliation job (confirms and extends your own proposal) — schedule every 15–30 minutes:

```
for resource_type in [assistants, calls, numbers, tools]:
fetch all pages from GET /v1/{resource_type}
for each provider record:
if no local row has this provider_resource_id -> flag as "orphan_provider_resource"
(created directly in Vomyra dashboard, or a create call that Vomyra accepted
but your write to Supabase failed after the fact)
for each local row with status='active' and no matching provider record:
-> flag as "missing_provider_resource" (deleted directly in Vomyra dashboard)
-> mark local row status='provider_missing', alert admin
for calls specifically: also diff status/duration against local (catches missed
webhook deliveries or a gap in the polling loop)
```

Store findings in a reconciliation_issues table ( type , provider , provider_resource_id , local_id nullable ,

detected_at , resolved_at ) surfaced in the admin app — don't auto-resolve destructively (e.g. don't auto-delete "orphan" resources); flag for human review first, since your understanding of what's orphaned may itself be wrong if a create call succeeded on Vomyra's side but your DB write hadn't committed yet.

Provider outage handling (Q37): wrap all Vomyra calls with a circuit breaker (e.g. open the breaker after N consecutive 5xx/timeout responses, short-circuit new dispatches for a cooldown window, keep queueing rather than dropping jobs). Campaigns should show status paused: provider_unavailable rather than silently failing contacts during an outage.

## P. Questions & Blockers to Confirm With Vomyra Before Building Further

Based on the public docs, these are unresolved and materially affect your build order:

- 1. Webhooks — do they exist at all? (Not listed in the public API reference navigation.) If yes: payload shape, signing/auth scheme, retry/redelivery behavior, and which events are covered (call started, call ended, transcript ready, recording ready).

- 2. Assistant/number/tool deletion — is there a DELETE endpoint not shown in the public reference, or is deletion dashboard-only? This directly determines whether your "archive, never delete" strategy is a design choice or a hard requirement.

- 3. Sub-accounts / tenants / separate keys — ask explicitly and get it in writing, since this changes your entire tenancy model if it exists in a private/enterprise tier not shown in public docs.


- 4. Per-call and per-minute pricing, and whether Vomyra's own usage/billing is itself scoped per API key (aggregate) or exposes any per-call cost figure in the Get Call / List Calls response you haven't seen documented.

- 5. Rate limit behavior under bulk campaigns — is 600 req/min per key a hard cap with 429s, and is there a way to request a higher limit for legitimate bulk-calling white-label use cases like yours?

- 6. Idempotency support on POST /v1/calls — does Vomyra accept an Idempotency-Key header itself? If yes, pass your own idempotency key through to them as a second layer of protection beyond your local unique constraint.

- 7. additional_data field on calls — what can it contain, and can you write custom metadata (e.g. your internal campaign_contact_id ) into it at call-creation time? If so, this becomes a second, provider-side way to correlate calls back to your tenants/campaigns, which is valuable belt-and-braces alongside your own mapping table.

- 8. Domain-restricted keys — the docs mention Origin/Referer restrictions on keys; confirm this doesn't interfere with server-to-server calls from your backend (it shouldn't, since there's no browser Origin, but worth confirming explicitly).

Scenario where the architecture would NOT work: if Vomyra turns out to have a hard, non-configurable global rate limit that's too low for your combined multi-tenant call volume, and they refuse to raise it or offer additional keys — that's the one failure mode this whole design can't route around, since a single key is your only integration point. Everything else (no webhooks, no sub-accounts, no delete endpoint) has a workable mitigation above.

## Q. Implementation Phases

Your proposed order is good; one adjustment — move a minimal reconciliation check into Phase 1 (not Phase 6), because assistant creation is exactly where "Vomyra accepted the request but our DB write failed" first becomes possible, and you want the idempotent- insert pattern proven before you build campaigns on top of it.

Phase 1 — Foundation Supabase Auth, workspaces/members/roles, RLS policies, assistant CRUD through the provider adapter, idempotent create pattern, audit logging skeleton.

Phase 2 — Single calls Contacts, manual single-call initiation, call detail sync (poll), credit reservation/charge on a single call (proves the billing primitive before campaigns multiply it).

Phase 3 — Campaigns & workers Redis/BullMQ, call-dispatch + call-sync queues, per-workspace concurrency limits, campaign state machine (pause/resume/cancel), DLQ.

Phase 4 — Webhooks/events & analytics Confirm webhook support with Vomyra first; implement whichever of webhook-consumer or polling-loop is correct; campaign-level analytics dashboards.

Phase 5 — Credits & billing Full ledger, top-ups, invoicing/export, per-tenant margin reporting (provider cost vs customer cost).

Phase 6 — Admin, reconciliation, observability Cross-tenant admin console, scheduled reconciliation job, circuit breaker on the provider adapter, metrics/logging (see below).

Minimum observability to add starting Phase 3, not deferred to Phase 6: structured logs on every provider call (latency, status code, workspace_id), a dashboard of queue depth/failure rate per queue, and an alert on reconciliation drift count > 0.

This review is based on the publicly documented Vomyra API reference as of August 2026. Confirm the open items in Section P directly with Vomyra before finalizing Phases 3–4, since webhook availability and sub-account support materially change the campaign and event-sync design.
