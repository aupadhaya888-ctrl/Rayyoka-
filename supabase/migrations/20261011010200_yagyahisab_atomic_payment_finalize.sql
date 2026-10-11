create or replace function public.finalize_yagyahisab_payment(
  p_user_id uuid, p_transaction_uuid text, p_provider_reference text, p_verification_data jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_order public.yagyahisab_payment_orders%rowtype;
  v_sub public.yagyahisab_subscriptions%rowtype;
  v_now timestamptz := now();
  v_start timestamptz;
  v_expiry timestamptz;
begin
  select * into v_order from public.yagyahisab_payment_orders where transaction_uuid = p_transaction_uuid and user_id = p_user_id for update;
  if not found then raise exception 'Payment order not found'; end if;
  if v_order.amount_npr <> 99.00 then raise exception 'Payment amount mismatch'; end if;
  if v_order.status = 'complete' then
    select * into v_sub from public.yagyahisab_subscriptions where user_id = p_user_id;
    return jsonb_build_object('ok', true, 'already_processed', true, 'plan', coalesce(v_sub.plan_key, 'free'), 'expires_at', v_sub.expires_at);
  end if;
  if v_order.status <> 'pending' then raise exception 'Payment order is not pending'; end if;
  select * into v_sub from public.yagyahisab_subscriptions where user_id = p_user_id for update;
  if found and v_sub.plan_key = 'premium' and v_sub.status = 'active' and v_sub.expires_at > v_now then v_start := v_sub.expires_at; else v_start := v_now; end if;
  v_expiry := v_start + interval '30 days';
  update public.yagyahisab_payment_orders set status = 'complete', provider_reference = p_provider_reference, verified_at = v_now, verification_data = coalesce(p_verification_data, '{}'::jsonb) where id = v_order.id;
  insert into public.yagyahisab_subscriptions (user_id, plan_key, status, provider, started_at, expires_at, updated_at)
  values (p_user_id, 'premium', 'active', 'esewa', v_start, v_expiry, v_now)
  on conflict (user_id) do update set plan_key = excluded.plan_key, status = excluded.status, provider = excluded.provider, started_at = excluded.started_at, expires_at = excluded.expires_at, updated_at = excluded.updated_at;
  return jsonb_build_object('ok', true, 'already_processed', false, 'plan', 'premium', 'expires_at', v_expiry);
end;
$$;
revoke all on function public.finalize_yagyahisab_payment(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_yagyahisab_payment(uuid, text, text, jsonb) to service_role;