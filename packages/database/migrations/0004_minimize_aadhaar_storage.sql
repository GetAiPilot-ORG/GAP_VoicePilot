-- Minimize retained Aadhaar/DigiLocker personal data ----------------
-- The app only needs proof that DigiLocker Aadhaar verification succeeded.
-- Do not retain full Aadhaar JSON, address, DOB, phone/email details, or XML payloads.
update kyc_requests
set
  aadhaar_data = null,
  digilocker_user_details = null
where aadhaar_data is not null
   or digilocker_user_details is not null;

comment on column kyc_requests.aadhaar_data is
  'Deprecated. Do not store full Aadhaar JSON; retain only verification status fields.';

comment on column kyc_requests.digilocker_user_details is
  'Deprecated. Do not store DigiLocker user PII; retain only verification status fields.';
