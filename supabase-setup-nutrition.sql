-- Legacy Gym: privately assigned nutrition programs (NUTRITION space in the app)
-- First program: Road to Christmas Fuel Plan (Alison, Oct 2026). Spec: RTC_APP_BRIEF.md.
-- Already applied to project jyslqxepodrseyhoppce on 10 Oct 2026. Kept here for the record.
--
-- ACCESS MODEL: a member sees the NUTRITION tile only if they have a row in
-- nutrition_assignments. RLS returns nothing to anyone else (staff, coaches,
-- Fight Club, Road to Christmas included). No gating by group, challenge or role.
--
-- TO ASSIGN A PROGRAM TO A NEW MEMBER (the only step next time Alison sells one):
--   insert into public.nutrition_assignments (program_id, user_id, note)
--   select p.id, u.id, 'why' from public.nutrition_programs p, auth.users u
--   where p.key = 'rtc2026_fuel' and lower(u.email) = 'member@example.com';
-- TO REMOVE: delete from public.nutrition_assignments where user_id = '<uuid>';
-- TO ADD A NEW PROGRAM: insert a nutrition_programs row with content in the
--   "fuel_plan_v1" shape: { plan: <rtc_plan_data.json style>, start_here_md, recipe_intros, targets_note }
--   then assign as above. The app renders any program in that shape.

create table if not exists public.nutrition_programs (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  subtitle text,
  brand text,
  cover_url text,
  accent text default '#4a8de6',
  content jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.nutrition_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.nutrition_programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique(program_id, user_id)
);
alter table public.nutrition_programs enable row level security;
alter table public.nutrition_assignments enable row level security;

-- Members read only their own assignment rows.
create policy nut_assign_own_select on public.nutrition_assignments
  for select to authenticated using (user_id = auth.uid());
-- A program is readable only by users assigned to it. No insert/update/delete policies: admin via SQL only.
create policy nut_prog_assigned_select on public.nutrition_programs
  for select to authenticated using (active and exists (
    select 1 from public.nutrition_assignments a where a.program_id = nutrition_programs.id and a.user_id = auth.uid()));

-- Road to Christmas Fuel Plan: content = rtc_plan_data.json + RTC_START_HERE.md (inserted 10 Oct 2026, key 'rtc2026_fuel').
-- Assigned to: Henry Matthews (henry_2705@icloud.com, 1b15a6a3-92d0-4ad5-8812-6a4b0544c0d6)
--              Alison Williamson (coach view, f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce)
