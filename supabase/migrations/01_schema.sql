-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Roles Table
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. User Roles Table
create table public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role_id uuid references public.roles(id) on delete cascade not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role_id)
);

-- 4. Team Members (Manager-Employee relationship)
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  manager_id uuid references public.profiles(id) on delete cascade not null,
  employee_id uuid references public.profiles(id) on delete cascade not null,
  access_status text check (access_status in ('Active', 'Inactive')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(manager_id, employee_id)
);

-- 5. Access Requests
create table public.access_requests (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  resource text not null,
  permission text not null,
  status text check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  reviewed_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Digital Assets
create table public.digital_assets (
  id uuid default uuid_generate_v4() primary key,
  asset_id text unique not null,
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  type text not null,
  status text check (status in ('Verified', 'Pending', 'Revoked')) default 'Pending',
  description text,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Audit Logs
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource text not null,
  category text check (category in ('Access', 'Assets', 'Team', 'Authentication')) not null,
  status text check (status in ('success', 'warning', 'info', 'error')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  type text check (type in ('request', 'asset', 'team', 'system')) not null,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.team_members enable row level security;
alter table public.access_requests enable row level security;
alter table public.digital_assets enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Setup RLS Policies (Simplified for prototype, focusing on Manager access)

-- Profiles: Users can read their own profile, Managers can read profiles of their team members.
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
-- Simplified: Allow authenticated users to read all profiles for this prototype to easily populate team data.
create policy "Authenticated users can view all profiles" on public.profiles for select using (auth.role() = 'authenticated');

-- User Roles: Authenticated users can view user roles
create policy "Authenticated users can view roles" on public.user_roles for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view roles table" on public.roles for select using (auth.role() = 'authenticated');

-- Team Members: Managers can view their team
create policy "Managers can view their team" on public.team_members for select using (auth.uid() = manager_id);

-- Access Requests: Managers can view requests from their team and update them
create policy "Managers can view team requests" on public.access_requests for select using (auth.role() = 'authenticated');
create policy "Managers can update requests" on public.access_requests for update using (auth.role() = 'authenticated');

-- Digital Assets: Viewable by authenticated users
create policy "Authenticated users can view assets" on public.digital_assets for select using (auth.role() = 'authenticated');

-- Audit Logs: Viewable by authenticated users, insertable by authenticated users
create policy "Authenticated users can view audit logs" on public.audit_logs for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert audit logs" on public.audit_logs for insert with check (auth.role() = 'authenticated');

-- Notifications: Users can view and update their own notifications
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (auth.role() = 'authenticated');

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
