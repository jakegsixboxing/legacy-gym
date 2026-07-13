-- Legacy Gym — Wednesday Night Sparring signups + matchups
create table if not exists public.spar_signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  weight numeric not null check (weight > 0),
  division text not null default 'Sparring Club',
  week_date date not null,
  created_at timestamptz default now(),
  unique (user_id, week_date));
alter table public.spar_signups enable row level security;
create policy "sw read" on public.spar_signups for select using (auth.role() = 'authenticated');
create policy "sw insert" on public.spar_signups for insert with check (auth.uid() = user_id);
create policy "sw delete" on public.spar_signups for delete using (auth.uid() = user_id or public.is_staff(auth.uid()));

create table if not exists public.spar_matchups (
  id uuid primary key default gen_random_uuid(),
  week_date date not null,
  a_user uuid not null,
  a_name text not null default '',
  b_user uuid not null,
  b_name text not null default '',
  rounds int not null default 3 check (rounds between 1 and 12),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now());
alter table public.spar_matchups enable row level security;
create policy "sm read" on public.spar_matchups for select using (auth.role() = 'authenticated');
create policy "sm insert" on public.spar_matchups for insert with check (public.is_coach(auth.uid()) or public.is_staff(auth.uid()));
create policy "sm delete" on public.spar_matchups for delete using (public.is_coach(auth.uid()) or public.is_staff(auth.uid()));
