-- Legacy Gym — weights training log
create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program text not null,
  session text not null default '',
  note text not null default '',
  session_date date not null default current_date,
  created_at timestamptz default now());
alter table public.training_logs enable row level security;
create policy "tl read" on public.training_logs for select using (auth.uid() = user_id or public.is_staff(auth.uid()));
create policy "tl insert" on public.training_logs for insert with check (auth.uid() = user_id);
create policy "tl delete" on public.training_logs for delete using (auth.uid() = user_id);
