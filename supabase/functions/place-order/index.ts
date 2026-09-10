// GameVault — demo order endpoint.
// Prices and totals are always recalculated here from the products table.
// Nothing the browser sends about money is trusted.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHIPPING_FEE_MINOR = 4900; // 49 kr, charged once per order containing physical items
const MAX_LINES = 20;

interface IncomingItem {
  sku?: unknown;
  quantity?: unknown;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function orderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `GV-${code}`;
}

function orderPayload(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  return {
    orderReference: order.order_reference,
    createdAt: order.created_at,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    requiresShipping: order.requires_shipping,
    address: order.requires_shipping
      ? {
          street: order.street_address,
          postalCode: order.postal_code,
          city: order.city,
          country: order.country,
        }
      : null,
    subtotalMinor: order.subtotal_minor,
    shippingMinor: order.shipping_minor,
    totalMinor: order.total_minor,
    currency: order.currency,
    status: order.status,
    items: items.map((i) => ({
      sku: i.sku,
      title: i.title,
      platform: i.platform,
      format: i.format,
      quantity: i.quantity,
      unitPriceMinor: i.unit_price_minor,
      lineTotalMinor: i.line_total_minor,
    })),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Invalid request body." }, 400);

    const idempotencyKey = str(body.idempotencyKey, 100);
    if (!idempotencyKey) return json({ error: "Missing order key." }, 400);

    // Repeated submission of the same order returns the original order instead of creating a duplicate.
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing) {
      const { data: existingItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", existing.id);
      return json({ order: orderPayload(existing, existingItems ?? []), duplicate: true });
    }

    const customer = (body.customer ?? {}) as Record<string, unknown>;
    const name = str(customer.name, 120);
    const email = str(customer.email, 200).toLowerCase();
    const phone = str(customer.phone, 40);

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Please enter your full name.";
    if (!isEmail(email)) errors.email = "Please enter a valid email address.";

    const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
    if (rawItems.length === 0) return json({ error: "Your cart is empty." }, 400);
    if (rawItems.length > MAX_LINES) return json({ error: "Too many different items in one order." }, 400);

    const requested = new Map<string, number>();
    for (const item of rawItems) {
      const sku = str(item.sku, 60);
      const quantity = Number(item.quantity);
      if (!sku || !Number.isInteger(quantity) || quantity < 1) {
        return json({ error: "One of the items in your cart is invalid." }, 400);
      }
      requested.set(sku, (requested.get(sku) ?? 0) + quantity);
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("sku,title,platform,format,price_minor,available,max_per_order")
      .in("sku", [...requested.keys()]);

    if (productError) throw productError;

    const lines: Record<string, unknown>[] = [];
    for (const [sku, quantity] of requested) {
      const product = products?.find((p) => p.sku === sku);
      if (!product) return json({ error: `We no longer sell ${sku}. Please remove it from your cart.` }, 400);
      if (!product.available) {
        return json({ error: `${product.title} is currently unavailable. Please remove it from your cart.` }, 400);
      }
      if (quantity > product.max_per_order) {
        return json({ error: `You can order at most ${product.max_per_order} × ${product.title}.` }, 400);
      }
      lines.push({
        sku: product.sku,
        title: product.title,
        platform: product.platform,
        format: product.format,
        quantity,
        unit_price_minor: product.price_minor,
        line_total_minor: product.price_minor * quantity,
      });
    }

    const requiresShipping = lines.some((l) => l.format === "physical");
    let street = "";
    let postalCode = "";
    let city = "";

    if (requiresShipping) {
      street = str(customer.street, 200);
      postalCode = str(customer.postalCode, 20);
      city = str(customer.city, 100);
      if (street.length < 3) errors.street = "Please enter your street address.";
      if (!/^\d{3}\s?\d{2}$/.test(postalCode)) errors.postalCode = "Enter a 5-digit Swedish postal code.";
      if (city.length < 2) errors.city = "Please enter your city.";
    }

    if (Object.keys(errors).length > 0) {
      return json({ error: "Please check the highlighted fields.", fieldErrors: errors }, 400);
    }

    const subtotalMinor = lines.reduce((sum, l) => sum + (l.line_total_minor as number), 0);
    const shippingMinor = requiresShipping ? SHIPPING_FEE_MINOR : 0;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_reference: orderReference(),
        idempotency_key: idempotencyKey,
        customer_name: name,
        customer_email: email,
        phone: phone || null,
        street_address: requiresShipping ? street : null,
        postal_code: requiresShipping ? postalCode : null,
        city: requiresShipping ? city : null,
        country: "Sweden",
        requires_shipping: requiresShipping,
        subtotal_minor: subtotalMinor,
        shipping_minor: shippingMinor,
        total_minor: subtotalMinor + shippingMinor,
        currency: "SEK",
        status: "demo_saved",
      })
      .select()
      .single();

    if (orderError) {
      // A racing duplicate submission hit the unique key — return the stored order.
      if (orderError.code === "23505") {
        const { data: dupe } = await supabase
          .from("orders")
          .select("*")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (dupe) {
          const { data: dupeItems } = await supabase.from("order_items").select("*").eq("order_id", dupe.id);
          return json({ order: orderPayload(dupe, dupeItems ?? []), duplicate: true });
        }
      }
      throw orderError;
    }

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })))
      .select();

    if (itemsError) {
      // Keep it all-or-nothing: no order should exist without its items.
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return json({ order: orderPayload(order, insertedItems ?? []), duplicate: false });
  } catch (error) {
    console.error("place-order failed:", error);
    return json({ error: "We couldn’t save your order. Please try again." }, 500);
  }
});
