-- Legacy Gym — class registration
create table if not exists public.class_regs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  class_name text not null,
  class_date date not null,
  class_time text not null,
  created_at timestamptz default now(),
  unique (user_id, class_date, class_time));
alter table public.class_regs enable row level security;
create policy "cr read" on public.class_regs for select using (auth.role() = 'authenticated');
create policy "cr insert" on public.class_regs for insert with check (auth.uid() = user_id);
create policy "cr delete" on public.class_regs for delete using (auth.uid() = user_id);
