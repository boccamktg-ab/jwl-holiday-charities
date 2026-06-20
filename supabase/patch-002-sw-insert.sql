-- Allow registration inserts (status must be pending — no self-approval)
create policy "sw_insert_registration" on social_workers
  for insert with check (status = 'pending');

-- Allow social_worker_schools to be inserted during registration
create policy "sws_insert_registration" on social_worker_schools
  for insert with check (true);
