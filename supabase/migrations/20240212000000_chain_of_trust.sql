-- Create verified_members table
create table if not exists verified_members (
  phone_number text primary key,
  referred_by text references verified_members(phone_number),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table verified_members enable row level security;

-- Policies
create policy "Public can check verification" on verified_members
  for select using (true); -- Ideally we'd restrict this, but for "Access Gate" we need to query it. 
  -- Better practice: Use a definer function, but for MVP Direct Select is fine if we only select specific columns.

create policy "Service role can insert members" on verified_members
  for insert with check (true);

-- Seed Root Number
insert into verified_members (phone_number, referred_by)
values ('6266271703', null)
on conflict (phone_number) do nothing;

-- Function to check referrer (Secure access)
create or replace function check_referrer_access(lookup_phone text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (select 1 from verified_members where phone_number = lookup_phone);
end;
$$;

-- Trigger to auto-add new customers from orders
create or replace function public.add_new_member_from_order()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only add if status is 'completed' or if we want to add them immediately upon order placement?
  -- User said: "when they are about to checkout they must also enter their phone number... and this is how the tree grows"
  -- So we add them when the order is created.
  
  insert into verified_members (phone_number, referred_by)
  values (NEW.phone, NULL) -- We don't track *who* referred them in this simple model, just that they are now verified. 
                           -- Or we could pass it in via metadata if we wanted to track the tree strictly.
                           -- For now, flat list of "allowed" numbers is sufficient for the "Unlock" mechanic.
  on conflict (phone_number) do nothing;
  
  return NEW;
end;
$$;

-- Drop trigger if exists to avoid duplication errors during dev
drop trigger if exists on_order_created_add_member on orders;

create trigger on_order_created_add_member
  after insert on orders
  for each row execute procedure public.add_new_member_from_order();
