-- StoryForge Professional V5 migration
-- Chạy SAU schema.sql + schema-v2.sql + schema-v3.sql.
-- Migration này thêm lịch sử AI cloud và RPC quản trị thành viên.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid references public.stories(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  mode text not null default 'chat',
  prompt text default '',
  result text default '',
  created_at timestamptz default now()
);

alter table public.ai_conversations enable row level security;
drop policy if exists "ai_history_owner" on public.ai_conversations;
create policy "ai_history_owner" on public.ai_conversations for all to authenticated
using (user_id=auth.uid() or public.is_storyforge_admin())
with check (user_id=auth.uid() or public.is_storyforge_admin());
grant select,insert,update,delete on public.ai_conversations to authenticated;

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

create index if not exists ai_conversations_user_created_idx on public.ai_conversations(user_id,created_at desc);
create index if not exists ai_conversations_story_created_idx on public.ai_conversations(story_id,created_at desc);

select 'StoryForge Professional V5 migration ready' as result;
