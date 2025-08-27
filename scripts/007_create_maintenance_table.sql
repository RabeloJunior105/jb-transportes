-- Create maintenance table
create table if not exists public.maintenance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) not null,
  supplier_id uuid references public.suppliers(id),
  maintenance_type text not null check (maintenance_type in ('preventive', 'corrective', 'emergency')),
  description text not null,
  cost numeric(10,2) not null,
  maintenance_date date not null,
  next_maintenance_date date,
  mileage numeric(10,2),
  status text default 'completed' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.maintenance enable row level security;

-- Maintenance policies
create policy "maintenance_select_own" on public.maintenance for select using (auth.uid() = user_id);
create policy "maintenance_insert_own" on public.maintenance for insert with check (auth.uid() = user_id);
create policy "maintenance_update_own" on public.maintenance for update using (auth.uid() = user_id);
create policy "maintenance_delete_own" on public.maintenance for delete using (auth.uid() = user_id);
