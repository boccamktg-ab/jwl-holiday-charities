-- Fix link_token default — base64url not supported, use hex instead
alter table families
  alter column link_token set default encode(gen_random_bytes(18), 'hex');
