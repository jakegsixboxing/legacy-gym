-- Legacy Gym — Fight Tape (sparring clips + coach review)
create table if not exists public.sparring_clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  video_url text not null,
  caption text not null default '',
  coach_comment text not null default '',
  coach_name text not null default '',
  created_at timestamptz default now());
alter table public.sparring_clips enable row level security;
create policy "sc read" on public.sparring_clips for select using (auth.uid() = user_id or public.is_coach(auth.uid()));
create policy "sc insert" on public.sparring_clips for insert with check (auth.uid() = user_id);
create policy "sc update" on public.sparring_clips for update using (public.is_coach(auth.uid()));
create policy "sc delete" on public.sparring_clips for delete using (auth.uid() = user_id or public.is_coach(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit) values ('sparring-clips','sparring-clips', true, 52428800) on conflict (id) do nothing;
create policy "clips read" on storage.objects for select using (bucket_id = 'sparring-clips');
create policy "clips insert" on storage.objects for insert with check (bucket_id = 'sparring-clips' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "clips delete" on storage.objects for delete using (bucket_id = 'sparring-clips' and auth.uid()::text = (storage.foldername(name))[1]);
