-- Legacy Gym — Legacy Points, member profiles, cardio + member-vs-member challenges

create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  age int,
  photo_url text not null default '',
  member_type text not null default '',
  created_at timestamptz default now());
alter table public.member_profiles enable row level security;
create policy "mp read" on public.member_profiles for select using (auth.role() = 'authenticated');
create policy "mp insert" on public.member_profiles for insert with check (auth.uid() = user_id);
create policy "mp update" on public.member_profiles for update using (auth.uid() = user_id);

create table if not exists public.points_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  ref text not null,
  points int not null default 1 check (points between 1 and 5),
  created_at timestamptz default now(),
  unique (user_id, kind, ref));
alter table public.points_events enable row level security;
create policy "pe read" on public.points_events for select using (auth.role() = 'authenticated');
create policy "pe insert" on public.points_events for insert with check (auth.uid() = user_id and kind in ('class','challenge','record'));
create policy "pe delete" on public.points_events for delete using (public.is_manager(auth.uid()));

create table if not exists public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  challenge_id text not null,
  value numeric not null check (value > 0),
  created_at timestamptz default now());
alter table public.challenge_entries enable row level security;
create policy "ce read" on public.challenge_entries for select using (auth.role() = 'authenticated');
create policy "ce insert" on public.challenge_entries for insert with check (auth.uid() = user_id);
create policy "ce delete" on public.challenge_entries for delete using (auth.uid() = user_id or public.is_staff(auth.uid()));

insert into storage.buckets (id, name, public) values ('member-photos','member-photos', true)
on conflict (id) do nothing;
create policy "mphoto up" on storage.objects for insert to authenticated
  with check (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "mphoto upd" on storage.objects for update to authenticated
  using (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "mphoto read" on storage.objects for select using (bucket_id = 'member-photos');
