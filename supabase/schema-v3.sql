-- STORYFORGE CLOUD SAFETY/COMPLETENESS MIGRATION
-- Chạy sau schema-v2.sql. An toàn để chạy nhiều lần.

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.stories, public.chapters to authenticated;
grant select, insert, update, delete on public.characters, public.world_entries,
  public.timeline_events, public.notes, public.canon_items to authenticated;

create index if not exists stories_owner_updated_idx
  on public.stories(owner_id, updated_at desc);
create index if not exists chapters_story_number_idx
  on public.chapters(story_id, number);
create index if not exists chapters_story_updated_idx
  on public.chapters(story_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stories_set_updated_at on public.stories;
create trigger stories_set_updated_at
before update on public.stories
for each row execute function public.set_updated_at();

drop trigger if exists chapters_set_updated_at on public.chapters;
create trigger chapters_set_updated_at
before update on public.chapters
for each row execute function public.set_updated_at();

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
before update on public.characters
for each row execute function public.set_updated_at();

drop trigger if exists world_entries_set_updated_at on public.world_entries;
create trigger world_entries_set_updated_at
before update on public.world_entries
for each row execute function public.set_updated_at();

drop trigger if exists timeline_events_set_updated_at on public.timeline_events;
create trigger timeline_events_set_updated_at
before update on public.timeline_events
for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists canon_items_set_updated_at on public.canon_items;
create trigger canon_items_set_updated_at
before update on public.canon_items
for each row execute function public.set_updated_at();

select 'StoryForge cloud migration v3 ready' as result;
