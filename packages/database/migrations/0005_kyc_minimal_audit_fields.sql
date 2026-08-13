-- Minimal verification audit fields --------------------------------
-- Keep provider receipts and timestamps for fraud investigation without
-- retaining full Aadhaar JSON, address, DOB, phone, email, or XML payloads.
alter table kyc_requests
  add column if not exists pan_verified_at timestamptz,
  add column if not exists digilocker_verified_at timestamptz,
  add column if not exists digilocker_verified_name text,
  add column if not exists digilocker_callback_scope text,
  add column if not exists digilocker_trace_id text;

create index if not exists kyc_requests_digilocker_trace_id_idx
on kyc_requests (digilocker_trace_id)
where digilocker_trace_id is not null;

comment on column kyc_requests.pan_verified_at is
  'Timestamp when Setu PAN verification succeeded.';

comment on column kyc_requests.digilocker_verified_at is
  'Timestamp when Setu DigiLocker Aadhaar verification succeeded.';

comment on column kyc_requests.digilocker_verified_name is
  'Minimal Aadhaar-returned name retained for manual KYC review; do not store full Aadhaar payload.';

comment on column kyc_requests.digilocker_callback_scope is
  'Documents consented in Setu callback, e.g. ADHAR. Do not store document contents.';

comment on column kyc_requests.digilocker_trace_id is
  'Setu trace id for support/fraud investigation with provider.';
