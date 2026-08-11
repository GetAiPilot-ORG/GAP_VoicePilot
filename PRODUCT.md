# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Repo-inferred: operations teams, founders, sales/support managers, and workspace admins who configure AI voice assistants, assign numbers, launch outbound campaigns, and review call activity in a browser dashboard.

## Product Purpose

GAP VoicePilot is a multi-tenant AI voice calling platform for creating assistants, routing phone numbers, dispatching campaigns, testing calls, and monitoring execution through Vomyra-backed voice infrastructure.

## Positioning

Repo-inferred: VoicePilot owns the customer-facing workspace, tenancy, campaigns, billing, and operational visibility while treating Vomyra as the execution provider for assistants, calls, numbers, and call artifacts.

## Operating Context

Users work inside an authenticated dashboard with assistants, phone numbers, campaigns, call logs, analytics, billing, settings, and admin KYC areas. The analytics surface must help users scan call volume, completion, latency, duration, and recent call outcomes quickly.

## Capabilities and Constraints

Confirmed by code: Supabase Auth and workspace membership gate data access; Vomyra API calls are filtered back to the user's workspace assistants; calls expose duration, status, assistant metadata, timestamps, and optional customer number fields; the web app uses Next.js App Router, React, Tailwind CSS, lucide-react, and Supabase server clients.

Open decisions: exact production analytics definitions, provider cost metrics, webhook availability, and long-term reconciliation behavior depend on Vomyra and backend implementation details.

## Brand Commitments

Confirmed by code: product name is GAP VoicePilot / VoicePilot; existing assets include `apps/web/public/logo.png`; dashboard language uses "assistants", "campaigns", "calls", "phone numbers", "AI mins", and "GAP Engine".

## Evidence on Hand

Available evidence includes the current dashboard implementation, Vomyra integration notes in `Vomyra_Voice_SaaS_Architecture_Review.md`, assistant and campaign workflows in `apps/web/app/dashboard`, and the root `DESIGN.md` visual record.

## Product Principles

Keep tenant-owned data and provider execution clearly separated.
Make operational state visible instead of hiding it behind marketing language.
Favor fast scanning and direct action inside dashboard surfaces.
Do not fabricate commercial claims, customer proof, or provider capabilities that are not present in code or supplied docs.
