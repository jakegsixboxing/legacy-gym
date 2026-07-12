-- Legacy Gym — staff noticeboard (staff post, managers see + clear)
create table if not exists public.staff_notices (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  body text not null,
  created_at timestamptz default now());
alter table public.staff_notices enable row level security;
create policy "nb insert" on public.staff_notices for insert with check (auth.uid() = author_id and public.is_staff(auth.uid()));
create policy "nb read" on public.staff_notices for select using (public.is_manager(auth.uid()) or auth.uid() = author_id);
create policy "nb delete" on public.staff_notices for delete using (public.is_manager(auth.uid()));
