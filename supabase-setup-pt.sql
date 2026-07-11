-- Legacy Gym — PT booking requests
create table if not exists public.pt_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  member_name text not null default '',
  trainer text not null,
  duration text not null default '45 min',
  preferred text not null default '',
  note text not null default '',
  created_at timestamptz default now());
alter table public.pt_requests enable row level security;
create policy "pr read" on public.pt_requests for select using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "pr insert" on public.pt_requests for insert with check (auth.uid() = user_id);
create policy "pr delete" on public.pt_requests for delete using (auth.uid() = user_id or public.is_staff(auth.uid()));
