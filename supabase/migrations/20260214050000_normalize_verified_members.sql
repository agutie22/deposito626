-- Migration: Normalize verified_members phone numbers
-- Description: Ensures all phone numbers in verified_members are stored as 10-digit strings (no formatting).

-- 1. Function to clean phone numbers (extract last 10 digits)
create or replace function public.clean_phone_number(input_phone text)
returns text
language plpgsql
immutable
as $$
declare
  cleaned text;
begin
  -- Remove all non-digit characters
  cleaned := regexp_replace(input_phone, '\D', '', 'g');
  
  -- Take the last 10 digits
  if length(cleaned) > 10 then
    cleaned := substr(cleaned, length(cleaned) - 9);
  end if;
  
  return cleaned;
end;
$$;

-- 2. Update the trigger function to use the cleaning function
create or replace function public.add_new_member_from_order()
returns trigger
language plpgsql
security definer
as $$
declare
  cleaned_phone text;
begin
  cleaned_phone := public.clean_phone_number(NEW.phone);
  
  if cleaned_phone is not null and cleaned_phone != '' then
    insert into verified_members (phone_number, referred_by)
    values (cleaned_phone, NULL)
    on conflict (phone_number) do nothing;
  end if;
  
  return NEW;
end;
$$;

-- 3. Normalize existing data in verified_members
-- Note: This might cause primary key conflicts if multiple formatted numbers resolve to the same cleaned number.
-- We use a temporary table to handle this.
create temp table temp_normalized_members as
select distinct
  public.clean_phone_number(phone_number) as phone_number,
  referred_by,
  joined_at
from verified_members;

-- Delete old data
truncate table verified_members cascade;

-- Insert normalized data
insert into verified_members (phone_number, referred_by, joined_at)
select phone_number, referred_by, joined_at
from temp_normalized_members
on conflict (phone_number) do nothing;

drop table temp_normalized_members;
