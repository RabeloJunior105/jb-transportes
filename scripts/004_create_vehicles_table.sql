-- Create vehicles table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plate text not null unique,
  model text not null,
  brand text not null,
  year integer not null,
  color text,
  chassis text,
  renavam text,
  fuel_type text default 'diesel' check (fuel_type in ('diesel', 'gasoline', 'ethanol', 'flex')),
  capacity numeric(10,2),
  mileage numeric(10,2) default 0,
  status text default 'active' check (status in ('active', 'maintenance', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;

-- Vehicles policies
create policy "vehicles_select_own" on public.vehicles for select using (auth.uid() = user_id);
create policy "vehicles_insert_own" on public.vehicles for insert with check (auth.uid() = user_id);
create policy "vehicles_update_own" on public.vehicles for update using (auth.uid() = user_id);
create policy "vehicles_delete_own" on public.vehicles for delete using (auth.uid() = user_id);
