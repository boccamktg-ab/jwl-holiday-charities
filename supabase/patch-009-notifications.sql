create table admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table admin_notifications enable row level security;
-- No policies needed — service role bypasses RLS, anon/authenticated users get no access
