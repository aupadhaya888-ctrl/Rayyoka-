# YagyaHisab monetization foundation

## Product and launch mode
- Website / installable PWA first.
- Free calculators; advertising remains off until ad-network approval and privacy controls are completed.
- Premium: NPR 99 per 30 days, manual renewal at first.
- Payment provider: eSewa.
- Live payment mode is disabled by default; do not set live credentials until eSewa merchant approval.

## Supabase database
Migrations are stored in `supabase/migrations/` and have been applied to project `wmlgqqfnhdqlssavnklo`:
- `yagyahisab_subscriptions`: trusted server-managed entitlements.
- `yagyahisab_payment_orders`: pending/verified payment orders, fixed NPR 99 amount.
- `yagyahisab_saved_calculations`: Premium cloud history.
- `yagyahisab_budgets`: Premium budgets.
- `finalize_yagyahisab_payment(...)`: atomic, idempotent payment finalization, executable only by service_role.

RLS is enabled on all four tables. Browser users cannot insert/update subscription or payment records. Cloud history and budget operations require an active, unexpired Premium entitlement as well as ownership. Do not put Supabase secret/service-role keys in the browser or GitHub.

## Edge Function
Source: `supabase/functions/yagyahisab-billing/index.ts`
Deployed function: `yagyahisab-billing` (JWT verification enabled).
Actions:
- `status`: returns Free/Premium status from the server.
- `create-payment`: creates a fixed NPR 99 eSewa order and signature, but fails closed unless server-side credentials exist.
- `verify-payment`: validates the signed response, checks transaction status with eSewa, then calls the atomic finalization RPC.

## Secrets (Supabase Dashboard → Edge Functions → Secrets)
For UAT only, set secrets from the official eSewa developer dashboard/docs:
- `ESEWA_MODE=test`
- `ESEWA_PRODUCT_CODE=EPAYTEST`
- `ESEWA_SECRET_KEY=<test secret>`

Do not send credentials in chat and do not commit them. Production must remain disabled until eSewa approves the merchant and supplies production credentials. Only then, after successful UAT and review, configure `ESEWA_MODE=live`, the production product code and secret, and explicitly set `ESEWA_LIVE_ENABLED=true`.

## Current UI
- Upgrade/status panel is integrated.
- Payment return handling is integrated and only activates Premium after server verification.
- Saved history, budget entry/list, loan comparison and print/save-as-PDF tools are integrated into the Premium panel.
- Ads are intentionally not loaded yet. The ad slot is hidden until the site is approved and privacy/consent requirements are completed.

## Remaining launch blockers
1. Test the eSewa UAT checkout end-to-end with official test credentials configured as Supabase secrets.
2. Confirm current eSewa V2 status API response and signature format for the merchant's exact integration.
3. Add an authenticated payment-reconciliation/support path for customers who pay but close the browser before returning.
4. Complete privacy, terms, refund policy, support contact and applicable Nepal business/tax disclosures.
5. Apply for an ad network and implement required consent/ads settings only after approval.
6. Test Free/Premium boundaries, expired entitlements, RLS cross-account isolation, duplicate returns, refunds, offline behavior and account deletion.

This is a staged foundation, not permission to accept live payments today.
