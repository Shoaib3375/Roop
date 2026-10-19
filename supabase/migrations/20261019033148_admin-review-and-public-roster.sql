-- Staff review role is assigned only through Supabase Auth app_metadata.
-- Never use user_metadata for authorization: users can edit that themselves.
alter table public.model_profiles drop constraint if exists model_profiles_status_check;
alter table public.model_profiles add constraint model_profiles_status_check
	check (status in ('pending', 'live', 'rejected'));

drop policy if exists "models read own profile" on public.model_profiles;
create policy "models read own profile" on public.model_profiles
	for select to authenticated using (
		(select auth.uid()) = user_id
		or (select auth.jwt()->'app_metadata'->>'role') = 'admin'
	);
drop policy if exists "models edit own profile" on public.model_profiles;
create policy "models edit own profile" on public.model_profiles
	for update to authenticated using (
		(select auth.uid()) = user_id
		or (select auth.jwt()->'app_metadata'->>'role') = 'admin'
	) with check (
		(select auth.uid()) = user_id
		or (select auth.jwt()->'app_metadata'->>'role') = 'admin'
	);

create or replace function public.protect_model_profile_status()
returns trigger language plpgsql as $$
begin
	if coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'admin' then
		new.status := 'pending';
		new.submitted_at := now();
	end if;
	return new;
end;
$$;

-- This view deliberately exposes only the fields needed for public rosters.
-- Legal name, DOB, email, phone, guardian details, and consent flags stay private.
create or replace view public.public_model_profiles with (security_barrier = true) as
select
	user_id as profile_id,
	jsonb_build_object(
		'name', coalesce(nullif(application->>'stage', ''), 'New face'),
		'board', application->>'board',
		'city', application->>'city',
		'age', case
			when application->>'dob' ~ '^\d{4}-\d{2}-\d{2}$' then
				date_part('year', age(current_date, (application->>'dob')::date))::integer
			else null
		end,
		'h', coalesce(nullif(application->>'h', '')::numeric, 0),
		'bust', coalesce(nullif(application->>'bust', '')::numeric, 0),
		'waist', coalesce(nullif(application->>'waist', '')::numeric, 0),
		'hips', coalesce(nullif(application->>'hips', '')::numeric, 0),
		'shoe', coalesce(nullif(application->>'shoe', '')::numeric, 0),
		'hair', application->>'hair',
		'eyes', application->>'eyes',
		'langs', coalesce(application->'langs', '[]'::jsonb),
		'ig', regexp_replace(coalesce(application->>'ig', ''), '^@', ''),
		'bio', coalesce(application->>'bio', ''),
		'exp', coalesce(application->'exp', '[]'::jsonb),
		'photos', coalesce(application->'photos', '{}'::jsonb),
		'portfolio', coalesce(application->'portfolio', '[]'::jsonb),
		'isNew', jsonb_array_length(coalesce(application->'exp', '[]'::jsonb)) = 0
	) as model
from public.model_profiles
where status = 'live';

revoke all on public.public_model_profiles from public;
grant select on public.public_model_profiles to anon, authenticated;

-- Allow public signed-URL creation only for image objects referenced by a live
-- profile. The private bucket is not made public.
create or replace function public.is_live_model_photo(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
	select exists (
		select 1
		from public.model_profiles p
		where p.status = 'live'
			and (
				exists (
					select 1 from jsonb_each(coalesce(p.application->'photos', '{}'::jsonb)) photo
					where photo.value #>> '{}' = object_name
				)
				or exists (
					select 1 from jsonb_array_elements_text(coalesce(p.application->'portfolio', '[]'::jsonb)) portfolio(path)
					where portfolio.path = object_name
				)
			)
	);
$$;
revoke all on function public.is_live_model_photo(text) from public;
grant execute on function public.is_live_model_photo(text) to anon, authenticated;

drop policy if exists "public may read approved model photos" on storage.objects;
create policy "public may read approved model photos" on storage.objects
	for select to anon, authenticated using (
		bucket_id = 'application-photos' and public.is_live_model_photo(name)
	);
drop policy if exists "admins may review application photos" on storage.objects;
create policy "admins may review application photos" on storage.objects
	for select to authenticated using (
		bucket_id = 'application-photos'
		and (select auth.jwt()->'app_metadata'->>'role') = 'admin'
	);
