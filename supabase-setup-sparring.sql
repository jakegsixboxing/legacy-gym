-- Legacy Gym — Sparring Club backend
-- Coach role
alter table public.profiles add column if not exists is_coach boolean not null default false;

create or replace function public.is_coach(uid uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_coach from public.profiles where id = uid), false) $$;

-- Boxer profiles
create table if not exists public.boxer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age int, current_weight numeric, fight_weight numeric,
  wins int not null default 0, losses int not null default 0, draws int not null default 0,
  photo_url text, updated_at timestamptz default now());
alter table public.boxer_profiles enable row level security;
create policy "bp read" on public.boxer_profiles for select using (auth.role() = 'authenticated');
create policy "bp insert" on public.boxer_profiles for insert with check (auth.uid() = user_id);
create policy "bp update" on public.boxer_profiles for update using (auth.uid() = user_id);

-- Sparring round log
create table if not exists public.sparring_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rounds int not null, minutes_per_round numeric not null,
  partner text not null default '', note text not null default '',
  session_date date not null default current_date,
  created_at timestamptz default now());
alter table public.sparring_sessions enable row level security;
create policy "ss read" on public.sparring_sessions for select using (auth.uid() = user_id or public.is_coach(auth.uid()));
create policy "ss insert" on public.sparring_sessions for insert with check (auth.uid() = user_id);
create policy "ss delete" on public.sparring_sessions for delete using (auth.uid() = user_id);

-- Notes threads (member <-> coach)
create table if not exists public.sparring_notes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '', is_coach_reply boolean not null default false,
  body text not null, created_at timestamptz default now());
alter table public.sparring_notes enable row level security;
create policy "sn read" on public.sparring_notes for select using (auth.uid() = member_id or public.is_coach(auth.uid()));
create policy "sn insert" on public.sparring_notes for insert with check (auth.uid() = author_id and (auth.uid() = member_id or public.is_coach(auth.uid())));

-- Fight nights + nominations
create table if not exists public.fight_nights (
  id uuid primary key default gen_random_uuid(),
  title text not null, event_date date, location text default '', details text default '',
  created_at timestamptz default now());
alter table public.fight_nights enable row level security;
create policy "fn read" on public.fight_nights for select using (auth.role() = 'authenticated');
create policy "fn insert" on public.fight_nights for insert with check (public.is_coach(auth.uid()));
create policy "fn delete" on public.fight_nights for delete using (public.is_coach(auth.uid()));

create table if not exists public.fight_nominations (
  id uuid primary key default gen_random_uuid(),
  fight_id uuid not null references public.fight_nights(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '', created_at timestamptz default now(),
  unique (fight_id, user_id));
alter table public.fight_nominations enable row level security;
create policy "nom read" on public.fight_nominations for select using (auth.uid() = user_id or public.is_coach(auth.uid()));
create policy "nom insert" on public.fight_nominations for insert with check (auth.uid() = user_id);
create policy "nom delete" on public.fight_nominations for delete using (auth.uid() = user_id);

-- Photo storage
insert into storage.buckets (id, name, public) values ('boxer-photos','boxer-photos', true) on conflict (id) do nothing;
create policy "photos read" on storage.objects for select using (bucket_id = 'boxer-photos');
create policy "photos insert" on storage.objects for insert with check (bucket_id = 'boxer-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "photos update" on storage.objects for update using (bucket_id = 'boxer-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Flag the owner as coach
update public.profiles set is_coach = true where email = 'jakegsixboxing@gmail.com';
