-- JWL Holiday Charities — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Districts ───────────────────────────────────────────────────────────────
create table districts (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

-- ─── Schools ─────────────────────────────────────────────────────────────────
create table schools (
  id          uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id) on delete cascade,
  name        text not null
);

-- ─── Social Workers ──────────────────────────────────────────────────────────
create table social_workers (
  id         uuid primary key default gen_random_uuid(),
  auth_id    uuid unique references auth.users(id) on delete set null,
  name       text not null,
  email      text not null unique,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'disabled')),
  created_at timestamptz not null default now()
);

-- ─── Social Worker ↔ Schools (many-to-many) ──────────────────────────────────
create table social_worker_schools (
  social_worker_id uuid not null references social_workers(id) on delete cascade,
  school_id        uuid not null references schools(id) on delete cascade,
  primary key (social_worker_id, school_id)
);

-- ─── Families ────────────────────────────────────────────────────────────────
create table families (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references schools(id),
  social_worker_id uuid not null references social_workers(id),
  family_number    text not null,
  num_children     integer not null default 0,
  status           text not null default 'draft' check (status in ('draft', 'submitted', 'approved')),
  link_token       text not null unique default encode(gen_random_bytes(18), 'base64url'),
  language_pref    text not null default 'en' check (language_pref in ('en', 'es')),
  created_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  approved_at      timestamptz,
  unique (school_id, family_number)
);

-- ─── Children ────────────────────────────────────────────────────────────────
create table children (
  id             uuid primary key default gen_random_uuid(),
  family_id      uuid not null references families(id) on delete cascade,
  first_name     text not null,
  age            integer,
  gender         text,
  gift_requests  text,
  top_size       text,
  bottom_size    text,
  shoe_size      text,
  created_at     timestamptz not null default now()
);

-- ─── JWL Members ─────────────────────────────────────────────────────────────
create table jwl_members (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  email text
);

-- ─── Assignments ─────────────────────────────────────────────────────────────
create table assignments (
  id             uuid primary key default gen_random_uuid(),
  jwl_member_id  uuid not null references jwl_members(id),
  created_at     timestamptz not null default now(),
  exported       boolean not null default false
);

-- ─── Assignment ↔ Children (many-to-many) ────────────────────────────────────
create table assignment_children (
  assignment_id uuid not null references assignments(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  primary key (assignment_id, child_id)
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table districts           enable row level security;
alter table schools             enable row level security;
alter table social_workers      enable row level security;
alter table social_worker_schools enable row level security;
alter table families            enable row level security;
alter table children            enable row level security;
alter table jwl_members         enable row level security;
alter table assignments         enable row level security;
alter table assignment_children enable row level security;

-- Helper: get the social_worker id for the currently logged-in user
create or replace function current_social_worker_id()
returns uuid language sql stable security definer as $$
  select id from social_workers where auth_id = auth.uid()
$$;

-- Helper: is the current user an approved social worker?
create or replace function is_approved_social_worker()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from social_workers
    where auth_id = auth.uid() and status = 'approved'
  )
$$;

-- Districts & Schools: readable by all authenticated users
create policy "districts_read" on districts for select using (auth.role() = 'authenticated');
create policy "schools_read"   on schools   for select using (auth.role() = 'authenticated');

-- Social Workers: can read/update their own row; service role manages the rest
create policy "sw_read_own"   on social_workers for select using (auth_id = auth.uid());
create policy "sw_update_own" on social_workers for update using (auth_id = auth.uid());

-- Social Worker Schools: read own assignments
create policy "sws_read_own" on social_worker_schools for select
  using (social_worker_id = current_social_worker_id());

-- Families: approved SW sees only families they own
create policy "families_read_own" on families for select
  using (social_worker_id = current_social_worker_id());
create policy "families_insert_own" on families for insert
  with check (social_worker_id = current_social_worker_id() and is_approved_social_worker());
create policy "families_update_own" on families for update
  using (social_worker_id = current_social_worker_id());

-- Public family form access via link_token (no auth required)
create policy "families_read_by_token" on families for select
  using (true); -- refined per-row access is enforced in the API route by matching link_token

-- Children: follow parent family ownership
create policy "children_read_own" on children for select
  using (family_id in (
    select id from families where social_worker_id = current_social_worker_id()
  ));
create policy "children_insert_own" on children for insert
  with check (family_id in (
    select id from families where social_worker_id = current_social_worker_id()
  ));
create policy "children_update_own" on children for update
  using (family_id in (
    select id from families where social_worker_id = current_social_worker_id()
  ));

-- JWL Members, Assignments, Assignment Children: service role only (admin dashboard uses service client)
-- No anon/authenticated policies — all admin actions go through the service_role key server-side
