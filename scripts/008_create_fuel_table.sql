-- Create fuel table
create table if not exists public.fuel (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) not null,
  driver_id uuid references public.employees(id) not null,
  supplier_id uuid references public.suppliers(id),
  fuel_type text not null check (fuel_type in ('diesel', 'gasoline', 'ethanol')),
  liters numeric(10,2) not null,
  price_per_liter numeric(10,2) not null,
  total_cost numeric(10,2) not null,
  mileage numeric(10,2),
  fuel_date date not null,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fuel enable row level security;

-- Fuel policies
create policy "fuel_select_own" on public.fuel for select using (auth.uid() = user_id);
create policy "fuel_insert_own" on public.fuel for insert with check (auth.uid() = user_id);
create policy "fuel_update_own" on public.fuel for update using (auth.uid() = user_id);
create policy "fuel_delete_own" on public.fuel for delete using (auth.uid() = user_id);
