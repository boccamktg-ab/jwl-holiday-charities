alter table jwl_members
  add column auth_id uuid unique references auth.users(id) on delete set null,
  add column children_requested integer,
  add column status text not null default 'approved' check (status in ('pending', 'approved', 'disabled'));

-- RLS for members reading their own row
alter table jwl_members enable row level security;
create policy "members_read_own" on jwl_members for select using (auth_id = auth.uid());
create policy "members_update_own" on jwl_members for update using (auth_id = auth.uid());
create policy "members_insert_registration" on jwl_members for insert with check (status = 'pending');
