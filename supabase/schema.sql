-- HelloBin: rode este arquivo inteiro no Supabase > SQL Editor > New query > Run

create table public.pastes (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  slug_lower text generated always as (lower(slug)) stored,
  title text not null default 'Sem título',
  content text not null,
  language text not null default 'plaintext',
  tags text[] not null default '{}',
  is_public boolean not null default true,
  is_listed boolean not null default true,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  views bigint not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[A-Za-z0-9_-]{3,64}$'),
  constraint content_size check (char_length(content) between 1 and 200000),
  constraint title_size check (char_length(title) between 1 and 120)
);

-- Unicidade sem diferenciar maiúsculas/minúsculas: "Hello1" e "hello1" são o mesmo link
create unique index pastes_slug_lower_key on public.pastes (slug_lower);
create index pastes_owner_idx on public.pastes (owner_id, created_at desc);
create index pastes_created_idx on public.pastes (created_at desc);

-- updated_at automático
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger pastes_touch before update on public.pastes
  for each row execute function public.touch_updated_at();

-- Limite de criação: no máximo 5 publicações por minuto por usuário
create function public.limit_paste_rate() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.pastes
      where owner_id = new.owner_id and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'rate_limit';
  end if;
  return new;
end $$;
create trigger pastes_rate before insert on public.pastes
  for each row execute function public.limit_paste_rate();

-- Segurança em nível de linha (RLS)
alter table public.pastes enable row level security;

create policy "public read" on public.pastes for select to anon, authenticated
  using (is_public and (expires_at is null or expires_at > now()));
create policy "owner read" on public.pastes for select to authenticated
  using (owner_id = auth.uid());
create policy "owner insert" on public.pastes for insert to authenticated
  with check (owner_id = auth.uid());
create policy "owner update" on public.pastes for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner delete" on public.pastes for delete to authenticated
  using (owner_id = auth.uid());

-- Permissões por coluna (ninguém altera views, dono ou datas pelo cliente)
revoke all on public.pastes from anon, authenticated;
grant select on public.pastes to anon, authenticated;
grant insert (slug, title, content, language, tags, is_public, is_listed, expires_at, owner_id)
  on public.pastes to authenticated;
grant update (slug, title, content, language, tags, is_public, is_listed, expires_at)
  on public.pastes to authenticated;
grant delete on public.pastes to authenticated;

-- Disponibilidade de slug (enxerga também publicações privadas de outros, sem expor dados)
create function public.slug_available(p_slug text, p_exclude uuid default null)
returns boolean language sql security definer set search_path = public as $$
  select not exists (
    select 1 from public.pastes
    where slug_lower = lower(p_slug) and (p_exclude is null or id <> p_exclude)
  );
$$;
grant execute on function public.slug_available(text, uuid) to anon, authenticated;

-- Contador de visualizações (só publicações públicas)
create function public.increment_views(p_slug text) returns void
language sql security definer set search_path = public as $$
  update public.pastes set views = views + 1
  where slug_lower = lower(p_slug) and is_public and (expires_at is null or expires_at > now());
$$;
grant execute on function public.increment_views(text) to anon, authenticated;

-- Listagem pública (busca, recentes, sitemap): só públicas, listadas e não expiradas
create view public.public_listing as
  select id, slug, title, content, language, tags, views, created_at, updated_at
  from public.pastes
  where is_public and is_listed and (expires_at is null or expires_at > now());
grant select on public.public_listing to anon, authenticated;
