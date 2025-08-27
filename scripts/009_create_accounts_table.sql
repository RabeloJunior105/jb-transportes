-- Create accounts payable table
create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id),
  description text not null,
  category text not null check (category in ('fuel', 'maintenance', 'insurance', 'tolls', 'salary', 'other')),
  amount numeric(10,2) not null,
  due_date date not null,
  payment_date date,
  payment_method text check (payment_method in ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check')),
  status text default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create accounts receivable table
create table if not exists public.accounts_receivable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) not null,
  service_id uuid references public.services(id),
  description text not null,
  amount numeric(10,2) not null,
  due_date date not null,
  payment_date date,
  payment_method text check (payment_method in ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'pix')),
  status text default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.accounts_payable enable row level security;
alter table public.accounts_receivable enable row level security;

-- Accounts payable policies
create policy "accounts_payable_select_own" on public.accounts_payable for select using (auth.uid() = user_id);
create policy "accounts_payable_insert_own" on public.accounts_payable for insert with check (auth.uid() = user_id);
create policy "accounts_payable_update_own" on public.accounts_payable for update using (auth.uid() = user_id);
create policy "accounts_payable_delete_own" on public.accounts_payable for delete using (auth.uid() = user_id);

-- Accounts receivable policies
create policy "accounts_receivable_select_own" on public.accounts_receivable for select using (auth.uid() = user_id);
create policy "accounts_receivable_insert_own" on public.accounts_receivable for insert with check (auth.uid() = user_id);
create policy "accounts_receivable_update_own" on public.accounts_receivable for update using (auth.uid() = user_id);
create policy "accounts_receivable_delete_own" on public.accounts_receivable for delete using (auth.uid() = user_id);
