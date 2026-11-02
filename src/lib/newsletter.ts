/**
 * Newsletter boundary. Swap the body for Klaviyo, Mailchimp, Shopify
 * customer marketing, etc. Components only call `subscribeToNewsletter`.
 */
export type SubscribeResult = { ok: true } | { ok: false; message: string };

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  console.info("[newsletter] subscribe (stub)", { email });
  return { ok: true };
}
