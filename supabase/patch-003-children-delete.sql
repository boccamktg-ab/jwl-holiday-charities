-- Allow social workers to delete children from their own families
create policy "children_delete_own" on children for delete
  using (family_id in (
    select id from families where social_worker_id = current_social_worker_id()
  ));
