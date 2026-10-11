# YagyaHisab monetization foundation

## Current configuration
- Product: YagyaHisab website/PWA
- Free + ads (ads are intentionally not enabled until approval)
- Premium: NPR 99 / 30 days, manual renewal
- First payment provider: eSewa
- Live payment mode is disabled by default.

## Supabase database
Migration applied to project `wmlgqqfnhdqlssavnklo`:
- `yagyahisab_subscriptions`
- `yagyahisab_payment_orders`
- `yagyahisab_saved_calculations`
- `yagyahisab_budgets`

Subscription/payment tables are read-only to authenticated browser clients; trusted backend code performs payment/order/subscription writes. Saved calculations and budgets use user ownership RLS. Migration source: `supabase/migrations/20261011_yagyahisab_monetization_foundation.sql`.

## Billing Edge Function
Function source: `supabase/functions/yagyahisab-billing/index.ts`.
Actions: `status`, `create-payment`, `verify-payment`.
The function is designed to fail closed when eSewa credentials are missing. It never trusts the browser's success redirect alone: it validates the signed response and queries eSewa status before activating a 30-day entitlement.

### Required Edge Function secrets
Do not put these in HTML, GitHub, or any public repository:
- `ESEWA_MODE=test`
- `ESEWA_PRODUCT_CODE=EPAYTEST` (for eSewa UAT only)
- `ESEWA_SECRET_KEY=<merchant/UAT secret>`

Production must not be enabled until eSewa approves the merchant and issues production credentials:
- `ESEWA_MODE=live`
- `ESEWA_PRODUCT_CODE=<production product code>`
- `ESEWA_SECRET_KEY=<production secret>`
- `ESEWA_LIVE_ENABLED=true` only after explicit go-live checks.

Use Supabase Dashboard > Edge Functions > Secrets or Supabase CLI secrets. Never commit secret values. Test credentials should be configured only in Supabase secrets. Live payment creation returns a disabled/not-configured response until the required variables exist.

## Important launch blockers
1. Complete merchant onboarding and verify the current eSewa V2 integration/status API requirements against the merchant documentation.
2. Finish the frontend Upgrade UI and payment return handler, then test end-to-end in UAT.
3. Complete the Premium entitlement checks in the app. Browser UI is convenience only; protect cloud data with RLS and server checks.
4. Advertising is intentionally not connected. Apply for approval and implement provider-required consent/privacy controls before showing ads.
5. Complete privacy, terms, refund, support contact, tax and business disclosures.
6. Test renewal, expiration, refunds, duplicate callbacks, failed payments, stale/offline sessions and account deletion.

This is a staged implementation foundation, not a statement that the app is ready to collect live money.
