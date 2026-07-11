-- Legacy Gym — Ask Me Anything knowledge base + unanswered question log
create table if not exists public.ama_kb (
  id uuid primary key default gen_random_uuid(),
  keywords text not null,
  answer text not null,
  created_at timestamptz default now());
alter table public.ama_kb enable row level security;
create policy "kb read" on public.ama_kb for select using (auth.role() = 'authenticated');
create policy "kb insert" on public.ama_kb for insert with check (public.is_staff(auth.uid()));
create policy "kb delete" on public.ama_kb for delete using (public.is_staff(auth.uid()));

create table if not exists public.ama_misses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  created_at timestamptz default now());
alter table public.ama_misses enable row level security;
create policy "miss read" on public.ama_misses for select using (public.is_staff(auth.uid()));
create policy "miss insert" on public.ama_misses for insert with check (auth.uid() = user_id);
create policy "miss delete" on public.ama_misses for delete using (public.is_staff(auth.uid()));
