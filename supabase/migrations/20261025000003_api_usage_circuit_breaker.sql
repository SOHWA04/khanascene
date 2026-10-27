-- =============================================================================
-- KhanaScene — Phase 4 API Usage Circuit Breaker (Zero-Cost Until Revenue)
-- =============================================================================
-- Guarantees that live Google Places API (New) requests never exceed Google's
-- free monthly usage allowance (1,000 Enterprise requests/month per SKU).
--
-- Default monthly hard cap is set to 850 (leaving a 150-request safety buffer
-- inside the free tier). Once KhanaScene generates revenue, you can raise
-- `monthly_hard_limit` via a simple UPDATE without redeploying the app.
-- =============================================================================

create table if not exists public.api_usage_counters (
  year_month char(7) not null, -- Format: 'YYYY-MM' in UTC
  sku_key text not null check (
    sku_key in (
      'places_text_search_enterprise',
      'places_details_enterprise',
      'places_nearby_search_enterprise'
    )
  ),
  request_count integer not null default 0 check (request_count >= 0),
  monthly_hard_limit integer not null default 850 check (monthly_hard_limit >= 0),
  updated_at timestamptz not null default now(),
  primary key (year_month, sku_key)
);

alter table public.api_usage_counters enable row level security;

-- Public/authenticated clients can read current aggregate usage status (no secrets)
create policy "Public can read api_usage_counters"
  on public.api_usage_counters
  for select
  using (true);

-- Atomic RPC called by the `places-proxy` Edge Function using service_role.
-- Returns `true` and increments `request_count` ONLY if `request_count < monthly_hard_limit`.
-- Returns `false` without incrementing if the monthly free-tier budget is reached.
create or replace function public.consume_places_quota(
  p_sku_key text,
  p_default_limit integer default 850
)
returns table (
  allowed boolean,
  current_count integer,
  hard_limit integer,
  year_month text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month char(7) := to_char(now() at time zone 'UTC', 'YYYY-MM');
  v_count integer;
  v_limit integer;
begin
  -- Ensure row exists for the current UTC month
  insert into public.api_usage_counters (year_month, sku_key, request_count, monthly_hard_limit)
  values (v_month, p_sku_key, 0, p_default_limit)
  on conflict (year_month, sku_key) do nothing;

  -- Attempt atomic increment only when below hard limit
  update public.api_usage_counters as c
  set request_count = c.request_count + 1,
      updated_at = now()
  where c.year_month = v_month
    and c.sku_key = p_sku_key
    and c.request_count < c.monthly_hard_limit
  returning c.request_count, c.monthly_hard_limit
  into v_count, v_limit;

  if found then
    return query select true, v_count, v_limit, v_month::text;
  else
    select c.request_count, c.monthly_hard_limit
    into v_count, v_limit
    from public.api_usage_counters as c
    where c.year_month = v_month
      and c.sku_key = p_sku_key;

    return query select false, coalesce(v_count, p_default_limit), coalesce(v_limit, p_default_limit), v_month::text;
  end if;
end;
$$;

revoke all on function public.consume_places_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_places_quota(text, integer) to service_role;
