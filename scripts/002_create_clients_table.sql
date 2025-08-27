-- Create clients table
create table if not exists public.clients (
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
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clients enable row level security;

-- Clients policies
create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id);
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);
