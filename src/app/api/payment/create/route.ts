import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { CartLine } from "@/types/cart";

const GATEWAY_URL = process.env.MUADATA_GATEWAY_URL ?? "";
const API_USER = process.env.MUADATA_API_USER ?? "";
const PRIVATE_KEY = process.env.MUADATA_PRIVATE_KEY ?? "";
const WEBSITE = process.env.MUADATA_WEBSITE ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bucke-clothing.vercel.app";
const SITE_B_URL = process.env.MUADATA_SITE_B_URL ?? "https://fretwellmusic.live";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { lines: CartLine[]; orderId: string; paymentMethod?: string; customer?: Customer; ip?: string; userAgent?: string; shippingCents?: number; shippingName?: string };
  const { lines, orderId, paymentMethod, customer } = body;
  // Shipping cost — passed from the checkout UI; defaults to 0 for free standard shipping.
  const shippingCents = Number.isFinite(body.shippingCents) ? Math.max(0, Math.floor(body.shippingCents as number)) : 0;
  const shippingName = typeof body.shippingName === "string" && body.shippingName.trim() ? body.shippingName.trim() : "Shipping";

  // Single payment button → always nolimit. Muadata auto-routes to whichever
  // processor account is eligible/weighted in the Bucke-Fretwell payment group.
  // (The old "stripe" button that forced pay=stripe was removed — pay=stripe is a
  // category hint, not a reliable account selector, so it routed unpredictably.)
  const pay = "nolimit";
  void paymentMethod;

  // Customer IP — Muadata's own priority order: CF-Connecting-IP, then first
  // X-Forwarded-For hop, then REMOTE_ADDR (closest Next.js equivalent: x-real-ip).
  const ip =
    body.ip ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";

  const userAgent = body.userAgent || req.headers.get("user-agent") || "Mozilla/5.0";

  // Language — first tag of Accept-Language (e.g. "en-US,en;q=0.9" -> "en-US"), fallback "en-US"
  const lan = req.headers.get("accept-language")?.split(",")[0]?.trim() || "en-US";

  // Require real customer data — do NOT fall back to generic values.
  // Sending "Guest Customer" / "123 Main St" to Stripe is a fingerprint for
  // generic cashier scripts and triggers Stripe's "thin customer data" fraud flag.
  if (!customer || !customer.email || !customer.firstName || !customer.lastName || !customer.address1 || !customer.city || !customer.state || !customer.zip || !customer.country) {
    console.error("[payment/create] missing customer data:", customer);
    return Response.json({ error: "Customer information is required." }, { status: 400 });
  }
  const c: Customer = customer;

  // Field names below match Muadata's documented "custom API" integration exactly
  // (order_currency / order_amount / order_product / sign / pay values of
  // stripe|paypal|nolimit, reorder, jump) — NOT the Site-B relay's internal
  // include/pay/*.php filenames, which are a different, unrelated vocabulary.
  const orderCurrency = "USD";
  const subtotalCents = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalCents = subtotalCents + shippingCents;
  const orderAmount = (totalCents / 100).toFixed(2);

  const orderProduct = lines.map((l) => ({
    name: l.name,
    model: l.slug,
    price: (l.price / 100).toFixed(2),
    quantity: l.quantity,
    option: [
      { name: "Color", value: l.colorName },
      { name: "Size", value: l.size },
    ],
    weight: 0,
    products_image: "",
  }));

  // Append shipping as its own line item so it appears on the Stripe receipt
  // + Muadata's order dashboard, not just rolled into the total.
  if (shippingCents > 0) {
    orderProduct.push({
      name: shippingName,
      model: "shipping",
      price: (shippingCents / 100).toFixed(2),
      quantity: 1,
      option: [],
      weight: 0,
      products_image: "",
    });
  }

  // sign = MD5(api_user + PrivateKey + order_currency + order_amount + order_id)
  const sign = md5(API_USER + PRIVATE_KEY + orderCurrency + orderAmount + orderId);
  // vt = MD5(order_id + PrivateKey) — goes only in the notify URL's query string
  const vt = md5(orderId + PRIVATE_KEY);

  const params = new URLSearchParams({
    order_id: orderId,
    order_currency: orderCurrency,
    order_amount: orderAmount,
    order_product: JSON.stringify(orderProduct),
    pay,
    api_user: API_USER,
    website: WEBSITE,
    sign,
    ip,
    lan,
    user_agent: userAgent,
    billing_first_name: c.firstName,
    billing_last_name: c.lastName,
    billing_email: c.email,
    billing_phone: c.phone,
    billing_address1: c.address1,
    billing_city: c.city,
    billing_state: c.state,
    billing_zip: c.zip,
    billing_country: c.country,
    shipping_first_name: c.firstName,
    shipping_last_name: c.lastName,
    shipping_email: c.email,
    shipping_phone: c.phone,
    shipping_address1: c.address1,
    shipping_city: c.city,
    shipping_state: c.state,
    shipping_zip: c.zip,
    shipping_country: c.country,
    // Append ?back=<Bucke URL> so the Site B (Fretwell, Tilecraft, or any
    // future Site B in rotation) knows where to send the customer back.
    // See MUADATA-INTEGRATION-GUIDE.md Section 17 Phase 3 / Phase 7 — the
    // multi-tenant Site B pattern: each Site A passes its own confirmation
    // URL via ?back=, the Site B validates the host against its allowlist
    // (.private_data/allowed_sitea.php) and redirects. Each Site B's admin
    // must add `bucke-clothing.vercel.app` (or whatever SITE_URL resolves
    // to in production) to its allowlist for the redirect to fire — otherwise
    // the customer stays on the Site B's own confirmation page.
    order_return_uri: `${SITE_B_URL}/order-failed?back=${encodeURIComponent(`${SITE_URL}/order-failed`)}`,
    order_success_uri: `${SITE_B_URL}/order-success?back=${encodeURIComponent(`${SITE_URL}/order-success`)}`,
    order_notify_uri: `${SITE_URL}/api/payment/notify?vt=${vt}`,
    reorder: "reorder", // makes the API return JSON + linkform
    jump: "1",
  });

  let gatewayRes: Response;
  try {
    gatewayRes = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (err) {
    console.error("[payment/create] network error:", err);
    return Response.json({ error: "Could not reach payment gateway." }, { status: 502 });
  }

  if (!gatewayRes.ok) {
    console.error("[payment/create] gateway HTTP:", gatewayRes.status);
    return Response.json({ error: "Payment gateway error" }, { status: 502 });
  }

  const rawText = await gatewayRes.text();
  console.log("[payment/create] raw response:", rawText);

  // Gateway may return JSON or URL-encoded string
  let linkform: string | undefined;

  if (rawText.trim().startsWith("{")) {
    try {
      const data = JSON.parse(rawText) as { linkform?: string };
      linkform = data.linkform;
    } catch {
      console.error("[payment/create] JSON parse failed:", rawText);
    }
  } else {
    // URL-encoded: order_success=1&linkform=https://...
    const parsed = new URLSearchParams(rawText);
    linkform = parsed.get("linkform") ?? undefined;
  }

  if (linkform) {
    return Response.json({ url: linkform });
  }

  console.error("[payment/create] no linkform in response:", rawText);
  return Response.json({ error: "Payment gateway error" }, { status: 500 });
}
