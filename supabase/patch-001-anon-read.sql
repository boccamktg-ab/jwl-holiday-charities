-- Allow unauthenticated users to read districts and schools
-- (needed for the registration form school picker)
drop policy if exists "districts_read" on districts;
drop policy if exists "schools_read" on schools;

create policy "districts_read" on districts for select using (true);
create policy "schools_read"   on schools   for select using (true);
