import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const PRIVATE_KEY = process.env.MUADATA_PRIVATE_KEY ?? "";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const vt = req.nextUrl.searchParams.get("vt") ?? "";

  const body = await req.text();
  const params = new URLSearchParams(body);
  const orderId = params.get("order_id") ?? "";
  const isSuccess = params.get("is_success") ?? "";

  const expected = md5(orderId + PRIVATE_KEY);

  const vtBuf = Buffer.from(vt.padEnd(expected.length, "\0"));
  const expectedBuf = Buffer.from(expected);

  const valid =
    vt.length === expected.length &&
    timingSafeEqual(vtBuf, expectedBuf);

  if (!valid) {
    return new Response("Forbidden", { status: 403 });
  }

  if (isSuccess === "1") {
    // TODO: replace console.log with real database update when DB is added
    console.log(`[payment] order paid: ${orderId}`);
  }

  return new Response("200", { status: 200 });
}
