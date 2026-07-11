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

-- Managers can grant/revoke staff access from inside the app
create or replace function public.grant_staff(target_email text, make_staff boolean, make_manager boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager(auth.uid()) then return 'Only managers can change staff access.'; end if;
  update public.profiles set is_staff = make_staff, is_manager = make_manager where lower(email) = lower(target_email);
  if not found then return 'No member profile found with that email.'; end if;
  return 'Access updated for ' || target_email;
end $$;

-- The owner is staff + manager
update public.profiles set is_staff = true, is_manager = true where email = 'jakegsixboxing@gmail.com';
