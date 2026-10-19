-- Model application profiles and private user-owned image storage.
create table if not exists public.model_profiles (
	user_id uuid primary key references auth.users(id) on delete cascade,
	application jsonb not null,
	status text not null default 'pending' check (status in ('pending', 'live')),
	submitted_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.model_profiles enable row level security;
revoke all on public.model_profiles from anon;
grant select, insert, update, delete on public.model_profiles to authenticated;

drop policy if exists "models read own profile" on public.model_profiles;
create policy "models read own profile" on public.model_profiles
	for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "models create own profile" on public.model_profiles;
create policy "models create own profile" on public.model_profiles
	for insert to authenticated with check ((select auth.uid()) = user_id and status = 'pending');
drop policy if exists "models edit own profile" on public.model_profiles;
create policy "models edit own profile" on public.model_profiles
	for update to authenticated using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);
drop policy if exists "models delete own profile" on public.model_profiles;
create policy "models delete own profile" on public.model_profiles
	for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.protect_model_profile_status()
returns trigger language plpgsql as $$
begin
	if auth.uid() is not null then
		-- Any authenticated user update is an application resubmission; force it
		-- back to review regardless of any client-supplied status value.
		new.status := 'pending';
		new.submitted_at := now();
	end if;
	return new;
end;
$$;
drop trigger if exists protect_model_profile_status on public.model_profiles;
create trigger protect_model_profile_status before update on public.model_profiles
	for each row execute function public.protect_model_profile_status();

-- Uploaded application photos remain private. Browser uploads are confined to
-- the authenticated user's own UUID folder; signed URLs are issued by the API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-photos', 'application-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
	allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "models read own application photos" on storage.objects;
create policy "models read own application photos" on storage.objects
	for select to authenticated using (
		bucket_id = 'application-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
	);
drop policy if exists "models upload own application photos" on storage.objects;
create policy "models upload own application photos" on storage.objects
	for insert to authenticated with check (
		bucket_id = 'application-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
	);
drop policy if exists "models update own application photos" on storage.objects;
create policy "models update own application photos" on storage.objects
	for update to authenticated using (
		bucket_id = 'application-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
	);
drop policy if exists "models delete own application photos" on storage.objects;
create policy "models delete own application photos" on storage.objects
	for delete to authenticated using (
		bucket_id = 'application-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
	);
