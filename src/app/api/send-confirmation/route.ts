/* Bucke — order confirmation email endpoint.
 *
 * POSTed from the client when a customer lands back on /order-success
 * after a successful Muadata payment. The browser stashed the full
 * order object in localStorage before redirecting; the order-success
 * page retrieves it and calls this endpoint to dispatch the email.
 *
 * Public endpoint (no auth) — it's reachable from the customer's
 * browser. Safe because it only sends to the email the caller supplies
 * in the body; abuse would be rate-limited by Resend and visible in
 * their delivery logs.
 */

import type { NextRequest } from "next/server";
import { Resend } from "resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://buckewear.com";
const FROM = process.env.BUCKE_FROM_EMAIL || "Bucke <orders@buckewear.com>";

type Line = {
  slug?: string;
  name: string;
  colorName?: string;
  size?: string;
  price: number; // cents
  quantity: number;
  image?: { src?: string; alt?: string };
};

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type OrderPayload = {
  orderNumber: string;
  customer: Customer;
  lines: Line[];
  shippingCents: number;
  shippingName: string;
  subtotalCents: number;
  totalCents: number;
};

function esc(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((cents || 0) / 100);
}

function absUrl(u?: string): string {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  return SITE + "/" + u.replace(/^\//, "");
}

function buildEmail(order: OrderPayload): string {
  const { customer: c, lines, shippingCents, shippingName, subtotalCents, totalCents, orderNumber } = order;
  const itemCount = lines.reduce((n, l) => n + (l.quantity || 1), 0);

  const lineRows = lines
    .map((l) => {
      const img = absUrl(l.image?.src);
      const options = [l.colorName, l.size].filter(Boolean).join(" · ");
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e9e5de;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:76px;vertical-align:top;">
                  ${img
                    ? `<img src="${esc(img)}" alt="${esc(l.image?.alt || l.name)}" width="76" height="76" style="display:block;border:1px solid #e9e5de;background:#f3f0ea;object-fit:cover;">`
                    : `<div style="width:76px;height:76px;border:1px solid #e9e5de;background:#f3f0ea;"></div>`
                  }
                </td>
                <td style="padding-left:16px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-family:'Archivo',Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.3;color:#0e0e0d;">${esc(l.name)}</p>
                  ${options ? `<p style="margin:0 0 4px;font-family:'Geist',Arial,sans-serif;font-size:13px;color:#6b6b6b;">${esc(options)}</p>` : ""}
                  <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:13px;color:#6b6b6b;">Qty: ${l.quantity || 1}</p>
                </td>
                <td style="padding-left:16px;vertical-align:top;text-align:right;white-space:nowrap;">
                  <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:14.5px;font-weight:600;color:#0e0e0d;">${fmt(l.price * (l.quantity || 1))}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  const shipRow = shippingCents > 0
    ? `<tr>
         <td style="padding:5px 0;color:#6b6b6b;font-size:14px;">${esc(shippingName || "Shipping")}</td>
         <td style="padding:5px 0;color:#0e0e0d;font-size:14px;text-align:right;">${fmt(shippingCents)}</td>
       </tr>`
    : `<tr>
         <td style="padding:5px 0;color:#6b6b6b;font-size:14px;">Shipping</td>
         <td style="padding:5px 0;color:#17663f;font-size:14px;font-weight:700;text-align:right;">Free</td>
       </tr>`;

  const addrLine = [c.address1, `${c.city}, ${c.state} ${c.zip}`, c.country].filter(Boolean).map(esc).join("<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Order ${esc(orderNumber)} confirmed — Bucke</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Geist:wght@400;500;600;700&display=swap');
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0; mso-table-rspace:0; }
  img { -ms-interpolation-mode:bicubic; border:0; display:block; }
  * { box-sizing:border-box; }
</style>
</head>
<body style="margin:0;padding:0;background:#f3f0ea;font-family:'Geist',Arial,sans-serif;color:#0e0e0d;">

<div style="display:none;font-size:1px;color:#f3f0ea;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Your Bucke order ${esc(orderNumber)} is confirmed.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ea;">
<tr><td align="center" style="padding:28px 16px 48px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;">

    <!-- Header -->
    <tr>
      <td style="padding:28px 32px;border-bottom:1px solid #e9e5de;text-align:center;">
        <a href="${SITE}" style="font-family:'Archivo',Arial,sans-serif;font-size:32px;font-weight:800;letter-spacing:0.08em;color:#0e0e0d;text-decoration:none;">BUCKE</a>
      </td>
    </tr>

    <!-- Hero -->
    <tr>
      <td style="padding:40px 32px 24px;text-align:left;">
        <p style="margin:0 0 6px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#9a4a2e;">Order ${esc(orderNumber)}</p>
        <h1 style="margin:0 0 12px;font-family:'Archivo',Arial,sans-serif;font-size:34px;font-weight:800;line-height:1.1;color:#0e0e0d;letter-spacing:-0.01em;">Thank you, ${esc(c.firstName)}.</h1>
        <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:15.5px;line-height:1.65;color:#6b6b6b;">Your order is confirmed. You'll be emailed with your tracking number the moment it ships.</p>
      </td>
    </tr>

    <!-- Items -->
    <tr>
      <td style="padding:0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e9e5de;">
          ${lineRows}
        </table>
      </td>
    </tr>

    <!-- Totals -->
    <tr>
      <td style="padding:20px 32px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#6b6b6b;font-size:14px;">Subtotal · ${itemCount} ${itemCount === 1 ? "item" : "items"}</td>
            <td style="padding:5px 0;color:#0e0e0d;font-size:14px;text-align:right;">${fmt(subtotalCents)}</td>
          </tr>
          ${shipRow}
          <tr>
            <td style="padding:14px 0 5px;border-top:1px solid #e9e5de;">
              <span style="font-family:'Geist',Arial,sans-serif;font-size:17px;font-weight:800;color:#0e0e0d;">Total</span>
            </td>
            <td style="padding:14px 0 5px;border-top:1px solid #e9e5de;text-align:right;">
              <span style="font-family:'Archivo',Arial,sans-serif;font-size:22px;font-weight:800;color:#0e0e0d;">${fmt(totalCents)}</span>
              <span style="font-family:'Geist',Arial,sans-serif;font-size:11px;font-weight:600;color:#6b6b6b;margin-left:4px;letter-spacing:0.04em;">USD</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Shipping address -->
    <tr>
      <td style="padding:28px 32px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #e9e5de;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 6px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b6b;">Shipping to</p>
              <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:14.5px;color:#0e0e0d;line-height:1.55;">
                ${esc(c.firstName)} ${esc(c.lastName)}<br>
                ${addrLine}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Support -->
    <tr>
      <td style="padding:0 32px 36px;text-align:center;">
        <p style="margin:0 0 14px;font-family:'Geist',Arial,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">Questions about your order? We're here to help.</p>
        <a href="${SITE}/contact" style="display:inline-block;padding:14px 32px;background:#0e0e0d;color:#ffffff;font-family:'Geist',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;">Contact Us</a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#0e0e0d;padding:26px 32px;text-align:center;">
        <p style="margin:0 0 6px;font-family:'Archivo',Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:0.08em;color:#ffffff;">BUCKE</p>
        <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:12px;color:#a39c91;line-height:1.6;">
          You're receiving this because you placed an order at <a href="${SITE}" style="color:#c9774f;text-decoration:none;">buckewear.com</a>.<br>
          &copy; ${new Date().getFullYear()} Bucke Clothing. All rights reserved.
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[bucke:send-confirmation] RESEND_API_KEY not set — refusing to send.");
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const body = (await req.json()) as OrderPayload;
  if (!body || !body.customer || !body.customer.email) {
    return Response.json({ error: "Missing customer email." }, { status: 400 });
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return Response.json({ error: "Missing order lines." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM,
      to: body.customer.email,
      subject: `Order ${body.orderNumber || ""} confirmed — Bucke`.trim(),
      html: buildEmail(body),
    });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    console.error("[bucke:send-confirmation] resend error:", err);
    return Response.json(
      { error: "Failed to send confirmation email: " + (err instanceof Error ? err.message : "unknown") },
      { status: 500 }
    );
  }
}
