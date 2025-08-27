-- Create suppliers table
create table if not exists public.suppliers (
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
  category text,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.suppliers enable row level security;

-- Suppliers policies
create policy "suppliers_select_own" on public.suppliers for select using (auth.uid() = user_id);
create policy "suppliers_insert_own" on public.suppliers for insert with check (auth.uid() = user_id);
create policy "suppliers_update_own" on public.suppliers for update using (auth.uid() = user_id);
create policy "suppliers_delete_own" on public.suppliers for delete using (auth.uid() = user_id);
