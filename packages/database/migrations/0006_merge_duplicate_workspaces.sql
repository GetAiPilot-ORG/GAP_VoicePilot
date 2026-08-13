-- Consolidate duplicate owner workspaces and enforce one owned workspace per user.
-- The oldest workspace is canonical; tenant resources are moved there transactionally.

lock table public.workspaces in share row exclusive mode;

create temporary table workspace_merge_map on commit drop as
select id as duplicate_id, canonical_id
from (
  select
    id,
    first_value(id) over (
      partition by owner_id
      order by created_at asc nulls last, id asc
    ) as canonical_id
  from public.workspaces
) ranked
where id <> canonical_id;

-- Some deployed schemas retain a legacy cached balance on workspaces. Preserve
-- the total if that column exists; ledger rows are merged separately below.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workspaces'
      and column_name = 'balance'
  ) then
    execute $sql$
      update public.workspaces canonical
      set balance = totals.balance
      from (
        select grouped.canonical_id, sum(coalesce(workspace.balance, 0)) as balance
        from (
          select canonical_id, canonical_id as workspace_id from workspace_merge_map
          union
          select canonical_id, duplicate_id as workspace_id from workspace_merge_map
        ) grouped
        join public.workspaces workspace
          on workspace.id = grouped.workspace_id
        group by grouped.canonical_id
      ) totals
      where canonical.id = totals.canonical_id
    $sql$;
  end if;
end;
$$;

-- Only one pending KYC request can survive after workspaces are combined.
with ranked_pending as (
  select
    kr.id,
    row_number() over (
      partition by w.owner_id
      order by
        case when kr.pan_verified and kr.digilocker_verified then 0 else 1 end,
        kr.created_at desc,
        kr.id desc
    ) as position
  from public.kyc_requests kr
  join public.workspaces w on w.id = kr.workspace_id
  where kr.status = 'pending'
)
update public.kyc_requests kr
set status = 'rejected', updated_at = now()
from ranked_pending rp
where kr.id = rp.id
  and rp.position > 1;

-- Keep the most relevant subscription for the merged workspace.
with ranked_subscriptions as (
  select
    ws.id,
    row_number() over (
      partition by w.owner_id
      order by
        case when ws.status in ('active', 'trialing') then 0 else 1 end,
        ws.updated_at desc nulls last,
        ws.created_at desc nulls last,
        ws.id
    ) as position
  from public.workspace_subscriptions ws
  join public.workspaces w on w.id = ws.workspace_id
)
delete from public.workspace_subscriptions ws
using ranked_subscriptions ranked
where ws.id = ranked.id
  and ranked.position > 1;

-- Keep the newest feature override for each owner/feature pair.
with ranked_features as (
  select
    feature.id,
    row_number() over (
      partition by w.owner_id, feature.feature_key
      order by feature.created_at desc nulls last, feature.id
    ) as position
  from public.workspace_feature_overrides feature
  join public.workspaces w on w.id = feature.workspace_id
)
delete from public.workspace_feature_overrides feature
using ranked_features ranked
where feature.id = ranked.id
  and ranked.position > 1;

-- Preserve every member and the strongest role when memberships overlap.
insert into public.workspace_members (workspace_id, user_id, role, created_at)
select
  map.canonical_id,
  member.user_id,
  case max(case member.role when 'owner' then 3 when 'admin' then 2 else 1 end)
    when 3 then 'owner'
    when 2 then 'admin'
    else 'agent'
  end,
  min(member.created_at)
from public.workspace_members member
join workspace_merge_map map on map.duplicate_id = member.workspace_id
group by map.canonical_id, member.user_id
on conflict (workspace_id, user_id) do update
set role = case
  when public.workspace_members.role = 'owner' or excluded.role = 'owner' then 'owner'
  when public.workspace_members.role = 'admin' or excluded.role = 'admin' then 'admin'
  else 'agent'
end;

delete from public.workspace_members member
using workspace_merge_map map
where member.workspace_id = map.duplicate_id;

-- White-label settings are logically one-per-workspace even though older schemas
-- did not enforce it. Keep the newest row before moving it.
with ranked_settings as (
  select
    settings.id,
    row_number() over (
      partition by w.owner_id
      order by settings.created_at desc nulls last, settings.id
    ) as position
  from public.white_label_settings settings
  join public.workspaces w on w.id = settings.workspace_id
)
delete from public.white_label_settings settings
using ranked_settings ranked
where settings.id = ranked.id
  and ranked.position > 1;

-- Move all tenant-owned records. Primary/resource IDs remain unchanged.
update public.assistants tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.phone_numbers tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.tools tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.contacts tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.campaigns tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.calls tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.credit_ledger tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.usage_events tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.kyc_requests tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.workspace_subscriptions tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.workspace_feature_overrides tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

update public.white_label_settings tenant_row set workspace_id = map.canonical_id
from workspace_merge_map map where tenant_row.workspace_id = map.duplicate_id;

delete from public.workspaces workspace
using workspace_merge_map map
where workspace.id = map.duplicate_id;

create unique index if not exists workspaces_one_per_owner_idx
  on public.workspaces (owner_id);

do $$
begin
  if exists (
    select owner_id
    from public.workspaces
    group by owner_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate owned workspaces remain after consolidation';
  end if;
end;
$$;

-- Signup provisioning is now idempotent under retries and concurrent requests.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_workspace_id uuid;
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(public.profiles.name, excluded.name);

  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'name', 'My') || '''s Workspace', new.id)
  on conflict (owner_id) do update set owner_id = excluded.owner_id
  returning id into default_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (default_workspace_id, new.id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';

  return new;
end;
$$;
