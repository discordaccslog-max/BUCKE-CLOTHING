/* Bucke — admin email endpoint for manual tracking + follow-up sends.
 *
 * Validates a shared admin key (env ADMIN_EMAIL_KEY) sent in the
 * x-admin-key header, then dispatches one of two templates via Resend:
 *
 *   - 'tracking'  → shipment tracking email with carrier + tracking number
 *   - 'followup'  → fixed "lost in transit + refund" notice with a
 *                   "Submit Refund Request" button linking to /refund-request
 *
 * Triggered manually from /admin/send. Not reachable without the
 * admin key, and the admin page itself is marked noindex / robots-blocked.
 */

import type { NextRequest } from "next/server";
import { Resend } from "resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://buckewear.com";
const FROM = process.env.BUCKE_FROM_EMAIL || "Bucke <orders@buckewear.com>";
const REFUND_URL = `${SITE}/refund-request`;
const CONTACT_URL = `${SITE}/contact`;

function esc(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trackingUrl(carrier: string, trackingNumber: string): string {
  const t = encodeURIComponent(String(trackingNumber || "").trim());
  if (!t) return "";
  switch (String(carrier || "").toLowerCase()) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${t}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${t}`;
    default:
      return "";
  }
}

function carrierLabel(carrier: string): string {
  switch (String(carrier || "").toLowerCase()) {
    case "usps": return "USPS";
    case "fedex": return "FedEx";
    case "ups": return "UPS";
    case "dhl": return "DHL";
    default: return esc(carrier || "Carrier");
  }
}

/* --------------------------------------------------------------------
   Shared email chrome (light/editorial — Bucke brand)
   -------------------------------------------------------------------- */

function wrap({ preheader, title, bodyHtml }: { preheader: string; title: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
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
  ${esc(preheader)}
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ea;">
<tr><td align="center" style="padding:28px 16px 48px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;">

    <tr>
      <td style="padding:28px 32px;border-bottom:1px solid #e9e5de;text-align:center;">
        <a href="${SITE}" style="font-family:'Archivo',Arial,sans-serif;font-size:32px;font-weight:800;letter-spacing:0.08em;color:#0e0e0d;text-decoration:none;">BUCKE</a>
      </td>
    </tr>

    ${bodyHtml}

    <tr>
      <td style="padding:0 32px 36px;text-align:center;">
        <p style="margin:0 0 14px;font-family:'Geist',Arial,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">Questions? We're here to help.</p>
        <a href="${CONTACT_URL}" style="display:inline-block;padding:14px 32px;background:#0e0e0d;color:#ffffff;font-family:'Geist',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;">Contact Us</a>
      </td>
    </tr>

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

/* --------------------------------------------------------------------
   Template: shipment tracking
   -------------------------------------------------------------------- */

function buildTrackingEmail({
  orderNumber, carrier, trackingNumber, estimatedDelivery, shippingAddress,
}: {
  orderNumber?: string; carrier: string; trackingNumber: string;
  estimatedDelivery?: string; shippingAddress?: string;
}): string {
  const trackUrl = trackingUrl(carrier, trackingNumber);
  const trackBtn = trackUrl
    ? `<a href="${trackUrl}" style="display:inline-block;margin-top:18px;padding:16px 36px;background:#0e0e0d;color:#ffffff;font-family:'Geist',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">Track Your Package</a>`
    : "";

  const addrBlock = shippingAddress
    ? `<tr>
         <td colspan="2" style="padding:12px 0 0;border-top:1px solid #e9e5de;">
           <p style="margin:0 0 6px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b6b;">Shipping to</p>
           <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:14px;color:#0e0e0d;line-height:1.55;">${esc(shippingAddress).replace(/\n/g, "<br>")}</p>
         </td>
       </tr>`
    : "";

  const etaRow = estimatedDelivery
    ? `<tr>
         <td style="padding:5px 0 10px;color:#6b6b6b;font-size:13.5px;vertical-align:top;">Estimated delivery</td>
         <td style="padding:5px 0 10px;color:#0e0e0d;font-size:13.5px;font-weight:700;text-align:right;vertical-align:top;">${esc(estimatedDelivery)}</td>
       </tr>`
    : "";

  const body = `
    <tr>
      <td style="padding:40px 32px 24px;text-align:left;">
        <p style="margin:0 0 6px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#9a4a2e;">${orderNumber ? `Order ${esc(orderNumber)} · Shipped` : "Shipped"}</p>
        <h1 style="margin:0 0 12px;font-family:'Archivo',Arial,sans-serif;font-size:32px;font-weight:800;line-height:1.1;color:#0e0e0d;letter-spacing:-0.01em;">Your order is on the way!</h1>
        <p style="margin:0;font-family:'Geist',Arial,sans-serif;font-size:15.5px;line-height:1.65;color:#6b6b6b;">Your package has shipped via ${carrierLabel(carrier)}. You can track its progress with the button below.</p>
      </td>
    </tr>

    <tr>
      <td style="padding:0 32px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #e9e5de;">
          <tr>
            <td style="padding:22px 22px 24px;text-align:center;">
              <p style="margin:0 0 6px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b6b;">${carrierLabel(carrier)} Tracking Number</p>
              <p style="margin:0;font-family:'Archivo',Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.02em;color:#0e0e0d;word-break:break-all;">${esc(trackingNumber)}</p>
              ${trackBtn}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${(etaRow || addrBlock) ? `
    <tr>
      <td style="padding:0 32px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #e9e5de;">
          <tr>
            <td style="padding:18px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${etaRow}
                ${addrBlock}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ""}
  `;

  return wrap({
    preheader: orderNumber
      ? `Your Bucke order ${orderNumber} has shipped — tracking inside.`
      : `Your Bucke order has shipped — tracking inside.`,
    title: orderNumber ? `Order ${orderNumber} shipped — Bucke` : `Order shipped — Bucke`,
    bodyHtml: body,
  });
}

/* --------------------------------------------------------------------
   Template: follow-up (fixed — lost-in-transit refund notice)
   -------------------------------------------------------------------- */

const FOLLOWUP_SUBJECT = `[BUCKE] Important Update Regarding Your Bucke Order`;

function buildFollowUpEmail({ orderNumber }: { orderNumber?: string }): string {
  const para = (text: string) =>
    `<p style="margin:0 0 16px;font-family:'Geist',Arial,sans-serif;font-size:15.5px;line-height:1.7;color:#0e0e0d;">${text}</p>`;

  const paragraphs = [
    para(`We regret to inform you that your order appears to have been lost during transit. Unfortunately, the shipping carrier has not provided us with a reason for the loss. While we sincerely apologize for this inconvenience, shipping-related incidents are outside of our direct control and depend on the carrier's handling and delivery processes.`),
    para(`Please rest assured that you are eligible for a full refund. To proceed, please submit a refund request through the button below:`),
    `<div style="margin:22px 0 28px;text-align:center;">
       <a href="${REFUND_URL}" style="display:inline-block;padding:16px 36px;background:#0e0e0d;color:#ffffff;font-family:'Geist',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">Submit Refund Request</a>
     </div>`,
    para(`Additionally, as compensation for the inconvenience, we have issued you a <b style="color:#9a4a2e;">$50 store credit</b>. Your store credit coupon can be applied once your refund request has been successfully submitted.`),
    para(`Once again, we sincerely apologize for this experience and appreciate your understanding. We hope to have the opportunity to serve you again in the future.`),
    `<p style="margin:28px 0 0;font-family:'Geist',Arial,sans-serif;font-size:15.5px;line-height:1.7;color:#0e0e0d;">Regards,<br><b style="color:#0e0e0d;letter-spacing:0.04em;">BUCKE CLOTHING</b></p>`,
  ];

  const body = `
    <tr>
      <td style="padding:40px 32px 32px;text-align:left;">
        ${orderNumber ? `<p style="margin:0 0 18px;font-family:'Geist',Arial,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#9a4a2e;">Regarding Order ${esc(orderNumber)}</p>` : ""}
        ${paragraphs.join("")}
      </td>
    </tr>
  `;

  return wrap({
    preheader: `An important update about your Bucke order — refund available.`,
    title: FOLLOWUP_SUBJECT,
    bodyHtml: body,
  });
}

/* --------------------------------------------------------------------
   Handler
   -------------------------------------------------------------------- */

type Body = {
  template?: "tracking" | "followup";
  email?: string;
  orderNumber?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress?: string;
};

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_EMAIL_KEY;
  if (!adminKey) {
    console.error("[bucke:admin-send] ADMIN_EMAIL_KEY env not set — refusing to send.");
    return Response.json({ error: "Server misconfigured (missing admin key)." }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "Server misconfigured (missing Resend key)." }, { status: 500 });
  }

  const providedKey = req.headers.get("x-admin-key") || "";
  if (providedKey !== adminKey) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const { template, email, orderNumber, carrier, trackingNumber, estimatedDelivery, shippingAddress } = body;

  if (!email) return Response.json({ error: "Missing customer email." }, { status: 400 });
  if (!template) return Response.json({ error: "Missing template." }, { status: 400 });

  let html: string;
  let subject: string;

  if (template === "tracking") {
    if (!trackingNumber) return Response.json({ error: "Missing tracking number." }, { status: 400 });
    html = buildTrackingEmail({
      orderNumber,
      carrier: carrier || "USPS",
      trackingNumber,
      estimatedDelivery,
      shippingAddress,
    });
    subject = orderNumber ? `Your Bucke order ${orderNumber} has shipped` : `Your Bucke order has shipped`;
  } else if (template === "followup") {
    html = buildFollowUpEmail({ orderNumber });
    subject = FOLLOWUP_SUBJECT;
  } else {
    return Response.json({ error: `Unknown template: ${template}` }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({ from: FROM, to: email, subject, html });
    return Response.json({ ok: true, id: result?.data?.id });
  } catch (err: unknown) {
    console.error("[bucke:admin-send] resend error:", err);
    return Response.json(
      { error: "Failed to send email: " + (err instanceof Error ? err.message : "unknown") },
      { status: 500 }
    );
  }
}
