-- ============================================
-- NJD Board - Database Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────
-- Extends Supabase auth.users with app-specific data
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  name text not null,
  name_ar text not null,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  avatar text not null default '👤',
  phone text,
  status text not null default 'available' check (status in ('available', 'busy', 'away')),
  workload integer not null default 0 check (workload >= 0 and workload <= 100),
  skills text[] not null default '{}',
  skills_ar text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Projects ─────────────────────────────────
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_ar text not null,
  description text not null default '',
  description_ar text not null default '',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  color text not null default '#7C3AED',
  status text not null default 'active' check (status in ('active', 'on-hold', 'completed')),
  start_date date not null default current_date,
  end_date date not null default (current_date + interval '90 days'),
  tags text[] not null default '{}',
  tags_ar text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Project Members (junction table) ─────────
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, profile_id)
);

-- ── Sprints ──────────────────────────────────
create table public.sprints (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_ar text not null,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  start_date date not null,
  end_date date not null,
  goals text[] not null default '{}',
  goals_ar text[] not null default '{}',
  velocity integer not null default 0,
  total_points integer not null default 0,
  completed_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Tasks ────────────────────────────────────
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  title_ar text not null,
  description text not null default '',
  description_ar text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  assignee_id uuid references public.profiles(id),
  project_id uuid references public.projects(id) on delete cascade,
  sprint_id uuid references public.sprints(id) on delete set null,
  tags text[] not null default '{}',
  tags_ar text[] not null default '{}',
  due_date date,
  story_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Design Items ─────────────────────────────
create table public.design_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  title_ar text not null,
  type text not null check (type in ('ui', '3d-model', 'animation', 'concept-art', 'icon', 'texture')),
  status text not null default 'draft' check (status in ('draft', 'in-review', 'approved', 'revision')),
  assignee_id uuid references public.profiles(id),
  project_id uuid references public.projects(id) on delete cascade,
  thumbnail text not null default '📄',
  version integer not null default 1,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Notifications ────────────────────────────
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('task', 'mention', 'sprint', 'system', 'invite')),
  title text not null,
  title_ar text not null,
  message text not null,
  message_ar text not null,
  avatar text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Invitations ──────────────────────────────
create table public.invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  invited_by uuid references public.profiles(id) not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_sprint on public.tasks(sprint_id);
create index idx_tasks_status on public.tasks(status);
create index idx_design_items_project on public.design_items(project_id);
create index idx_design_items_assignee on public.design_items(assignee_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_invitations_email on public.invitations(email);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.sprints enable row level security;
alter table public.tasks enable row level security;
alter table public.design_items enable row level security;
alter table public.notifications enable row level security;
alter table public.invitations enable row level security;

-- Profiles: users can read all, but only update their own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Projects: all authenticated users can read; admins can insert/update/delete
create policy "Projects are viewable by authenticated users"
  on public.projects for select
  to authenticated
  using (true);

create policy "Admins can manage projects"
  on public.projects for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Project Members: readable by all, managed by admins
create policy "Project members viewable by authenticated users"
  on public.project_members for select
  to authenticated
  using (true);

create policy "Admins can manage project members"
  on public.project_members for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Sprints: readable by all, managed by admins
create policy "Sprints are viewable by authenticated users"
  on public.sprints for select
  to authenticated
  using (true);

create policy "Admins can manage sprints"
  on public.sprints for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Tasks: readable by all; assignees and admins can update
create policy "Tasks are viewable by authenticated users"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Admins can manage all tasks"
  on public.tasks for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Assignees can update their tasks"
  on public.tasks for update
  to authenticated
  using (assignee_id = auth.uid());

-- Design Items: readable by all; admins can manage
create policy "Design items viewable by authenticated users"
  on public.design_items for select
  to authenticated
  using (true);

create policy "Admins can manage design items"
  on public.design_items for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Notifications: users can only see their own
create policy "Users can view own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

-- Invitations: admins can manage, users can view their own
create policy "Admins can manage invitations"
  on public.invitations for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_projects_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger on_tasks_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger on_sprints_updated
  before update on public.sprints
  for each row execute function public.handle_updated_at();

create trigger on_design_items_updated
  before update on public.design_items
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, name_ar, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name_ar', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Enable Realtime for key tables
-- ============================================
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.design_items;
