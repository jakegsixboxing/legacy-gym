-- Legacy Gym — Road to Xmas Challenge section (Training Log · Check-Ins · Leaderboard · Overview)
-- Spec: HANDOVER_road_to_xmas.md + legacy_rtc_app_spec.xlsx (Ali, Oct 2026)
-- Registration flag already exists: public.challenge_regs where challenge = 'rtc2026'.
-- Points are NOT a new system: the Leaderboard is a filtered read of public.points_events.

-- ---------- Mon–Thu lift sessions ----------
create table if not exists public.rtc_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge text not null default 'rtc2026',
  week int not null check (week between 1 and 10),
  day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday')),
  main_lift text not null default '',
  main_sets jsonb not null default '[]'::jsonb,        -- [{"reps":"8","weight":"60"}, ...]
  secondary_lift text not null default '',
  secondary_sets jsonb not null default '[]'::jsonb,
  comments text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, challenge, week, day)
);
alter table public.rtc_sessions enable row level security;
drop policy if exists "rtcs read" on public.rtc_sessions;
drop policy if exists "rtcs insert" on public.rtc_sessions;
drop policy if exists "rtcs update" on public.rtc_sessions;
drop policy if exists "rtcs delete" on public.rtc_sessions;
create policy "rtcs read"   on public.rtc_sessions for select using (auth.uid() = user_id or public.is_coach(auth.uid()) or public.is_staff(auth.uid()));
create policy "rtcs insert" on public.rtc_sessions for insert with check (auth.uid() = user_id);
create policy "rtcs update" on public.rtc_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rtcs delete" on public.rtc_sessions for delete using (auth.uid() = user_id);

-- ---------- Saturday Games Day (individual only — no team fields by design) ----------
create table if not exists public.rtc_saturday (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge text not null default 'rtc2026',
  week int not null check (week between 1 and 10),
  stations jsonb not null default '[]'::jsonb,         -- [{"name":"Run","type":"TimeDistance","time":"12:30","distance":"2000"}, ...]
  comments text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, challenge, week)
);
alter table public.rtc_saturday enable row level security;
drop policy if exists "rtcsat read" on public.rtc_saturday;
drop policy if exists "rtcsat insert" on public.rtc_saturday;
drop policy if exists "rtcsat update" on public.rtc_saturday;
drop policy if exists "rtcsat delete" on public.rtc_saturday;
create policy "rtcsat read"   on public.rtc_saturday for select using (auth.uid() = user_id or public.is_coach(auth.uid()) or public.is_staff(auth.uid()));
create policy "rtcsat insert" on public.rtc_saturday for insert with check (auth.uid() = user_id);
create policy "rtcsat update" on public.rtc_saturday for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rtcsat delete" on public.rtc_saturday for delete using (auth.uid() = user_id);

-- ---------- Weekly check-ins ----------
create table if not exists public.rtc_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge text not null default 'rtc2026',
  logged_at timestamptz not null default now(),       -- stamped on submit, never member-entered
  bodyweight numeric,
  waist numeric,
  hips numeric,
  chest numeric,
  photo_front text not null default '',               -- storage object paths in bucket rtc-photos
  photo_side text not null default '',
  photo_back text not null default '',
  notes text not null default ''
);
alter table public.rtc_checkins enable row level security;
drop policy if exists "rtcci read" on public.rtc_checkins;
drop policy if exists "rtcci insert" on public.rtc_checkins;
drop policy if exists "rtcci update" on public.rtc_checkins;
drop policy if exists "rtcci delete" on public.rtc_checkins;
create policy "rtcci read"   on public.rtc_checkins for select using (auth.uid() = user_id or public.is_coach(auth.uid()) or public.is_staff(auth.uid()));
create policy "rtcci insert" on public.rtc_checkins for insert with check (auth.uid() = user_id);
create policy "rtcci update" on public.rtc_checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rtcci delete" on public.rtc_checkins for delete using (auth.uid() = user_id);

-- ---------- Coach View audit (nice-to-have from the handover) ----------
create table if not exists public.rtc_coach_views (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  viewed_user_id uuid not null references auth.users(id) on delete cascade,
  tab text not null default '',
  viewed_at timestamptz not null default now()
);
alter table public.rtc_coach_views enable row level security;
drop policy if exists "rtccv insert" on public.rtc_coach_views;
drop policy if exists "rtccv read" on public.rtc_coach_views;
create policy "rtccv insert" on public.rtc_coach_views for insert with check (auth.uid() = coach_id and (public.is_coach(auth.uid()) or public.is_staff(auth.uid())));
create policy "rtccv read"   on public.rtc_coach_views for select using (public.is_staff(auth.uid()));

-- ---------- Registrant list for the Leaderboard (ids only; challenge_regs itself stays self/Jake/Alison-only) ----------
create or replace function public.rtc_registrants(c text default 'rtc2026')
returns table (user_id uuid, created_at timestamptz)
language sql security definer set search_path = public as $$
  select user_id, created_at from public.challenge_regs where challenge = c
$$;
revoke all on function public.rtc_registrants(text) from public;
grant execute on function public.rtc_registrants(text) to authenticated;

-- ---------- Progress photos: private bucket, own folder; coaches/staff can view ----------
insert into storage.buckets (id, name, public) values ('rtc-photos','rtc-photos', false)
on conflict (id) do nothing;
drop policy if exists "rtcphoto up" on storage.objects;
drop policy if exists "rtcphoto upd" on storage.objects;
drop policy if exists "rtcphoto del" on storage.objects;
drop policy if exists "rtcphoto read" on storage.objects;
create policy "rtcphoto up" on storage.objects for insert to authenticated
  with check (bucket_id = 'rtc-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rtcphoto upd" on storage.objects for update to authenticated
  using (bucket_id = 'rtc-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rtcphoto del" on storage.objects for delete to authenticated
  using (bucket_id = 'rtc-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rtcphoto read" on storage.objects for select to authenticated
  using (bucket_id = 'rtc-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_coach(auth.uid()) or public.is_staff(auth.uid())));
