-- Create services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  service_code text not null unique,
  client_id uuid references public.clients(id) not null,
  vehicle_id uuid references public.vehicles(id) not null,
  driver_id uuid references public.employees(id) not null,
  collection_date date not null,
  delivery_date date,
  origin text not null,
  destination text not null,
  description text,
  service_value numeric(10,2) not null,
  toll_cost numeric(10,2) default 0,
  fuel_cost numeric(10,2) default 0,
  other_costs numeric(10,2) default 0,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;

-- Services policies
create policy "services_select_own" on public.services for select using (auth.uid() = user_id);
create policy "services_insert_own" on public.services for insert with check (auth.uid() = user_id);
create policy "services_update_own" on public.services for update using (auth.uid() = user_id);
create policy "services_delete_own" on public.services for delete using (auth.uid() = user_id);
