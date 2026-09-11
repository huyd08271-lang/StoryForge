-- STORYFORGE PRO TOTAL v6
-- Chạy SAU schema.sql + schema-v2.sql + schema-v3.sql + migration-v4.sql.
-- An toàn để chạy nhiều lần.

alter table public.stories add column if not exists cover_url text default '';
alter table public.stories add column if not exists status text not null default 'writing';
do $$ begin
  alter table public.stories add constraint stories_status_check check(status in('writing','paused','completed'));
exception when duplicate_object then null; end $$;

create table if not exists public.chapter_versions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text default '', content text default '', word_count int default 0,
  created_at timestamptz default now()
);

alter table public.chapter_versions enable row level security;
drop policy if exists "chapter_versions_access" on public.chapter_versions;
create policy "chapter_versions_access" on public.chapter_versions for all to authenticated
using (exists(select 1 from public.chapters c join public.stories s on s.id=c.story_id where c.id=chapter_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())))
with check (exists(select 1 from public.chapters c join public.stories s on s.id=c.story_id where c.id=chapter_id and (s.owner_id=auth.uid() or public.is_storyforge_admin())));

grant select,insert,update,delete on public.chapter_versions to authenticated;
create index if not exists chapter_versions_chapter_created_idx on public.chapter_versions(chapter_id,created_at desc);
create index if not exists stories_status_updated_idx on public.stories(status,updated_at desc);

create or replace function public.admin_list_users()
returns setof public.profiles
language sql security definer set search_path=public
as $$
  select p.* from public.profiles p
  where exists(select 1 from public.profiles me where me.id=auth.uid() and me.is_admin=true and me.status='approved')
  order by p.created_at desc;
$$;
revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

create or replace function public.admin_set_user_status(target_id uuid,new_status text)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if not exists(select 1 from public.profiles where id=auth.uid() and is_admin=true and status='approved') then raise exception 'not admin'; end if;
  if new_status not in ('pending','approved','rejected') then raise exception 'invalid status'; end if;
  update public.profiles set status=new_status where id=target_id;
end;
$$;
revoke all on function public.admin_set_user_status(uuid,text) from public;
grant execute on function public.admin_set_user_status(uuid,text) to authenticated;

select 'StoryForge PRO total migration ready' as result;
