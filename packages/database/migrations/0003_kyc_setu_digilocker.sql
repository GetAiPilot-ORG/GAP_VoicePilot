-- KYC requests for PAN + DigiLocker verification ------------------
create table if not exists kyc_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  business_name text not null,
  use_case text not null default 'Phone number provisioning',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verification_method text,
  verified_pan_name text,
  pan_verified boolean not null default false,
  pan_number_last4 text check (pan_number_last4 is null or pan_number_last4 ~ '^[A-Z0-9]{4}$'),
  digilocker_request_id text,
  digilocker_verified boolean not null default false,
  digilocker_status text,
  digilocker_user_details jsonb,
  aadhaar_data jsonb,
  assigned_number text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table already existed from an older schema, add the new columns
alter table kyc_requests
  add column if not exists use_case text not null default 'Phone number provisioning',
  add column if not exists pan_verified boolean not null default false,
  add column if not exists pan_number_last4 text,
  add column if not exists digilocker_status text,
  add column if not exists digilocker_user_details jsonb,
  add column if not exists aadhaar_data jsonb,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists kyc_requests_one_pending_per_workspace_idx
on kyc_requests (workspace_id)
where status = 'pending';

create index if not exists kyc_requests_workspace_created_at_idx
on kyc_requests (workspace_id, created_at desc);

create index if not exists kyc_requests_digilocker_request_id_idx
on kyc_requests (digilocker_request_id)
where digilocker_request_id is not null;

alter table kyc_requests enable row level security;

drop policy if exists "workspace members can read their kyc requests" on kyc_requests;
create policy "workspace members can read their kyc requests"
on kyc_requests for select
to authenticated
using (
  workspace_id in (
    select workspace_id
    from workspace_members
    where user_id = (select auth.uid())
  )
);

drop policy if exists "workspace admins can insert kyc requests" on kyc_requests;
create policy "workspace admins can insert kyc requests"
on kyc_requests for insert
to authenticated
with check (
  workspace_id in (
    select workspace_id
    from workspace_members
    where user_id = (select auth.uid())
      and role in ('owner', 'admin')
  )
);

drop policy if exists "workspace admins can update kyc requests" on kyc_requests;
create policy "workspace admins can update kyc requests"
on kyc_requests for update
to authenticated
using (
  workspace_id in (
    select workspace_id
    from workspace_members
    where user_id = (select auth.uid())
      and role in ('owner', 'admin')
  )
)
with check (
  workspace_id in (
    select workspace_id
    from workspace_members
    where user_id = (select auth.uid())
      and role in ('owner', 'admin')
  )
);

-- Keep updated_at current for admin review and callback updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_kyc_requests_updated_at on kyc_requests;
create trigger set_kyc_requests_updated_at
before update on kyc_requests
for each row execute function public.set_updated_at();

-- Atomic admin approval: approval and phone-number creation succeed or fail together.
create or replace function public.approve_kyc_and_assign_number(
  p_kyc_id uuid,
  p_workspace_id uuid,
  p_phone_number text,
  p_provider text default 'vomyra',
  p_provider_resource_id text default null
)
returns void
language plpgsql
as $$
declare
  v_provider_resource_id text;
begin
  if p_phone_number is null or length(trim(p_phone_number)) = 0 then
    raise exception 'Phone number is required';
  end if;

  if not exists (
    select 1
    from kyc_requests
    where id = p_kyc_id
      and workspace_id = p_workspace_id
      and status = 'pending'
  ) then
    raise exception 'Pending KYC request not found';
  end if;

  v_provider_resource_id := coalesce(
    nullif(trim(p_provider_resource_id), ''),
    'manual_' || regexp_replace(p_phone_number, '[^\d+]', '', 'g')
  );

  insert into phone_numbers (
    workspace_id,
    phone_number,
    provider,
    provider_resource_id,
    status
  )
  values (
    p_workspace_id,
    trim(p_phone_number),
    coalesce(nullif(trim(p_provider), ''), 'vomyra'),
    v_provider_resource_id,
    'unassigned'
  );

  update kyc_requests
  set
    status = 'approved',
    assigned_number = trim(p_phone_number),
    reviewed_at = now()
  where id = p_kyc_id
    and workspace_id = p_workspace_id;
end;
$$;

revoke all on function public.approve_kyc_and_assign_number(uuid, uuid, text, text, text) from public;
grant execute on function public.approve_kyc_and_assign_number(uuid, uuid, text, text, text) to service_role;
