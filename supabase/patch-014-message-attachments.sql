alter table grant_messages
  add column if not exists attachment_url  text,
  add column if not exists attachment_name text;
