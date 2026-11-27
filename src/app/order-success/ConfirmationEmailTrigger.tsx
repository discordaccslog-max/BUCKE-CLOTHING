"use client";

import { useEffect } from "react";

/**
 * Fires the confirmation-email dispatch when a customer lands on
 * /order-success after a successful payment.
 *
 * Flow:
 * 1. src/lib/startCheckout stashed the full order under
 *    localStorage['bucke_pending_order'] before redirecting to Muadata.
 * 2. Customer pays, Site B redirects back to a bare /order-success
 *    (no URL params — Site B doesn't append them, per MUADATA guide
 *    Section 17 Phase 3).
 * 3. This component reads the stashed entry, POSTs it to
 *    /api/send-confirmation, clears the stash on success.
 *
 * Guards:
 * - sessionStorage['bucke_pending_order_sent'] prevents a rapid refresh
 *   from firing twice within the fetch window. Cleared on each new
 *   stash (startCheckout) so a second order in the same tab still fires.
 * - Entries older than 1 hour are discarded (stale abandoned checkout).
 * - A reviewer pasting /order-success with no prior stash → no fire.
 */
export default function ConfirmationEmailTrigger() {
  useEffect(() => {
    const STASH_KEY = "bucke_pending_order";
    const SENT_FLAG = "bucke_pending_order_sent";
    const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

    try {
      if (sessionStorage.getItem(SENT_FLAG)) return;

      const raw = localStorage.getItem(STASH_KEY);
      if (!raw) {
        console.info("[bucke:confirmation-email] no pending order in storage, skip");
        return;
      }

      let data: { order?: { customer?: { email?: string } }; createdAt?: number } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        localStorage.removeItem(STASH_KEY);
        return;
      }

      if (!data.order || !data.order.customer || !data.order.customer.email) {
        console.warn("[bucke:confirmation-email] pending order missing customer email, skip");
        localStorage.removeItem(STASH_KEY);
        return;
      }

      if (data.createdAt && Date.now() - data.createdAt > MAX_AGE_MS) {
        console.warn("[bucke:confirmation-email] pending order is stale (>1h), discarding");
        localStorage.removeItem(STASH_KEY);
        return;
      }

      console.info("[bucke:confirmation-email] sending to", data.order.customer.email);

      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.order),
      })
        .then(async (r) => {
          if (r.ok) {
            console.info("[bucke:confirmation-email] sent ✓");
            try {
              sessionStorage.setItem(SENT_FLAG, "1");
              localStorage.removeItem(STASH_KEY);
            } catch {}
          } else {
            const text = await r.text().catch(() => "");
            console.warn("[bucke:confirmation-email] send returned", r.status, text);
          }
        })
        .catch((e) => {
          console.warn("[bucke:confirmation-email] send failed", e);
        });
    } catch (e) {
      console.warn("[bucke:confirmation-email] unexpected error", e);
    }
  }, []);

  return null;
}
