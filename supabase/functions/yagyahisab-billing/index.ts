import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://aupadhaya888-ctrl.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const PRICE = 99;
const APP_URL = "https://aupadhaya888-ctrl.github.io/Rayyoka-/yagya-hisab/";

function b64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}
function unb64(s: string) {
  const binary = atob(s);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
async function hmacBase64(message: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))));
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function parseMoney(n: unknown) { return Number(Number(n).toFixed(2)); }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const origin = req.headers.get("origin");
  if (origin && origin !== "https://aupadhaya888-ctrl.github.io") return json({ error: "Origin not allowed" }, 403);

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sign in is required." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Billing backend is not configured yet." }, 503);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Your session is invalid. Please sign in again." }, 401);
  const user = userData.user;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  const action = String(body.action || "");

  if (action === "status") {
    const { data, error } = await admin.from("yagyahisab_subscriptions").select("plan_key,status,started_at,expires_at,provider").eq("user_id", user.id).maybeSingle();
    if (error) return json({ error: "Could not load subscription status." }, 500);
    const active = data?.plan_key === "premium" && data?.status === "active" && !!data?.expires_at && Date.parse(data.expires_at) > Date.now();
    return json({ plan: active ? "premium" : "free", status: active ? "active" : (data?.status || "inactive"), expires_at: data?.expires_at || null, amount_npr: PRICE });
  }

  if (action === "create-payment") {
    const liveEnabled = Deno.env.get("ESEWA_LIVE_ENABLED") === "true";
    const mode = Deno.env.get("ESEWA_MODE") || "test";
    const productCode = Deno.env.get("ESEWA_PRODUCT_CODE") || "";
    const secret = Deno.env.get("ESEWA_SECRET_KEY") || "";
    if (!productCode || !secret) return json({ error: "Payments are not enabled yet. The owner must complete eSewa merchant onboarding and configure server-side test credentials first. No money has been requested." }, 503);
    if (mode === "live" && (!liveEnabled || productCode === "EPAYTEST")) return json({ error: "Live payments are disabled until merchant approval and production credentials are configured." }, 503);
    if (mode !== "test" && mode !== "live") return json({ error: "Invalid payment mode." }, 503);

    const transactionUuid = crypto.randomUUID();
    const { error: insertError } = await admin.from("yagyahisab_payment_orders").insert({
      user_id: user.id, provider: "esewa", amount_npr: PRICE, currency: "NPR", status: "pending", transaction_uuid: transactionUuid,
    });
    if (insertError) return json({ error: "Could not create a payment order." }, 500);

    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signature = await hmacBase64(`total_amount=${PRICE},transaction_uuid=${transactionUuid},product_code=${productCode}`, secret);
    const fields = {
      amount: String(PRICE), tax_amount: "0", total_amount: String(PRICE),
      transaction_uuid: transactionUuid, product_code: productCode,
      product_service_charge: "0", product_delivery_charge: "0",
      success_url: APP_URL + "?payment=success", failure_url: APP_URL + "?payment=failed",
      signed_field_names: signedFieldNames, signature,
    };
    const gateway = mode === "live" ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    return json({ gateway, fields, transaction_uuid: transactionUuid, amount_npr: PRICE, mode });
  }

  if (action === "verify-payment") {
    const encoded = String(body.response_data || "");
    if (!encoded || encoded.length > 12000) return json({ error: "Missing or invalid eSewa response." }, 400);
    let response: Record<string, unknown>;
    try { response = JSON.parse(new TextDecoder().decode(unb64(encoded))); } catch { return json({ error: "Could not read eSewa response." }, 400); }
    const signedNames = String(response.signed_field_names || "").split(",").filter(Boolean);
    const receivedSignature = String(response.signature || "");
    const secret = Deno.env.get("ESEWA_SECRET_KEY") || "";
    const productCode = Deno.env.get("ESEWA_PRODUCT_CODE") || "";
    const mode = Deno.env.get("ESEWA_MODE") || "test";
    if (!secret || !productCode) return json({ error: "Payment verification is not configured yet." }, 503);
    if (!signedNames.length || signedNames.some((k) => !(k in response)) || !receivedSignature) return json({ error: "The payment response is incomplete." }, 400);
    const signedMessage = signedNames.map((key) => key + "=" + String(response[key])).join(",");
    const expected = await hmacBase64(signedMessage, secret);
    if (!safeEqual(expected, receivedSignature)) return json({ error: "The payment signature could not be verified." }, 400);
    const transactionUuid = String(response.transaction_uuid || "");
    const total = parseMoney(response.total_amount);
    if (response.status !== "COMPLETE" || response.product_code !== productCode || total !== PRICE || !transactionUuid) {
      return json({ error: "The returned payment is not a verified completed NPR 99 transaction." }, 400);
    }

    const { data: order, error: orderError } = await admin.from("yagyahisab_payment_orders")
      .select("id,user_id,amount_npr,status,transaction_uuid")
      .eq("transaction_uuid", transactionUuid).eq("user_id", user.id).maybeSingle();
    if (orderError || !order) return json({ error: "This payment order was not found for your account." }, 404);
    if (Number(order.amount_npr) !== PRICE) return json({ error: "Payment amount does not match this order." }, 400);
    if (order.status === "complete") {
      const { data: existing } = await admin.from("yagyahisab_subscriptions").select("plan_key,status,expires_at").eq("user_id", user.id).maybeSingle();
      return json({ ok: true, plan: existing?.plan_key || "free", expires_at: existing?.expires_at || null, already_processed: true });
    }

    const statusUrl = mode === "live" ? "https://epay.esewa.com.np/api/epay/transaction/status/" : "https://uat.esewa.com.np/api/epay/transaction/status/";
    const query = new URLSearchParams({ product_code: productCode, total_amount: String(PRICE), transaction_uuid: transactionUuid });
    let verified: Record<string, unknown>;
    try {
      const statusRes = await fetch(statusUrl + "?" + query.toString(), { headers: { "Accept": "application/json" } });
      verified = await statusRes.json();
      if (!statusRes.ok) return json({ error: "eSewa status check is temporarily unavailable. Please try again." }, 502);
    } catch { return json({ error: "Could not reach eSewa for server-side verification." }, 502); }
    if (verified.status !== "COMPLETE" || verified.transaction_uuid !== transactionUuid || parseMoney(verified.total_amount) !== PRICE || verified.product_code !== productCode) {
      return json({ error: "eSewa has not confirmed this payment as complete." }, 400);
    }

    const now = new Date();
    const { data: current } = await admin.from("yagyahisab_subscriptions").select("expires_at,status,plan_key").eq("user_id", user.id).maybeSingle();
    const currentExpiry = current?.plan_key === "premium" && current.status === "active" && current.expires_at && Date.parse(current.expires_at) > now.getTime() ? new Date(current.expires_at) : now;
    const startsAt = currentExpiry > now ? currentExpiry : now;
    const expiresAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { error: updateOrderError } = await admin.from("yagyahisab_payment_orders").update({
      status: "complete", provider_reference: String(verified.ref_id || response.transaction_code || ""),
      verified_at: now.toISOString(), verification_data: { status: verified.status, transaction_uuid: transactionUuid, total_amount: verified.total_amount, product_code: verified.product_code },
    }).eq("id", order.id).eq("user_id", user.id);
    if (updateOrderError) return json({ error: "Payment verified but order update failed. Contact support with transaction ID " + transactionUuid }, 500);
    const { error: subError } = await admin.from("yagyahisab_subscriptions").upsert({
      user_id: user.id, plan_key: "premium", status: "active", provider: "esewa",
      started_at: startsAt.toISOString(), expires_at: expiresAt.toISOString(), updated_at: now.toISOString(),
    });
    if (subError) return json({ error: "Payment verified but Premium activation needs support. Keep this transaction ID: " + transactionUuid }, 500);
    return json({ ok: true, plan: "premium", expires_at: expiresAt.toISOString() });
  }
  return json({ error: "Unknown billing action." }, 400);
});