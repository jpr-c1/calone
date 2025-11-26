-- Create users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  initials text not null
);

-- Create content table
create table public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  channel text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  publish_date date not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.content enable row level security;

-- Create RLS policies (allow all operations for now since v1 has no real auth)
create policy "Allow all operations on users"
  on public.users
  for all
  using (true)
  with check (true);

create policy "Allow all operations on content"
  on public.content
  for all
  using (true)
  with check (true);

-- Seed users table with 6 placeholder users
insert into public.users (name, role, initials) values
  ('Eli Catesini', 'Content Director', 'EC'),
  ('Jose Paz Rendal', 'Social Media Manager', 'JPR'),
  ('Liz Rasmussen', 'Marketing Lead', 'LR'),
  ('Rich Stevenson', 'Brand Strategist', 'RS'),
  ('Val Muda', 'Content Producer', 'VM'),
  ('Alex Morgan', 'Digital Strategist', 'AM');
