-- ==============================================================================
-- TRẠM HỌC OPS - SUPABASE DATABASE SCHEMA
-- Trạm Học 24/7 Study Cafe & Co-working Space (601A Cách Mạng Tháng 8, Q.10, TP.HCM)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null check (role in ('admin', 'staff')) default 'staff',
  default_floor text not null check (default_floor in ('Tầng 1', 'Tầng 2', 'Tất cả')) default 'Tầng 2',
  hourly_rate integer not null check (hourly_rate >= 0) default 25000,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. TRANSACTIONS (Quản lý Thu - Chi)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null default current_date,
  type text not null check (type in ('Thu', 'Chi')),
  floor text not null check (floor in ('Tầng 1', 'Tầng 2', 'Tầng 3', 'Tất cả')),
  category text not null check (
    category in (
      'Doanh thu',
      'Chi phí nhân viên',
      'Chi phí nguyên liệu',
      'Chi phí điện nước',
      'Chi phí mặt bằng',
      'Chi phí cơ sở hạ tầng',
      'Chi phí khác'
    )
  ),
  payment_method text not null check (payment_method in ('Tiền mặt', 'Chuyển khoản')) default 'Tiền mặt',
  description text not null,
  amount bigint not null check (amount > 0),
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3. SHIFTS (Lịch làm việc đan xen theo từng giờ 24/7)
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  start_hour integer not null check (start_hour >= 0 and start_hour <= 23),
  end_hour integer not null check (end_hour >= 1 and end_hour <= 24 and end_hour > start_hour),
  floor text not null check (floor in ('Tầng 1', 'Tầng 2')) default 'Tầng 2',
  hourly_rate_snapshot integer not null default 25000 check (hourly_rate_snapshot >= 0),
  rate_multiplier numeric(3,2) not null default 1.00 check (rate_multiplier >= 0.5 and rate_multiplier <= 5.0),
  allowance integer not null default 0 check (allowance >= 0),
  status text not null check (status in ('scheduled', 'approved', 'absent')) default 'scheduled',
  note text,
  created_at timestamptz not null default now()
);

-- 4. STAFF_AVAILABILITY (Nhân viên đăng ký khung giờ rảnh)
create table if not exists public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  available_hours integer[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  constraint staff_availability_staff_date_unique unique (staff_id, work_date)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_transactions_date on public.transactions(transaction_date);
create index if not exists idx_transactions_type_floor on public.transactions(type, floor);
create index if not exists idx_transactions_category on public.transactions(category);
create index if not exists idx_shifts_date on public.shifts(work_date);
create index if not exists idx_shifts_staff on public.shifts(staff_id);
create index if not exists idx_shifts_status on public.shifts(status);
create index if not exists idx_staff_availability_date on public.staff_availability(work_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.shifts enable row level security;
alter table public.staff_availability enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- PROFILES POLICIES
create policy "Authenticated users can view active profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Admins can insert and manage all profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can update their own profile contact"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- TRANSACTIONS POLICIES (Admins have full access, Staff can view non-sensitive or view summary)
create policy "Admins have full access to transactions"
  on public.transactions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Staff can view revenue summaries"
  on public.transactions for select
  to authenticated
  using (true);

-- SHIFTS POLICIES
create policy "All authenticated users can view shifts"
  on public.shifts for select
  to authenticated
  using (true);

create policy "Admins can manage shifts"
  on public.shifts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- STAFF_AVAILABILITY POLICIES
create policy "Staff can view own availability"
  on public.staff_availability for select
  to authenticated
  using (auth.uid() = staff_id or public.is_admin());

create policy "Staff can insert own availability"
  on public.staff_availability for insert
  to authenticated
  with check (auth.uid() = staff_id or public.is_admin());

create policy "Staff can update own availability"
  on public.staff_availability for update
  to authenticated
  using (auth.uid() = staff_id or public.is_admin())
  with check (auth.uid() = staff_id or public.is_admin());

create policy "Staff can delete own availability"
  on public.staff_availability for delete
  to authenticated
  using (auth.uid() = staff_id or public.is_admin());

-- Trigger to handle auth.users on insert -> public.profiles
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role, hourly_rate)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nhân viên mới'),
    coalesce(new.raw_user_meta_data->>'role', 'staff'),
    25000
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
