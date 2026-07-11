-- Legacy Gym — Staff Room backend (staff-only, RLS enforced)
alter table public.profiles add column if not exists is_staff boolean not null default false;
alter table public.profiles add column if not exists is_manager boolean not null default false;

create or replace function public.is_staff(uid uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_staff from public.profiles where id = uid), false) $$;

create or replace function public.is_manager(uid uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_manager from public.profiles where id = uid), false) $$;

-- Staff can see each other's profile rows (needed for the per-person tabs)
create policy "staff read staff profiles" on public.profiles
  for select using (public.is_staff(auth.uid()) and is_staff);

-- Staff chat
create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now());
alter table public.staff_messages enable row level security;
create policy "sm read" on public.staff_messages for select using (public.is_staff(auth.uid()));
create policy "sm insert" on public.staff_messages for insert with check (auth.uid() = user_id and public.is_staff(auth.uid()));
alter publication supabase_realtime add table public.staff_messages;

-- Daily tasks / workloads
create table if not exists public.staff_tasks (
  id uuid primary key default gen_random_uuid(),
  assignee_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  task_date date not null default current_date,
  status text not null default 'open' check (status in ('open','done','no_time')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  done_at timestamptz);
alter table public.staff_tasks enable row level security;
create policy "tk read" on public.staff_tasks for select using (public.is_staff(auth.uid()));
create policy "tk insert" on public.staff_tasks for insert with check (public.is_staff(auth.uid()) and created_by = auth.uid() and (assignee_id = auth.uid() or public.is_manager(auth.uid())));
create policy "tk update" on public.staff_tasks for update using (assignee_id = auth.uid() or public.is_manager(auth.uid()));
create policy "tk delete" on public.staff_tasks for delete using (created_by = auth.uid() or public.is_manager(auth.uid()));

-- PT commission log (private: trainer + managers only)
create table if not exists public.pt_commissions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  minutes int not null default 45,
  commission numeric not null default 0,
  note text not null default '',
  session_date date not null default current_date,
  created_at timestamptz default now());
alter table public.pt_commissions enable row level security;
create policy "pc read" on public.pt_commissions for select using (trainer_id = auth.uid() or public.is_manager(auth.uid()));
create policy "pc insert" on public.pt_commissions for insert with check (trainer_id = auth.uid() and public.is_staff(auth.uid()));
create policy "pc delete" on public.pt_commissions for delete using (trainer_id = auth.uid() or public.is_manager(auth.uid()));

-- Pre-approval: grant access by email even before they sign up
create table if not exists public.staff_invites (
  email text primary key,
  make_manager boolean not null default false,
  created_at timestamptz default now());
alter table public.staff_invites enable row level security;
create policy "si read" on public.staff_invites for select using (public.is_manager(auth.uid()));

-- Managers can grant/revoke staff access from inside the app (pre-approves unknown emails)
create or replace function public.grant_staff(target_email text, make_staff boolean, make_manager boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager(auth.uid()) then return 'Only managers can change staff access.'; end if;
  if make_staff then
    insert into public.staff_invites (email, make_manager) values (lower(target_email), make_manager)
      on conflict (email) do update set make_manager = excluded.make_manager;
  else
    delete from public.staff_invites where email = lower(target_email);
  end if;
  update public.profiles set is_staff = make_staff, is_manager = make_manager where lower(email) = lower(target_email);
  if not found and make_staff then return 'Pre-approved: ' || target_email || ' gets staff access the moment they sign up.'; end if;
  return 'Access updated for ' || target_email;
end $$;

-- Auto-apply invites at signup
create or replace function public.apply_staff_invite() returns trigger
language plpgsql security definer set search_path = public as $$
declare inv record;
begin
  select * into inv from public.staff_invites where email = lower(new.email);
  if found then new.is_staff := true; new.is_manager := inv.make_manager; end if;
  return new;
end $$;
drop trigger if exists trg_apply_staff_invite on public.profiles;
create trigger trg_apply_staff_invite before insert on public.profiles
  for each row execute function public.apply_staff_invite();

-- The owner is staff + manager
update public.profiles set is_staff = true, is_manager = true where email = 'jakegsixboxing@gmail.com';

-- Sarsha keeps her Gmail account only; iCloud duplicate demoted to regular member
update public.profiles set is_staff = false, is_manager = false where email = 'sarsha03@icloud.com';
