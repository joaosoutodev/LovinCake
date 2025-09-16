// supabase/functions/checkout/index.ts
// Edge Function: valida reCAPTCHA e cria encomenda em "orders".

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type OrderLine = { id: number | string; name: string; price: number; qty: number };
type Shipping = { address?: string; city?: string; zip?: string };
type CheckoutPayload = {
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  shipping: Shipping | null;
  status: string; // "created"
  total: number;
  lines: OrderLine[];
  token: string; // reCAPTCHA token
};

function cors(origin: string | null) {
  // Se quiseres restringir, troca "*" por uma whitelist que inclua o teu domínio local/prod.
  const allowOrigin = origin ?? "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(obj: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors(origin),
    },
  });
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  // 🔑 CORS preflight SEM autenticação
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(origin) });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    const body = (await req.json()) as CheckoutPayload;

    // ---- validações mínimas
    if (!body || !Array.isArray(body.lines) || body.lines.length === 0) {
      return json({ error: "Invalid payload: lines required" }, 400, origin);
    }
    if (!body.user_id && !body.guest_email) {
      return json({ error: "Provide user_id or guest_email for guest checkout" }, 400, origin);
    }
    if (!Number.isFinite(body.total) || body.total < 0) {
      return json({ error: "Invalid total" }, 400, origin);
    }
    if (!body.token) {
      return json({ error: "Missing reCAPTCHA token" }, 400, origin);
    }

    // ---- reCAPTCHA ----
    const RECAPTCHA_SECRET = Deno.env.get("RECAPTCHA_SECRET");
    if (!RECAPTCHA_SECRET) {
      return json({ error: "Missing RECAPTCHA_SECRET" }, 500, origin);
    }

    const form = new URLSearchParams();
    form.set("secret", RECAPTCHA_SECRET);
    form.set("response", body.token);

    const rcRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: form,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!rcRes.ok) {
      return json({ error: "reCAPTCHA request failed" }, 502, origin);
    }
    const rcJson = await rcRes.json();
    if (!rcJson.success) {
      return json({ error: "reCAPTCHA verification failed" }, 400, origin);
    }

    // ---- Supabase (service role) ----
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500, origin);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // token de encomenda
    const order_token = crypto.randomUUID();

    // normaliza linhas
    const lines = body.lines.map((li) => ({
      id: typeof li.id === "string" ? Number(li.id) || li.id : li.id,
      name: String(li.name ?? ""),
      price: Number(li.price) || 0,
      qty: Number(li.qty) || 0,
    }));

    const insertPayload = {
      user_id: body.user_id,
      guest_email: body.user_id ? null : body.guest_email,
      guest_name: body.user_id ? null : (body.guest_name || null),
      shipping: body.user_id ? null : (body.shipping || null),
      status: body.status || "created",
      total: Number(body.total) || 0,
      lines, // JSONB
      order_token,
    };

    const { error: dbErr } = await supabase.from("orders").insert(insertPayload);
    if (dbErr) {
      console.error("DB insert error:", dbErr);
      return json({ error: dbErr.message }, 500, origin);
    }

    return json({ ok: true, order_token }, 200, origin);
  } catch (err) {
    console.error("checkout edge error:", err);
    return json({ error: "Unexpected error" }, 500, origin);
  }
});
