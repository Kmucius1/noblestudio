-- Noble Studio Database Schema

create extension if not exists "uuid-ossp";

-- Projects table
create table noble_video_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  goal text not null,
  platform text not null,
  aspect_ratio text not null default '9:16',
  duration_seconds int not null default 15,
  tone text not null,
  location text,
  cta text,
  custom_prompt text,
  script text,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scenes table
create table noble_video_scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references noble_video_projects(id) on delete cascade,
  scene_number int not null,
  script_line text not null,
  visual_prompt text,
  negative_prompt text,
  camera_direction text,
  noble_action text,
  background text,
  caption_text text,
  voice_direction text,
  image_url text,
  video_url text,
  voice_url text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Character reference images (locked Noble looks)
create table noble_character_refs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- Exports
create table noble_exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references noble_video_projects(id) on delete cascade,
  export_url text,
  format text default 'mp4',
  duration_seconds int,
  aspect_ratio text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Updated_at triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger noble_video_projects_updated_at
  before update on noble_video_projects
  for each row execute function update_updated_at();

create trigger noble_video_scenes_updated_at
  before update on noble_video_scenes
  for each row execute function update_updated_at();

-- RLS
alter table noble_video_projects enable row level security;
alter table noble_video_scenes enable row level security;
alter table noble_character_refs enable row level security;
alter table noble_exports enable row level security;

create policy "Users see own projects" on noble_video_projects
  for all using (auth.uid() = user_id);

create policy "Users see scenes of own projects" on noble_video_scenes
  for all using (
    exists (
      select 1 from noble_video_projects
      where id = noble_video_scenes.project_id and user_id = auth.uid()
    )
  );

create policy "Anyone reads character refs" on noble_character_refs
  for select using (true);

create policy "Users see own exports" on noble_exports
  for all using (
    exists (
      select 1 from noble_video_projects
      where id = noble_exports.project_id and user_id = auth.uid()
    )
  );

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('noble-images', 'noble-images', true),
  ('noble-videos', 'noble-videos', true),
  ('noble-voice', 'noble-voice', true),
  ('noble-exports', 'noble-exports', true),
  ('noble-refs', 'noble-refs', true)
on conflict do nothing;
