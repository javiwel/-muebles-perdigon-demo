-- Propuesta inicial: aplicar en un proyecto de pruebas y validar con JWT reales antes de producción.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id),
 name text not null check (name in ('Mariluz','Miguel padre','Miguel','Emilio')),
 can_delete boolean not null default false,
 constraint deletion_role check (not can_delete or name = 'Mariluz')
);
create table public.jobs (
 id uuid primary key default gen_random_uuid(),
 client text not null default '', phone text not null default '', address text not null default '',
 store text not null default 'Tienda 1 · Centro' check (store in ('Tienda 1 · Centro','Tienda 2 · Norte','Tienda 3 · Sur')),
 type text not null default 'Entrega' check (type in ('Entrega','Montaje','Reparación','Incidencia','Recogida','Instalación de cocina','Fontanería','Aire acondicionado')),
 description text not null default '', availability text not null default '',
 duration integer not null default 60 check (duration >= 15),
 crew integer not null default 1 check (crew between 1 and 4),
 assigned text[] not null default '{}' check (assigned <@ array['Mariluz','Miguel padre','Miguel','Emilio']::text[]),
 status text not null default 'Nuevo' check (status in ('Nuevo','Pendiente de programar','Programado','En curso','Esperando material','Realizado','Cancelado')),
 date date, time time, priority boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (status <> 'Programado' or (date is not null and time is not null))
);
create index jobs_date_idx on public.jobs(date);
create index jobs_status_idx on public.jobs(status);
create table public.job_events (
 id uuid primary key default gen_random_uuid(), job_id uuid not null,
 actor_id uuid not null, actor_name text not null, action text not null,
 at timestamptz not null default now(), before_data jsonb, after_data jsonb
);
-- No FK a jobs: se conserva la auditoría después de eliminar.
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
create policy own_profile on public.profiles for select to authenticated using (id = auth.uid());
-- No políticas de escritura para perfiles: solo administración de confianza.
create policy members_read on public.jobs for select to authenticated using (exists(select 1 from public.profiles where id = auth.uid()));
create policy members_insert on public.jobs for insert to authenticated with check (exists(select 1 from public.profiles where id = auth.uid()));
create policy members_update on public.jobs for update to authenticated using (exists(select 1 from public.profiles where id = auth.uid())) with check (exists(select 1 from public.profiles where id = auth.uid()));
create policy mariluz_delete on public.jobs for delete to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and can_delete and name = 'Mariluz'));
create policy members_audit on public.job_events for select to authenticated using (exists(select 1 from public.profiles where id = auth.uid()));
create function public.audit_job() returns trigger language plpgsql security definer set search_path = '' as $$
declare actor_name text;
begin
 select name into actor_name from public.profiles where id = auth.uid();
 if actor_name is null then raise exception 'Perfil autorizado requerido'; end if;
 insert into public.job_events(job_id,actor_id,actor_name,action,before_data,after_data)
 values(case when TG_OP='DELETE' then OLD.id else NEW.id end,auth.uid(),actor_name,TG_OP,
 case when TG_OP='INSERT' then null else to_jsonb(OLD) end,
 case when TG_OP='DELETE' then null else to_jsonb(NEW) end);
 return null;
end; $$;
revoke all on function public.audit_job() from public;
create trigger audit_jobs after insert or update or delete on public.jobs for each row execute function public.audit_job();
create function public.touch_job() returns trigger language plpgsql set search_path = '' as $$ begin NEW.updated_at = now(); return NEW; end; $$;
create trigger touch_jobs before update on public.jobs for each row execute function public.touch_job();
revoke all on public.profiles, public.jobs, public.job_events from anon;
revoke all on public.profiles, public.jobs, public.job_events from authenticated;
grant select on public.profiles, public.job_events to authenticated;
grant select,insert,update,delete on public.jobs to authenticated;
revoke insert,update,delete,truncate on public.profiles, public.job_events from authenticated;
commit;
