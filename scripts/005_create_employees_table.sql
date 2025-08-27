-- Create employees table
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  document text not null,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  position text not null,
  salary numeric(10,2),
  hire_date date not null,
  license_number text,
  license_category text,
  license_expiry date,
  status text default 'active' check (status in ('active', 'inactive', 'vacation')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.employees enable row level security;

-- Employees policies
create policy "employees_select_own" on public.employees for select using (auth.uid() = user_id);
create policy "employees_insert_own" on public.employees for insert with check (auth.uid() = user_id);
create policy "employees_update_own" on public.employees for update using (auth.uid() = user_id);
create policy "employees_delete_own" on public.employees for delete using (auth.uid() = user_id);
