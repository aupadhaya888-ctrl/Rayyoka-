drop policy if exists "Users manage own saved calculations" on public.yagyahisab_saved_calculations;
create policy "Premium users manage own saved calculations"
  on public.yagyahisab_saved_calculations for all to authenticated
  using ((select auth.uid()) = user_id and exists (select 1 from public.yagyahisab_subscriptions s where s.user_id = (select auth.uid()) and s.plan_key = 'premium' and s.status = 'active' and s.expires_at > now()))
  with check ((select auth.uid()) = user_id and exists (select 1 from public.yagyahisab_subscriptions s where s.user_id = (select auth.uid()) and s.plan_key = 'premium' and s.status = 'active' and s.expires_at > now()));
drop policy if exists "Users manage own budgets" on public.yagyahisab_budgets;
create policy "Premium users manage own budgets"
  on public.yagyahisab_budgets for all to authenticated
  using ((select auth.uid()) = user_id and exists (select 1 from public.yagyahisab_subscriptions s where s.user_id = (select auth.uid()) and s.plan_key = 'premium' and s.status = 'active' and s.expires_at > now()))
  with check ((select auth.uid()) = user_id and exists (select 1 from public.yagyahisab_subscriptions s where s.user_id = (select auth.uid()) and s.plan_key = 'premium' and s.status = 'active' and s.expires_at > now()));