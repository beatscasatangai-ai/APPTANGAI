create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  kind text not null check (kind in ('donation', 'redemption')),
  amount_eur numeric(12, 2),
  points bigint not null,
  description text,
  created_at timestamptz not null default now(),
  constraint wallet_transactions_amount_points_check check (
    (kind = 'donation' and amount_eur is not null and amount_eur > 0 and points > 0)
    or (kind = 'redemption' and amount_eur is null and points < 0)
  ),
  constraint wallet_transactions_description_check check (
    description is null or length(trim(description)) between 1 and 200
  )
);

create index if not exists wallet_transactions_member_created_idx
  on public.wallet_transactions (member_id, created_at desc);

create table if not exists public.wallet_products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 1 and 100),
  points bigint not null check (points > 0),
  active boolean not null default true
);

alter table public.wallet_products enable row level security;
revoke all on public.wallet_products from public, anon, authenticated;
grant select on public.wallet_products to authenticated;

drop policy if exists "Approved members can read active wallet products"
  on public.wallet_products;
create policy "Approved members can read active wallet products"
  on public.wallet_products
  for select
  to authenticated
  using (active and (select public.is_approved_member()));

alter table public.wallet_transactions enable row level security;

revoke all on public.wallet_transactions from public, anon, authenticated;
grant select on public.wallet_transactions to authenticated;

create or replace function public.is_approved_wallet_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'approved'
      and role in ('staff', 'admin')
  );
$$;

revoke all on function public.is_approved_wallet_operator() from public, anon;
grant execute on function public.is_approved_wallet_operator() to authenticated;

create or replace function public.search_approved_members(p_query text)
returns table (member_id uuid, full_name text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_approved_wallet_operator() then
    raise exception 'Only approved staff can search members';
  end if;
  if length(trim(coalesce(p_query, ''))) < 2 then
    raise exception 'Enter at least two characters to search';
  end if;

  return query
    select id, profiles.full_name
    from public.profiles
    where status = 'approved'
      and role = 'member'
      and full_name is not null
      and strpos(lower(full_name), lower(trim(p_query))) > 0
    order by full_name, id
    limit 20;
end;
$$;

revoke all on function public.search_approved_members(text) from public, anon;
grant execute on function public.search_approved_members(text) to authenticated;

drop policy if exists "Members and operators can read wallet transactions"
  on public.wallet_transactions;
create policy "Members and operators can read wallet transactions"
  on public.wallet_transactions
  for select
  to authenticated
  using (
    (select auth.uid()) = member_id
    or (select public.is_approved_wallet_operator())
  );

create or replace function public.get_wallet_balance(p_member_id uuid default null)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_member_id uuid := coalesce(p_member_id, auth.uid());
  v_status text;
  v_role text;
begin
  if v_actor_id is null or v_member_id is null then
    raise exception 'Authentication is required';
  end if;

  if v_member_id <> v_actor_id
     and not public.is_approved_wallet_operator() then
    raise exception 'Not authorized to read this wallet';
  end if;

  select status, role
    into v_status, v_role
    from public.profiles
    where id = v_member_id;

  if v_status is distinct from 'approved' or v_role is distinct from 'member' then
    raise exception 'An approved member profile is required';
  end if;

  return coalesce(
    (select sum(points) from public.wallet_transactions where member_id = v_member_id),
    0
  );
end;
$$;

revoke all on function public.get_wallet_balance(uuid) from public, anon;
grant execute on function public.get_wallet_balance(uuid) to authenticated;

create or replace function public.calculate_donation_points(p_amount_eur numeric)
returns bigint
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_multiplier numeric;
begin
  if p_amount_eur is null or p_amount_eur <= 0 then
    raise exception 'Donation amount must be positive' using errcode = '22023';
  end if;
  if p_amount_eur <> round(p_amount_eur, 2) then
    raise exception 'Donation amounts must use whole euro cents' using errcode = '22023';
  end if;

  v_multiplier := case
    when p_amount_eur < 5 then 1
    when p_amount_eur < 10 then 1.1
    when p_amount_eur < 20 then 1.2
    when p_amount_eur <= 50 then 1.3
    else 1.5
  end;

  return round(p_amount_eur * 100 * v_multiplier)::bigint;
end;
$$;

revoke all on function public.calculate_donation_points(numeric) from public, anon;
grant execute on function public.calculate_donation_points(numeric) to authenticated;

create or replace function public.record_donation(
  p_member_id uuid,
  p_amount_eur numeric,
  p_description text default null
)
returns table (transaction_id uuid, points_awarded bigint, current_balance bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_member_status text;
  v_member_role text;
  v_points bigint;
  v_transaction_id uuid;
  v_balance bigint;
begin
  if v_actor_id is null or not public.is_approved_wallet_operator() then
    raise exception 'Only approved staff can record donations';
  end if;
  if p_member_id is null or p_amount_eur is null or p_amount_eur <= 0 then
    raise exception 'A member and a positive donation amount are required';
  end if;
  if p_amount_eur <> round(p_amount_eur, 2) then
    raise exception 'Donation amounts must use whole euro cents';
  end if;
  if p_description is not null
     and length(trim(p_description)) not between 1 and 200 then
    raise exception 'Description must contain between 1 and 200 characters';
  end if;

  select status, role
    into v_member_status, v_member_role
    from public.profiles
    where id = p_member_id
    for update;

  if v_member_status is distinct from 'approved'
     or v_member_role is distinct from 'member' then
    raise exception 'An approved member profile is required';
  end if;

  v_points := public.calculate_donation_points(p_amount_eur);

  insert into public.wallet_transactions (
    member_id, actor_id, kind, amount_eur, points, description
  )
  values (
    p_member_id, v_actor_id, 'donation', p_amount_eur, v_points,
    nullif(trim(p_description), '')
  )
  returning id into v_transaction_id;

  select coalesce(sum(points), 0)
    into v_balance
    from public.wallet_transactions
    where member_id = p_member_id;

  return query select v_transaction_id, v_points, v_balance;
end;
$$;

revoke all on function public.record_donation(uuid, numeric, text) from public, anon;
grant execute on function public.record_donation(uuid, numeric, text) to authenticated;

create or replace function public.redeem_product(
  p_member_id uuid,
  p_product_id uuid
)
returns table (
  transaction_id uuid,
  product_name text,
  points_redeemed bigint,
  current_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_member_status text;
  v_member_role text;
  v_product_name text;
  v_points bigint;
  v_balance bigint;
  v_transaction_id uuid;
begin
  if v_actor_id is null or not public.is_approved_wallet_operator() then
    raise exception 'Only approved staff can record redemptions';
  end if;
  if p_member_id is null or p_product_id is null then
    raise exception 'A member and a product are required';
  end if;

  select status, role
    into v_member_status, v_member_role
    from public.profiles
    where id = p_member_id
    for update;

  if v_member_status is distinct from 'approved'
     or v_member_role is distinct from 'member' then
    raise exception 'An approved member profile is required';
  end if;

  select name, points
    into v_product_name, v_points
    from public.wallet_products
    where id = p_product_id
      and active
    for share;

  if not found then
    raise exception 'The selected product is not available';
  end if;

  select coalesce(sum(points), 0)
    into v_balance
    from public.wallet_transactions
    where member_id = p_member_id;

  if v_points > v_balance then
    raise exception 'Insufficient points: balance is %, requested %', v_balance, v_points;
  end if;

  insert into public.wallet_transactions (
    member_id, actor_id, kind, points, description
  )
  values (
    p_member_id, v_actor_id, 'redemption', -v_points, v_product_name
  )
  returning id into v_transaction_id;

  return query select v_transaction_id, v_product_name, v_points, v_balance - v_points;
end;
$$;

revoke all on function public.redeem_product(uuid, uuid) from public, anon;
grant execute on function public.redeem_product(uuid, uuid) to authenticated;
