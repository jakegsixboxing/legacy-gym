-- Legacy Gym — Local Blokes Heavyweight Club (VIP section)

alter table public.profiles add column if not exists is_blokes boolean not null default false;

create or replace function public.is_blokes(uid uuid) returns boolean
language sql security definer set search_path = public as
$$ select coalesce((select is_blokes from public.profiles where id = uid), false) $$;

create table if not exists public.blokes_invites (
  email text primary key,
  created_at timestamptz default now());
alter table public.blokes_invites enable row level security;
create policy "bi mgr" on public.blokes_invites for all using (public.is_manager(auth.uid()));

create or replace function public.grant_blokes(target_email text, make_blokes boolean) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager(auth.uid()) then return 'Only managers can change Local Blokes access.'; end if;
  update public.profiles set is_blokes = make_blokes where lower(email) = lower(target_email);
  if not found then
    if make_blokes then
      insert into public.blokes_invites(email) values (lower(target_email)) on conflict do nothing;
      return 'No profile yet — pre-approved ' || target_email || ' for Local Blokes at signup.';
    end if;
    delete from public.blokes_invites where email = lower(target_email);
    return 'No profile found for ' || target_email || '.';
  end if;
  return (case when make_blokes then 'Local Blokes access granted for ' else 'Local Blokes access removed for ' end) || target_email;
end $$;

create or replace function public.apply_blokes_invite() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.blokes_invites where email = lower(new.email)) then
    new.is_blokes := true;
  end if;
  return new;
end $$;
drop trigger if exists trg_blokes_invite on public.profiles;
create trigger trg_blokes_invite before insert on public.profiles
for each row execute function public.apply_blokes_invite();

create table if not exists public.blokes_lifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week int not null default 1,
  day text not null default 'mon',
  exercise text not null,
  weight_kg numeric not null check (weight_kg > 0),
  reps int not null check (reps > 0),
  session_date date not null default current_date,
  created_at timestamptz default now());
alter table public.blokes_lifts enable row level security;
create policy "bl read" on public.blokes_lifts for select using (public.is_blokes(auth.uid()) or public.is_staff(auth.uid()));
create policy "bl insert" on public.blokes_lifts for insert with check (auth.uid() = user_id and public.is_blokes(auth.uid()));
create policy "bl delete" on public.blokes_lifts for delete using (auth.uid() = user_id);

create table if not exists public.blokes_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  body text not null,
  created_at timestamptz default now());
alter table public.blokes_messages enable row level security;
create policy "bm read" on public.blokes_messages for select using (public.is_blokes(auth.uid()) or public.is_staff(auth.uid()));
create policy "bm insert" on public.blokes_messages for insert with check (auth.uid() = user_id and public.is_blokes(auth.uid()));

create table if not exists public.blokes_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  event_time text not null default '',
  location text not null default '',
  details text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now());
alter table public.blokes_events enable row level security;
create policy "be read" on public.blokes_events for select using (public.is_blokes(auth.uid()) or public.is_staff(auth.uid()));
create policy "be insert" on public.blokes_events for insert with check (public.is_staff(auth.uid()));
create policy "be delete" on public.blokes_events for delete using (public.is_staff(auth.uid()));

create table if not exists public.blokes_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.blokes_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz default now(),
  unique (event_id, user_id));
alter table public.blokes_rsvps enable row level security;
create policy "br read" on public.blokes_rsvps for select using (public.is_blokes(auth.uid()) or public.is_staff(auth.uid()));
create policy "br insert" on public.blokes_rsvps for insert with check (auth.uid() = user_id and public.is_blokes(auth.uid()));
create policy "br delete" on public.blokes_rsvps for delete using (auth.uid() = user_id);

create or replace function public.blokes_members() returns table(user_id uuid, full_name text)
language sql security definer set search_path = public as $$
  select p.id, coalesce(nullif(trim(mp.full_name), ''), trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')))
  from public.profiles p
  left join public.member_profiles mp on mp.user_id = p.id
  where p.is_blokes and (public.is_blokes(auth.uid()) or public.is_staff(auth.uid()))
$$;
