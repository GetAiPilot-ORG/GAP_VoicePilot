-- Supabase Trigger to automatically create a profile and default workspace on user signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_workspace_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');

  -- 2. Create Default Workspace
  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'name', 'My') || '''s Workspace', new.id)
  returning id into default_workspace_id;

  -- 3. Add user as Owner to the Workspace
  insert into public.workspace_members (workspace_id, user_id, role)
  values (default_workspace_id, new.id, 'owner');

  return new;
end;
$$;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
