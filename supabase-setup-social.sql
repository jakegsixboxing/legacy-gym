-- Legacy Gym — Social Events calendar
create table if not exists public.social_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  event_time text not null default '',
  location text not null default '',
  details text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now());
alter table public.social_events enable row level security;
create policy "se read" on public.social_events for select using (auth.role() = 'authenticated');
create policy "se insert" on public.social_events for insert with check (public.is_staff(auth.uid()));
create policy "se delete" on public.social_events for delete using (public.is_staff(auth.uid()));

create table if not exists public.social_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.social_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz default now(),
  unique (event_id, user_id));
alter table public.social_rsvps enable row level security;
create policy "sr read" on public.social_rsvps for select using (auth.role() = 'authenticated');
create policy "sr insert" on public.social_rsvps for insert with check (auth.uid() = user_id);
create policy "sr delete" on public.social_rsvps for delete using (auth.uid() = user_id);
