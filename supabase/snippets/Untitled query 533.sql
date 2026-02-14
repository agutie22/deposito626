select conname, pg_get_constraintdef(c.oid) as def
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where t.relname = 'profiles'
  and n.nspname = 'public'
  and conname = 'profiles_role_check';
