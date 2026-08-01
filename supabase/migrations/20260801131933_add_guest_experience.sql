alter table public.events
  add column if not exists guest_experience text not null default 'ios_app'
    check (guest_experience in ('web_upload', 'ios_app')),
  add column if not exists max_total_photos integer not null default 500
    check (max_total_photos between 1 and 1000);

create or replace function public.complete_guest_photo_atomic(
  p_photo_id text,
  p_guest_id text,
  p_upload_token_hash text,
  p_message text,
  p_width_px integer,
  p_height_px integer
)
returns setof public.photos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  intent_row public.upload_intents%rowtype;
  guest_row public.guests%rowtype;
  event_row public.events%rowtype;
  photo_row public.photos%rowtype;
begin
  select * into intent_row
  from public.upload_intents
  where photo_id = p_photo_id
    and guest_id = p_guest_id
  for update;

  if not found
     or intent_row.used
     or intent_row.expires_at <= now()
     or intent_row.token_hash <> p_upload_token_hash then
    raise exception 'Invalid upload token' using errcode = '42501';
  end if;

  select * into event_row
  from public.events
  where id = intent_row.event_id
  for update;

  select * into guest_row
  from public.guests
  where id = p_guest_id
  for update;

  if guest_row.upload_count >= event_row.max_photos_per_guest then
    raise exception 'Photo limit reached' using errcode = 'P0001';
  end if;

  if (
    (select count(*) from public.photos where event_id = intent_row.event_id and status <> 'deleted')
    +
    (select count(*) from public.event_media where event_id = intent_row.event_id and upload_status = 'uploaded' and approval_status <> 'hidden')
  ) >= event_row.max_total_photos then
    raise exception 'Event photo limit reached' using errcode = 'P0003';
  end if;

  insert into public.photos (
    id, event_id, guest_id, object_key, content_type, size_bytes,
    message, status, is_developed, width_px, height_px, created_at, updated_at
  ) values (
    intent_row.photo_id,
    intent_row.event_id,
    intent_row.guest_id,
    intent_row.object_key,
    intent_row.content_type,
    intent_row.size_bytes,
    left(coalesce(p_message, ''), 500),
    case when event_row.auto_approve_photos then 'approved' else 'pending' end,
    event_row.mode <> 'disposable_camera',
    p_width_px,
    p_height_px,
    now(),
    now()
  )
  returning * into photo_row;

  update public.upload_intents set used = true where photo_id = intent_row.photo_id;
  update public.guests
  set upload_count = upload_count + 1,
      last_seen_at = now()
  where id = guest_row.id;

  return next photo_row;
end;
$$;

revoke all on function public.complete_guest_photo_atomic(text, text, text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.complete_guest_photo_atomic(text, text, text, text, integer, integer)
  to service_role;

create or replace function public.admin_events_snapshot(
  p_session_id text,
  p_query text default '',
  p_status text default ''
)
returns table (
  event jsonb,
  guest_count bigint,
  photo_count bigint,
  pending_photos bigint,
  storage_bytes bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.admin_sessions s
    where s.id = p_session_id
      and s.expires_at > now()
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  return query
  with selected_events as (
    select e.*
    from public.events e
    where e.status <> 'deleted'
      and (p_query = '' or lower(e.name) like ('%' || lower(p_query) || '%') or lower(e.slug) like ('%' || lower(p_query) || '%'))
      and (p_status = '' or e.status = p_status)
  ),
  guest_stats as (
    select g.event_id, count(*) as count
    from public.guests g
    join selected_events e on e.id = g.event_id
    group by g.event_id
  ),
  photo_stats as (
    select
      p.event_id,
      count(*) filter (where p.status <> 'deleted') as count,
      count(*) filter (where p.status = 'pending') as pending,
      coalesce(sum(p.size_bytes) filter (where p.status <> 'deleted'), 0) as bytes
    from public.photos p
    join selected_events e on e.id = p.event_id
    group by p.event_id
  ),
  media_stats as (
    select
      m.event_id,
      count(*) filter (where m.upload_status = 'uploaded' and m.approval_status <> 'hidden') as count,
      count(*) filter (where m.approval_status = 'pending') as pending,
      coalesce(sum(m.file_size) filter (where m.upload_status = 'uploaded' and m.approval_status <> 'hidden'), 0) as bytes
    from public.event_media m
    join selected_events e on e.id = m.event_id
    group by m.event_id
  )
  select
    jsonb_build_object(
      'id', e.id,
      'slug', e.slug,
      'name', e.name,
      'description', e.description,
      'host_message', e.host_message,
      'mode', e.mode,
      'guest_experience', e.guest_experience,
      'status', e.status,
      'starts_at', e.starts_at,
      'ends_at', e.ends_at,
      'reveal_at', e.reveal_at,
      'max_guests', e.max_guests,
      'max_photos_per_guest', e.max_photos_per_guest,
      'max_total_photos', e.max_total_photos,
      'allow_gallery_uploads', e.allow_gallery_uploads,
      'prefer_camera_capture', e.prefer_camera_capture,
      'allow_immediate_gallery', e.allow_immediate_gallery,
      'auto_approve_photos', e.auto_approve_photos,
      'offline_upload_grace_hours', e.offline_upload_grace_hours,
      'created_at', e.created_at,
      'updated_at', e.updated_at
    ),
    coalesce(g.count, 0),
    coalesce(p.count, 0) + coalesce(m.count, 0),
    coalesce(p.pending, 0) + coalesce(m.pending, 0),
    coalesce(p.bytes, 0) + coalesce(m.bytes, 0)
  from selected_events e
  left join guest_stats g on g.event_id = e.id
  left join photo_stats p on p.event_id = e.id
  left join media_stats m on m.event_id = e.id
  order by e.created_at desc;
end;
$$;

revoke all on function public.admin_events_snapshot(text, text, text) from public, anon, authenticated;
grant execute on function public.admin_events_snapshot(text, text, text) to service_role;
