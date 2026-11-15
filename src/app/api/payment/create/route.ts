import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { CartLine } from "@/types/cart";

const GATEWAY_URL = process.env.MUADATA_GATEWAY_URL ?? "";
const API_USER = process.env.MUADATA_API_USER ?? "";
const PRIVATE_KEY = process.env.MUADATA_PRIVATE_KEY ?? "";
const WEBSITE = process.env.MUADATA_WEBSITE ?? "";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { lines: CartLine[]; orderId: string };
  const { lines, orderId } = body;

  const amount = (lines.reduce((sum, l) => sum + l.price * l.quantity, 0) / 100).toFixed(2);
  const currency = "USD";

  const products = lines.map((l) => ({
    name: l.name,
    quantity: l.quantity,
    price: (l.price / 100).toFixed(2),
  }));

  const signature = md5(API_USER + PRIVATE_KEY + currency + amount + orderId);
  const callbackToken = md5(orderId + PRIVATE_KEY);

  const params = new URLSearchParams({
    api_user: API_USER,
    website: WEBSITE,
    order_id: orderId,
    currency,
    amount,
    products: JSON.stringify(products),
    signature,
    callback_token: callbackToken,
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
  let code: number | undefined;

  if (rawText.trim().startsWith("{")) {
    try {
      const data = JSON.parse(rawText) as { code?: number; linkform?: string };
      code = data.code;
      linkform = data.linkform;
    } catch {
      console.error("[payment/create] JSON parse failed:", rawText);
    }
  } else {
    // URL-encoded: order_success=1&linkform=https://...
    const parsed = new URLSearchParams(rawText);
    code = parsed.get("order_success") === "1" ? 1 : undefined;
    linkform = parsed.get("linkform") ?? undefined;
  }

  if (linkform) {
    return Response.json({ url: linkform });
  }

  console.error("[payment/create] no linkform in response:", rawText);
  return Response.json({ error: "Payment gateway error" }, { status: 500 });
}
