create table app_settings (
  key text primary key,
  value text not null
);
insert into app_settings values ('submissions_open', 'true');
insert into app_settings values ('submissions_closed_message', 'Family registration is currently closed.');

alter table app_settings enable row level security;
-- No policies — service role only

alter table social_workers add column if not exists submissions_enabled boolean not null default true;
