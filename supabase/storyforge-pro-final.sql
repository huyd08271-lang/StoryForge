-- STORYFORGE PRO FINAL - chạy 1 lần trên Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,email text,display_name text,status text not null default 'pending' check(status in('pending','approved','rejected')),is_admin boolean not null default false,created_at timestamptz default now());
create table if not exists public.stories(id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id) on delete cascade,title text not null,genre text default 'Giả tưởng',description text default '',cover_url text default '',status text not null default 'writing',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.chapters(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,number int not null,title text not null,content text default '',word_count int default 0,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.chapter_versions(id uuid primary key default gen_random_uuid(),chapter_id uuid not null references public.chapters(id) on delete cascade,title text default '',content text default '',word_count int default 0,created_at timestamptz default now());
create table if not exists public.characters(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,name text not null,age text default '',role text default '',personality text default '',appearance text default '',relationships text default '',backstory text default '',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.world_entries(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,name text not null,category text default '',description text default '',rules text default '',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.timeline_events(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,title text not null,date_label text default '',description text default '',sort_order int default 0,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.canon_items(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,key text not null,value text default '',locked boolean not null default true,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.notes(id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,title text not null,content text default '',status text default 'Inbox',created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.ai_conversations(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,story_id uuid not null references public.stories(id) on delete cascade,chapter_id uuid references public.chapters(id) on delete set null,mode text not null,prompt text default '',result text default '',created_at timestamptz default now());

alter table public.stories add column if not exists cover_url text default '';
alter table public.stories add column if not exists status text not null default 'writing';
alter table public.chapters add column if not exists word_count int default 0;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,display_name,status) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name','User'),'pending') on conflict(id) do update set email=excluded.email,display_name=excluded.display_name; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.get_my_profile() returns public.profiles language sql security definer set search_path=public as $$ select p.* from public.profiles p where p.id=auth.uid() limit 1; $$;
create or replace function public.is_storyforge_admin() returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and is_admin=true and status='approved'); $$;
create or replace function public.admin_list_users() returns setof public.profiles language sql security definer set search_path=public as $$ select p.* from public.profiles p where public.is_storyforge_admin() order by p.created_at desc; $$;
create or replace function public.admin_set_user_status(target_id uuid,new_status text) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_storyforge_admin() then raise exception 'not admin'; end if; if new_status not in('pending','approved','rejected') then raise exception 'invalid status'; end if; update public.profiles set status=new_status where id=target_id; end; $$;

grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.is_storyforge_admin() to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_user_status(uuid,text) to authenticated;

do $$ declare t text; begin
  foreach t in array array['profiles','stories','chapters','chapter_versions','characters','world_entries','timeline_events','canon_items','notes','ai_conversations'] loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

-- replace policies idempotently
 drop policy if exists profiles_select on public.profiles; create policy profiles_select on public.profiles for select to authenticated using(id=auth.uid() or public.is_storyforge_admin());
 drop policy if exists stories_owner on public.stories; create policy stories_owner on public.stories for all to authenticated using(owner_id=auth.uid() or public.is_storyforge_admin()) with check(owner_id=auth.uid() or public.is_storyforge_admin());
 drop policy if exists chapters_owner on public.chapters; create policy chapters_owner on public.chapters for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists chapter_versions_access on public.chapter_versions; create policy chapter_versions_access on public.chapter_versions for all to authenticated using(exists(select 1 from public.chapters c join public.stories s on s.id=c.story_id where c.id=chapter_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.chapters c join public.stories s on s.id=c.story_id where c.id=chapter_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));

 drop policy if exists characters_owner on public.characters; create policy characters_owner on public.characters for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists world_owner on public.world_entries; create policy world_owner on public.world_entries for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists timeline_owner on public.timeline_events; create policy timeline_owner on public.timeline_events for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists canon_owner on public.canon_items; create policy canon_owner on public.canon_items for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists notes_owner on public.notes; create policy notes_owner on public.notes for all to authenticated using(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin()))) with check(exists(select 1 from public.stories s where s.id=story_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));
 drop policy if exists ai_access on public.ai_conversations; create policy ai_access on public.ai_conversations for all to authenticated using(user_id=auth.uid() or public.is_storyforge_admin()) with check(user_id=auth.uid() or public.is_storyforge_admin());

create index if not exists chapters_story_number_idx on public.chapters(story_id,number);
create index if not exists versions_chapter_created_idx on public.chapter_versions(chapter_id,created_at desc);
create index if not exists ai_story_created_idx on public.ai_conversations(story_id,created_at desc);

-- SAU KHI TÀI KHOẢN ADMIN ĐÃ ĐĂNG KÝ, chạy đúng 1 dòng này với email admin của m:
-- update public.profiles set is_admin=true,status='approved' where email='EMAIL_ADMIN_CUA_MAY';
