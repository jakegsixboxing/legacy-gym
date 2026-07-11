-- Legacy Gym app — database setup
-- Runs on the same Supabase project as Kincumber Recovery,
-- so profiles/auth already exist and members share one login.

-- Members chat
create table if not exists public.legacy_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now()
);
alter table public.legacy_messages enable row level security;

-- any logged-in member can read the chat
create policy "read chat" on public.legacy_messages
  for select using (auth.role() = 'authenticated');

-- members can only post as themselves
create policy "post own messages" on public.legacy_messages
  for insert with check (auth.uid() = user_id);

-- realtime feed for live chat
alter publication supabase_realtime add table public.legacy_messages;
