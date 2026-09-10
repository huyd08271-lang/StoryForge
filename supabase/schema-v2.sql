-- STORYFORGE CLOUD DATA v2
-- Chạy file này trong Supabase SQL Editor. Không cần xóa dữ liệu truyện hiện có.

create extension if not exists pgcrypto;

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(), story_id uuid not null references public.stories(id) on delete cascade,
  name text not null, role text default '', age text default '', personality text default '', appearance text default '', relationships text default '', notes text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.world_entries (
  id uuid primary key default gen_random_uuid(), story_id uuid not null references public.stories(id) on delete cascade,
  name text not null, category text default 'Chưa phân loại', description text default '', rules text default '', notes text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(), story_id uuid not null references public.stories(id) on delete cascade,
  date_label text default '', title text not null, description text default '', characters text default '', sort_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), story_id uuid not null references public.stories(id) on delete cascade,
  title text not null, content text default '', category text default 'Chưa phân loại', status text default 'Inbox', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.canon_items (
  id uuid primary key default gen_random_uuid(), story_id uuid not null references public.stories(id) on delete cascade,
  key text not null, value text default '', source text default '', locked boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);

alter table public.characters enable row level security;
alter table public.world_entries enable row level security;
alter table public.timeline_events enable row level security;
alter table public.notes enable row level security;
alter table public.canon_items enable row level security;

-- Tránh infinite recursion trong profiles/stories/chapter policies.
create or replace function public.is_storyforge_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and is_admin=true and status='approved'); $$;
revoke all on function public.is_storyforge_admin() from public;
grant execute on function public.is_storyforge_admin() to authenticated;

-- Thay policy cũ có subquery profiles bằng function security-definer.
do $$ begin
  execute 'drop policy if exists "stories owner" on public.stories';
  execute 'drop policy if exists "stories_user_access" on public.stories';
  execute 'create policy "stories_user_access" on public.stories for all to authenticated using (owner_id=auth.uid() or public.is_storyforge_admin()) with check (owner_id=auth.uid() or public.is_storyforge_admin())';
  execute 'drop policy if exists "chapters owner" on public.chapters';
  execute 'drop policy if exists "chapters_user_access" on public.chapters';
  execute 'create policy "chapters_user_access" on public.chapters for all to authenticated using (exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check (exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())))';
end $$;

-- Generic policies for story-owned modules.
do $$
declare t text; begin
  foreach t in array array['characters','world_entries','timeline_events','notes','canon_items'] loop
    execute format('drop policy if exists "%s_user_access" on public.%s',t,t);
    execute format('create policy "%s_user_access" on public.%s for all to authenticated using (exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check (exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())))',t,t);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select,insert,update,delete on public.characters,public.world_entries,public.timeline_events,public.notes,public.canon_items to authenticated;

create or replace function public.get_my_profile()
returns jsonb language sql security definer set search_path=public
as $$ select to_jsonb(p) from public.profiles p where p.id=auth.uid() or lower(coalesce(p.email,''))=lower(coalesce(auth.jwt()->>'email','')) limit 1; $$;
revoke execute on function public.get_my_profile() from anon;
grant execute on function public.get_my_profile() to authenticated;

grant execute on function public.admin_set_user_status(uuid,text) to authenticated;

-- Đảm bảo tài khoản Admin hiện tại vẫn được phép truy cập.
-- Nếu email Admin của m khác, sửa email bên dưới rồi chạy.
update public.profiles set status='approved', is_admin=true where lower(email)=lower('huyd08271@gmail.com');

select 'StoryForge cloud modules ready' as result;
