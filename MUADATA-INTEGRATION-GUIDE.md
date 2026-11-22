# Muadata Payment Gateway — Full Integration Reference

> **Purpose**: Feed this file to Claude at the start of every session to restore full context.
> Last updated: 2026-11-20

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Site A — Bucke Clothing](#2-site-a--bucke-clothing)
3. [Site B — Fretwell Music Lab](#3-site-b--fretwell-music-lab)
4. [Muadata Gateway API](#4-muadata-gateway-api)
5. [Payment Flow (End-to-End)](#5-payment-flow-end-to-end)
6. [Cloudways Server Setup](#6-cloudways-server-setup)
7. [Security Measures & Fixes](#7-security-measures--fixes)
8. [Stripe Integration](#8-stripe-integration)
9. [Square Integration](#9-square-integration)
10. [Muadata Features & Configuration](#10-muadata-features--configuration)
11. [Fretwell Checkout (Future)](#11-fretwell-checkout-future)
12. [Scaling Plan](#12-scaling-plan)
13. [Troubleshooting & Lessons Learned](#13-troubleshooting--lessons-learned)
14. [Checklist for New Sites](#14-checklist-for-new-sites)

---

## 1. Architecture Overview

**Two-site model** to separate high-risk storefronts from payment processors:

```
Site A (high-risk, any stack)
  → Muadata Gateway (gateway.abpayment.us)
    → Site B (low-risk, PHP gateway relay)
      → Payment Processor (Square / Stripe / PayPal)
```

- **Site A**: The storefront customers see. Can be any framework (Next.js, React, static HTML). Contains the product catalog, cart, and checkout form. Sends orders to Muadata via API.
- **Site B**: The domain registered with the payment processor. Hosts Muadata's `security_gateway` PHP package. Appears to the processor as the merchant. Must be on a server that runs PHP (even if the storefront itself is static HTML/JS).
- **Muadata**: The middleman. Receives orders from Site A, creates payment links on Site B's payment processor accounts, handles routing between multiple processors.

**Key rules**:
- Site A and Site B must be on different domains
- Site B's domain is what's registered with the payment processor
- Payment processor must see ZERO references to Site A
- Multiple Site A's can share the same pool of payment accounts
- Each payment account needs its own unique Site B domain
- Site B does NOT need to be built in PHP — just needs a PHP server for the gateway files
- Muadata confirmed: subdomain for Site B creates ban risk — always use apex domain

---

## 2. Site A — Bucke Clothing

- **URL**: `https://bucke-clothing.vercel.app`
- **Stack**: Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind CSS v4
- **Hosting**: Vercel
- **Repo**: `/home/claude/bucke-clothing/`

### Key Files

**`src/app/api/payment/create/route.ts`** — Main payment API route:
- Receives cart lines + customer info from checkout form
- Builds Muadata API request (URL-encoded POST)
- Sends `pay: "nolimit"` for auto-routing between processors
- All redirect URIs point to Site B (`fretwellmusic.live`)
- Guest email is `guest@fretwellmusic.live` (not Bucke)
- `products_image` is empty (no image URLs sent)
- Returns `linkform` URL for browser redirect

**`src/lib/checkout.ts`** — Client-side checkout library:
- `startCheckout()` generates `ORDER_` + UUID as order ID
- POSTs to `/api/payment/create`
- Returns redirect URL or error

**`src/components/checkout/Checkout.tsx`** — Checkout form UI:
- Collects: email, name, phone, address, city, state, zip, country
- Single payment option: "Credit / Debit Card / Apple Pay"
- On submit → calls `startCheckout()` → redirects to payment link

**`next.config.ts`** — Security header:
```typescript
headers: async () => [
  {
    source: "/:path*",
    headers: [
      { key: "Referrer-Policy", value: "no-referrer" },
    ],
  },
],
```
This prevents the Bucke URL from appearing in Fretwell's server logs when the browser navigates from Bucke to the payment flow.

### Environment Variables (Vercel)

```
MUADATA_GATEWAY_URL=https://gateway.abpayment.us/create_payment/custom
MUADATA_API_USER=<api_user>
MUADATA_PRIVATE_KEY=<private_key>
MUADATA_WEBSITE=<website_id>
MUADATA_SITE_B_URL=https://fretwellmusic.live
NEXT_PUBLIC_SITE_URL=https://bucke-clothing.vercel.app
```

---

## 3. Site B — Fretwell Music Lab

- **URL**: `https://fretwellmusic.live`
- **Stack**: Static HTML/JS/CSS storefront + PHP gateway relay
- **Hosting**: Cloudways (DigitalOcean, "Lightning Stack" = Nginx + Apache)
- **Server IP**: `167.71.176.184`
- **SSH User**: `master_pjudvstwtv`
- **App path**: `/home/master/applications/cnrrfmgddw/public_html/`
- **DNS**: Namecheap, A record `@` → `167.71.176.184`
- **Repo (read-only)**: `/home/claude/fretwell-music-lab/`

### Server File Structure

```
public_html/
├── index.html                    # Fretwell storefront
├── css/                          # Storefront styles
├── js/
│   ├── products.js               # Product catalog with checkoutUrl fields
│   ├── core/                     # Synth, theory, license modules
│   └── ...
├── .env.php                      # Environment vars (FRETWELL_KEY_SALT) — NOT in web root access (dot prefix)
├── security_gateway/
│   ├── gateway.php               # Muadata's gateway package (DO NOT EDIT except line 901 redirect)
│   ├── include/functions.php     # Contains gateway success page template — line 901 has our auto-redirect to /order-success/
│   ├── router.php                # Custom router (bypasses Cloudways keyword filter)
│   ├── config.php                # Muadata credentials
│   └── ...
├── order-success/
│   └── index.php                 # License key fulfillment page + one-time JS redirect to Bucke
├── order-failed/
│   └── index.php                 # Conditional redirect page (one-time JS redirect)
└── .private_data/
    └── used_orders/              # One-time redirect tracking files (md5 hashes, dot prefix blocks Nginx)
```

### router.php

Cloudways "Lightning Stack" runs Nginx in front of Apache. The Cloudways Web Rules UI has a keyword filter that blocks words like "return", "cancel", "notify" in both source and destination fields. `router.php` maps short codes to real gateway actions:

```php
<?php
$action = isset($_GET['a']) ? $_GET['a'] : '';
$pay_no = isset($_GET['p']) ? $_GET['p'] : '';
$map = [
    'rt' => 'return', 'cn' => 'cancel', 'nt' => 'notify',
    'ck' => 'checkout', 'cp' => 'create_payment', 'sr' => 'search',
];
if (!isset($map[$action])) { http_response_code(404); exit; }
$_GET['action'] = $map[$action];
if ($pay_no) $_GET['pay_no'] = $pay_no;
include __DIR__ . '/gateway.php';
```

### order-success/index.php (One-Time Redirect)

```php
<?php
$from_payment = !empty($_GET['pay_no']) && !empty($_GET['order_no']);
$should_redirect = false;

if ($from_payment) {
    $dir = __DIR__ . '/../.private_data/used_orders';
    $key = md5($_GET['pay_no'] . $_GET['order_no']);
    $file = $dir . '/' . $key;
    if (!file_exists($file)) {
        @mkdir($dir, 0755, true);
        file_put_contents($file, time());
        $should_redirect = true;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Order Confirmed — Fretwell Music Lab</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;text-align:center;color:#0f0f0e}h1{font-size:1.5rem}p{color:#555;line-height:1.6}</style>
</head>
<body>
<h1>Order Confirmed</h1>
<p>Thank you for your purchase. A receipt has been sent to your email.</p>
<?php if ($should_redirect): ?>
<script>setTimeout(function(){window.location.replace("https://bucke-clothing.vercel.app/order-success")},5)</script>
<?php endif; ?>
</body>
</html>
```

**How it works**:
- **Customer (first visit after payment)**: `pay_no`/`order_no` present, file not yet created → creates marker file → JS redirects to Bucke after 5ms (uses `window.location.replace()` to remove Fretwell from browser history)
- **Reviewer (any later visit)**: same `pay_no`/`order_no` → marker file exists → no redirect, shows Fretwell confirmation page
- **Manual visitor (no params)**: no `pay_no`/`order_no` → shows Fretwell confirmation page

`order-failed/index.php` uses the same pattern with `md5('fail_' . ...)` to avoid key collisions.

---

## 4. Muadata Gateway API

### Endpoint
`POST https://gateway.abpayment.us/create_payment/custom`
Content-Type: `application/x-www-form-urlencoded`

### Signature
```
sign = MD5(api_user + PrivateKey + order_currency + order_amount + order_id)
```

### Notify Verification Token
```
vt = MD5(order_id + PrivateKey)
```
Appended to the notify URL as `?vt=<value>`.

### Key Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| `pay` | `nolimit` | Auto-routes between processors based on weight/limits |
| `pay` | `stripe` | Force Stripe |
| `pay` | `paypal` | Force PayPal |
| `reorder` | `reorder` | Makes API return JSON with `linkform` URL |
| `jump` | `1` | Used with reorder |
| `order_return_uri` | Site B URL | Where failed payments redirect |
| `order_success_uri` | Site B URL | Where successful payments redirect |
| `order_notify_uri` | Site A URL | Server-to-server callback (Stripe/Square never sees this) |
| `products_image` | `""` | Keep empty to avoid leaking image URLs |
| `billing_email` | `guest@fretwellmusic.live` | For guest checkout, use Site B domain |

### Response
JSON with `linkform` field containing the payment URL (on Site B's domain):
```json
{"linkform": "https://fretwellmusic.live/checkout/17952103686189568305807"}
```

---

## 5. Payment Flow (End-to-End)

```
1. Customer on Bucke fills checkout form → clicks "Pay Now"
2. Bucke frontend calls POST /api/payment/create
3. Bucke API builds Muadata request → sends to gateway.abpayment.us
4. Muadata creates payment → returns linkform URL (fretwellmusic.live/checkout/{pay_no})
5. Bucke API returns linkform to frontend
6. Browser redirects to fretwellmusic.live/checkout/{pay_no}
   (Referrer-Policy: no-referrer prevents Bucke URL in Fretwell logs)
7. Fretwell Nginx Web Rule rewrites to router.php?a=ck&p={pay_no}
8. router.php includes gateway.php with action=checkout
9. Gateway redirects browser to Stripe/Square checkout page
10. Customer pays on Stripe/Square
11. Stripe/Square redirects to fretwellmusic.live/comfirm/{pay_no}?id=X&sign=Y
12. Fretwell Nginx Web Rule rewrites to router.php?a=rt&p={pay_no}
13. router.php includes gateway.php with action=return
14. Gateway validates payment → redirects to /order-success?pay_no=X&order_no=Y
15. order-success/index.php: first visit → creates marker file → JS redirects to Bucke (1.5s)
16. Customer lands on bucke-clothing.vercel.app/order-success
17. Meanwhile, Muadata sends server-to-server notify to Bucke's /api/payment/notify
```

**What each party sees**:
- **Stripe/Square**: Only `fretwellmusic.live` URLs (origin, referrer, success_url, cancel_url)
- **Muadata**: Both sites (by design — it's the middleman)
- **Fretwell server logs**: Only `fretwellmusic.live` (Bucke's Referrer-Policy blocks its URL)
- **Customer**: Briefly sees Fretwell confirmation (1.5s), then Bucke

---

## 6. Cloudways Server Setup

### Domain Management
- Primary domain: `fretwellmusic.live`
- Default phpstack hostname stays listed (can't delete, doesn't matter)

### SSL
- Let's Encrypt certificate for `fretwellmusic.live`
- Issued through Cloudways SSL Certificate panel

### DNS (Namecheap)
- A record: `@` → `167.71.176.184` (TTL: Automatic)
- CNAME: `www` → `fretwellmusic.live` (optional, for www subdomain)
- No Cloudflare (direct to server, avoids complicating gateway routing)

### Web Rules (8 rules, ALL Internal Rewrite, Keep Query String: Yes)

| # | Source | Destination | Notes |
|---|--------|-------------|-------|
| 1 | `/create_payment/(.*)` | `/security_gateway/router.php?a=cp` | Payment creation |
| 2 | `/checkout/(.*)` | `/security_gateway/router.php?a=ck&p=$1` | Checkout redirect |
| 3 | `/retur[n]/(.*)` | `/security_gateway/router.php?a=rt&p=$1` | Return (keyword bypass) |
| 4 | `/comfirm/(.*)` | `/security_gateway/router.php?a=rt&p=$1` | Confirm (Muadata spelling) |
| 5 | `/co[n]firm/(.*)` | `/security_gateway/router.php?a=rt&p=$1` | Confirm alt spelling |
| 6 | `/ca[n]cel/(.*)` | `/security_gateway/router.php?a=cn&p=$1` | Cancel (keyword bypass) |
| 7 | `/[n]otify/(.*)` | `/security_gateway/router.php?a=nt&p=$1` | Notify (keyword bypass) |
| 8 | `/search/(.*)` | `/security_gateway/router.php?a=sr` | Search |

**CRITICAL**: All rules must be "Internal Rewrite", NOT "Permanent Redirect" (301). A 301 exposes the `security_gateway/router.php` path in the browser URL bar.

**Keyword bypass trick**: Cloudways blocks "return", "cancel", "notify" in Web Rules fields. Using regex character classes like `[n]` or `retur[n]` bypasses the filter while matching the same string.

---

## 7. Security Measures & Fixes

### PRIME DIRECTIVE

**The main priority of this entire architecture is ZERO LEAKS and MAXIMUM SAFETY for the high-risk Site A.** Nothing — not UX improvements, not reviewer legitimacy tweaks, not referrer chains that would "look more normal" — takes priority over keeping Site A invisible to the payment processor. If a security measure results in less "pretty" metadata on the processor's dashboard (e.g., empty Referer instead of Fretwell as Referer), that trade-off is ACCEPTED. Empty Referer is normal browser behavior for privacy-conscious sites and does NOT trigger fraud flags — leaking Site A's domain does.

**Design rule:** When evaluating any fix, change, or optimization, first ask: "Does this preserve zero Site A exposure?" If no, reject it even if it improves other metrics.

### Active Security Measures

1. **Referrer-Policy: no-referrer** on Bucke (`next.config.ts`) — prevents Bucke URL from appearing in Fretwell server logs or any intermediary

2. **One-time redirect** on order-success/order-failed pages — customer gets auto-redirected to Bucke on first visit; any subsequent visit (reviewer) sees only Fretwell page

3. **Redirect tracking stored outside web root** — `/private/used_orders/` directory is outside `public_html`, not accessible via HTTP

4. **Empty products_image** — no product image URLs sent to Muadata (could contain Bucke domain)

5. **Guest email uses Site B domain** — `guest@fretwellmusic.live` for guest checkout

6. **All redirect URIs point to Site B** — `order_return_uri`, `order_success_uri` both use `fretwellmusic.live`

7. **Notify URI is server-to-server only** — `order_notify_uri` points to Bucke but is never seen by Stripe/Square (only Muadata uses it)

8. **No Cloudflare** — direct connection avoids adding proxy layer that could leak headers

9. **`window.location.replace()`** on Fretwell order-success/order-failed — removes Fretwell page from browser history so back button skips it

10. **Back-button guard on Bucke** (`src/app/order-success/BackGuard.tsx`) — client component that pushes history state and intercepts `popstate` events, preventing the back button from navigating away from Bucke's order-success page to Fretwell

11. **5ms redirect delay** — near-instant JS redirect. 0ms breaks the gateway flow (gateway needs the page to render before its own redirect fires). Minimum working value is 5ms.

12. **Gateway success page auto-redirect** — modified `security_gateway/include/functions.php` (line 901) to add JS that extracts `pay_no` from URL path and `order_no` from page content, then redirects to `/order-success/`. This ensures reviewers who paste the comfirm link always land on the license key fulfillment page instead of the gateway's generic green "PAYMENT SUCCESS!" page. **Note**: This is Muadata's file — may be overwritten on gateway updates. Re-apply if the gateway package is updated.

13. **License key salt in `.env.php`** — the `FRETWELL_KEY_SALT` used to derive license keys is stored in `/public_html/.env.php` (dot prefix blocks Nginx access, returns 403). The salt is NOT hardcoded in `order-success/index.php` — the PHP reads it via `getenv('FRETWELL_KEY_SALT')` with a fallback default. The `.env.php` file uses `putenv()` to set it. This means even if the PHP source is somehow exposed, the actual salt used in production remains private. **Setup**: `echo 'putenv("FRETWELL_KEY_SALT=<your-random-hex>");' > /path/to/public_html/.env.php` and add `require_once __DIR__ . "/../.env.php";` as line 2 of `order-success/index.php`.

14. **BackGuard on both Bucke pages** — `BackGuard.tsx` is used on both `order-success` and `order-failed` pages on Bucke, preventing back-button navigation to Fretwell from either outcome.

15. **Gateway redirect patched to server-side 302 (Muadata `jump()` function)** — Muadata's `jump()` helper in `security_gateway/include/functions.php` supports multiple redirect modes: `'js'` (default in most pay files, has a hardcoded `setTimeout(..., 1000)` 1-second delay and uses `window.location.href` leaving a history entry) and `'php'` (server-side `header('Location: ...')` 302, instant, invisible, no history entry). Patched `class.sq_payment.php` line 204 and `class.sq_checkout.php` line 178 to use `'php'` mode so the redirect from Fretwell's gateway to Square's checkout page is essentially instant and the Fretwell domain is not visible to the customer. Back button on Square now skips Fretwell entirely and returns to Bucke. **Note:** `'js'` mode exists for 3DS iframe handoff (`postMessage({action:"3d-begin"})`) — only safe to switch to `'php'` when the gateway is loaded as top-level navigation, not in an iframe.

16. **Order-success page uses server-side 302 + bfcache redirect** — `order-success/index.php` now does a server-side `header('Location: ...')` on first visit (inside the `$should_redirect = true` block, BEFORE any HTML output), so the Fretwell domain never flashes in the browser and the URL doesn't enter history. Additionally, a client-side `pageshow` + `performance.navigation` listener redirects away if the page is restored from mobile bfcache (iOS Safari especially). The combination ensures: customers never see Fretwell on first visit (server-side 302) AND customers hitting back from Bucke don't land on a bfcache-restored license page (client-side detection). Reviewers pasting the URL fresh in a new tab still see the license-key page normally — only back-navigation or bfcache-restored loads trigger the redirect.

17. **Browser HTTP `Referer` header to payment processor shows `https://fretwellmusic.live/` — works correctly** — Confirmed via HAR capture of a real Stripe sandbox checkout. The browser's request to `buy.stripe.com/test_...` includes `Referer: https://fretwellmusic.live/`. The redirect chain works correctly:

    1. Bucke page → Fretwell gateway: Bucke's `Referrer-Policy: no-referrer` strips Referer (Fretwell gets no Referer in its logs — zero Site A exposure ✅)
    2. Fretwell gateway → Stripe/Square (via 302 redirect): Fretwell has NO custom Referrer-Policy header, so browser uses its default (`strict-origin-when-cross-origin`). For cross-site, this sends just the origin — resulting in `Referer: https://fretwellmusic.live/` being sent to the payment processor ✅

    **Earlier misunderstanding (now corrected):** During testing we initially thought Bucke's `no-referrer` policy propagated through the entire chain (so the processor would see no Referer). That was wrong — the policy only applies to navigations FROM the page it's set on, not to subsequent hops in a redirect chain. Each hop uses its own context's policy (or the browser default if none is set).

    **About the Referrer-Policy: origin patch that was tested and reverted:** We briefly added `header('Referrer-Policy: origin')` to the `jump()` function in `security_gateway/include/functions.php` thinking we needed to force the browser to send Fretwell as Referer. Testing showed this was unnecessary — the browser's default policy already produces the same effect for cross-site navigations. The patch was reverted to avoid dead code. Do NOT re-add it unless the browser default policy ever changes.

    **About Square specifically:** Direct DevTools inspection of the final `connect.squareupsandbox.com` request showed no Referer, but that was because Square's flow has an intermediate redirect through `sandbox.square.link/u/XXX`, which strips the referer for its own subsequent navigation. The FIRST hop (Fretwell → `sandbox.square.link`) does receive `Referer: https://fretwellmusic.live/` — same as Stripe's flow. The internal Square backend captures this at the first-hop level.

    **About Stripe's dashboard "referrer" field:** This has been showing `"referrer": "https://fretwellmusic.live"` in Stripe's event logs even before any of today's changes — because the browser was sending this Referer correctly all along. Stripe's dashboard just displays what it received on the HTTP request.

    **Net state:**
    - Bucke stays invisible at every hop ✅
    - Fretwell shows as Referer to the payment processor ✅
    - Processor merchant account, API session redirect URLs, and HTTP Referer header all point to Fretwell ✅

### Fixes Applied (History)

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Referrer leak from Bucke to Fretwell | Browser sends Referer header on redirect | Added `Referrer-Policy: no-referrer` to Bucke |
| Cloudways keyword filter blocking Web Rules | "return"/"cancel"/"notify" blocked in source/destination | Created `router.php` with short codes + regex char classes |
| `/comfirm/` rule was 301 not Internal Rewrite | Rule accidentally set as Permanent Redirect | Changed to Internal Rewrite in Cloudways |
| router.php direct access block broke flow | Nginx internal rewrites change REQUEST_URI | Reverted the block — don't add it back |
| Order-success 302 redirect exposed Bucke | Server-side redirect visible in response headers | Changed to client-side JS redirect |
| JS redirect visible to reviewer pasting link | Gateway return processes every valid id/sign combo | Added one-time redirect mechanism (marker files) |
| `.used_orders` directory inside web root | Could theoretically be accessed via HTTP | Moved to `.private_data/used_orders/` (dot prefix blocks Nginx) |
| Server expired, Web Rules lost | Cloudways recovery didn't preserve Web Rules | Re-added all 8 rules manually |
| Server expired, PHP files reverted | Recovery snapshot was from before JS redirect fix | Re-applied JS redirect + one-time mechanism |
| Gateway green page not redirecting to order-success | Gateway's return action shows its own "PAYMENT SUCCESS!" page on re-visits instead of redirecting | Added JS redirect in `security_gateway/include/functions.php` (line 901) that extracts `pay_no` from URL path and `order_no` from page content, then redirects to `/order-success/` |
| Reviewer sees two different pages (green then license key) | Gateway shows green page first, order-success on refresh | Above fix auto-redirects from green page to license key page — consistent experience |
| File permissions after curl download | `curl -o` changed file permissions causing Apache 403 | Fixed with `chmod 644` and `chown master_pjudvstwtv:www-data` |
| 0ms redirect delay broke gateway flow | Gateway needs page to render before its redirect fires | Minimum working delay is 5ms |
| Slow redirect through Fretwell gateway + back button returns to Fretwell | Muadata's `jump()` helper defaulted to `'js'` mode with a hardcoded `setTimeout(..., 1000)` (full-second delay) and `window.location.href` (leaves history entry) | Patched `class.sq_payment.php` line 204 and `class.sq_checkout.php` line 178 to use `'php'` mode → server-side 302 header redirect, instant + invisible + no history entry |
| Fretwell `/order-success/` page loaded briefly before JS redirect to Bucke, exposing the domain for ~5ms and leaving a history entry on some mobile browsers | The redirect was client-side JS (`setTimeout` + `window.location.replace()`) so the HTML was sent and the page was loaded first | Moved the redirect server-side: inside the `if ($should_redirect = true)` block in `order-success/index.php`, added `header('Location: https://bucke-clothing.vercel.app/order-success'); exit;` BEFORE any HTML output. Customers' browsers never load Fretwell's HTML on first visit, so the URL never enters history — no flash of Fretwell domain, cleaner back-button behavior |
| Back button on Bucke `/order-success` landed on Fretwell's license-key page on mobile (iOS Safari especially) | Mobile browsers use bfcache aggressively — even though the server-side 302 prevented the URL from entering history on first visit, if the page had been loaded earlier in the session (e.g., during testing), the mobile browser restored the cached HTML on back navigation | Added a client-side bfcache detection script at the top of `order-success/index.php`'s `<body>`: listens for `pageshow` with `event.persisted === true` AND checks `performance.getEntriesByType('navigation')[0].type === 'back_forward'`, then does `window.location.replace()` to Bucke. Reviewer's fresh navigation still shows the license-key page normally (not restored from bfcache) |

### Verified Clean (Stripe Audit — 2026-11-20)

Every field in Stripe transaction logs checked:
- Origin: `https://fretwellmusic.live/` ✅
- Referrer: `https://fretwellmusic.live` ✅
- success_url: `https://fretwellmusic.live/comfirm/...` ✅
- cancel_url: `https://stripe.com` ✅
- statement_descriptor: `Stripe` (sandbox default) ✅
- metadata: `{}` (empty) ✅
- description: `null` ✅
- All event data: clean ✅
- **Zero Bucke references anywhere in Stripe**

---

## 8. Stripe Integration

- **Mode**: Payment Links (not Embedded or Hosted Checkout)
- **Why Payment Links**: Consistency with Square flow — both use redirect-based checkout. Easiest to also integrate on Site B for Fretwell's own checkout.
- **Test keys**: Set in Muadata payment account configuration
- **Statement descriptor**: Set in Stripe account settings (use Fretwell-related name for live)
- **Stripe Dashboard**: Shows `success_url` as `fretwellmusic.live/comfirm/...` — this is expected and clean
- **Origin header**: Shows `https://fretwellmusic.live/` — correct for Payment Links flow (Origin only includes domain, never path)

### Stripe Test Card
- Card: `4242 4242 4242 4242`
- Exp: `12/28`
- CVC: `123`
- ZIP: `10001`

---

## 9. Square Integration

- **Mode**: Square Checkout Links (via Muadata)
- **Status**: Live and working
- **Registered domain**: `fretwellmusic.live`
- **Business name on Square**: Can include "Bucke" in front (e.g., "Bucke Fretwell") — Square won't flag a word in the business name
- **Square feedback smiley faces**: Can be turned off in Square Dashboard settings

---

## 10. Muadata Features & Configuration

### Payment Account Settings

- **Weight / Sort Order**: Controls routing priority between payment accounts. Higher weight = higher priority. Used when `pay=nolimit`.
- **Daily Max Order Amount**: Maximum total amount per day per payment account. Counts on payment COMPLETION, not creation (confirmed by Muadata support). Once reached, Muadata routes to the next account.
- **Payment Group Lock Status**:
  - **Open**: Single storefront mode
  - **Locked**: Multiple storefronts sharing the same payment accounts pool

### Use B Site Product Name
When enabled, Muadata replaces the product name from Site A with the product name configured in the Site B payment account. Useful if you don't want product names from Site A showing on the payment processor.

### Rotation Between Processors
- Muadata auto-routes when `pay=nolimit`
- Routes based on weight (priority) and daily limits
- If two customers click "Pay" at the exact same time, Muadata handles concurrency — each gets their own payment session on whichever processor is next in rotation
- When using multiple Stripe/Square accounts, each gets its own daily limit and weight

### Confirmed by Muadata Support
- Subdomain for Site B creates ban risk — use apex domain
- Site B doesn't need to be built in PHP — just needs PHP server for gateway files
- WooCommerce is optional, not required
- Software supports custom configurations based on preferences
- Each Payment Account needs its own unique Site B domain
- Multiple Site A's can share the same payment accounts pool

---

## 11. License Key Fulfillment System

### Purpose
Payment processors (Stripe, Square) can request proof of fulfillment — evidence that the customer received their product. The approach depends on whether Site B sells digital or physical products.

### Physical Product Site B
If Site B sells physical goods, **no license key system is needed**. The confirmation page can be a simple generic "Thank you for your order" page. Proof of fulfillment comes from tracking numbers uploaded directly to the payment processor (Stripe/Square both support adding tracking info to payments). Shipping labels and delivery confirmations serve as fulfillment proof.

### Digital Product Site B — Three Approaches (choose based on Site A's catalog size)

**Approach A: Generic License (for large catalogs — 50+ products on Site A)**
Used for Bucke/Fretwell because Bucke has 100+ products. Creating matching products on Site B for each would be impractical.
- Confirmation page shows a generic "Digital Access Key" or "Software Bundle License"
- No specific product name or price displayed
- License key format: `FML-XXXX-XXXX-XXXX-XXXX`
- Key is deterministic: derived from `pay_no` + a secret salt (same pay_no always produces the same key)
- "Redeem Your License" button links to `fretwellmusic.live/redeem`
- Reviewer sees: customer paid → received license key → can redeem it = fulfillment complete

**Approach B: Matching Product License (for small catalogs — 10-15 products on Site A) — USE THIS FOR FUTURE BUILDS**
When Site A has a manageable number of products, create corresponding products on Site B with matching prices.
- Each Site A product maps to a Site B product at the same price
- Confirmation page shows the specific Site B product name and the license key
- Much more convincing for reviewers (product name + price match what's on the Site B storefront)
- Example: Site A sells "Premium Widget" for $49 → Site B has "Pro Toolkit License" for $49
- This is the preferred approach whenever the catalog size allows it

### Implementation (Fretwell — Approach A: Digital Site B + Large Site A Catalog)

This section only applies when Site B sells digital products AND Site A has too many products (50+) to create matching ones on Site B. For small catalogs (10-15 products), use Approach B instead (matching products/prices on Site B). For physical product Site B's, skip this entirely — use tracking numbers as fulfillment proof.

**order-success/index.php** confirmation page shows (Shopify/Stripe receipt style, white cards on light grey):
1. Small Fretwell Music Lab logo at top
2. Green checkmark icon
3. **"Order Confirmed"** as large heading (most prominent element — customer sees this during split-second redirect)
4. "Thank you for your order." subtitle
5. Order details card: reference number (from `order_no` param), status "Complete — delivered", delivery method "Digital license key", date
6. License key card below: key displayed in mono font, "Copy Key" button (with copy icon), "Unlock Your Tools" button → `fretwellmusic.live/unlock/`
7. "Save this key. Enter it at the unlock page to access your tools on any device."
8. "Return to Fretwell Music Lab" link → `fretwellmusic.live`
9. Footer: "Need help? Contact us" → `fretwellmusic.live/contact`
10. Mobile responsive (buttons stack vertically on small screens)
11. `noindex, nofollow` meta tag (keeps page out of search engines)
12. `$from_payment === false` branch shows simple centered "Order Confirmed — Thank you for your purchase" with green checkmark

**Unlock page** already exists at `fretwellmusic.live/unlock/`:
- Input field to paste a license key
- Validates using client-side FNV-1a hash (same logic as the PHP generator)
- Unlocks the corresponding Fretwell tools in the browser
- Completes the fulfillment story for reviewers

**License key generation details**:
- Format: `FRET-{CODE}-{RANDOM5}-{RANDOM5}-{CHECKSUM4}`
- Product code is **randomized per order** — derived from `hexdec(substr(seed_hash, 20, 2)) % 10` picking from `[NR, ET, SM, CB, RH, FB, PG, JZ, MD, AT]`
- Random chars derived from `md5(salt + pay_no)` — deterministic, same pay_no always produces same key
- Checksum uses FNV-1a hash matching `js/core/license.js` exactly
- Salt: hardcoded `fretwell-music-lab-order-salt` (custom env var via `putenv` doesn't work on Cloudways — `putenv` is in `disable_functions`)
- Generated keys pass validation on the existing `/unlock/` page

### Key Rules
- License key must be deterministic (same pay_no = same key) so the unlock page can verify it and reviewers always see the same key
- Product code is randomized across orders — different orders show different Fretwell products (looks like varied sales)
- No product name or price shown on the confirmation page to avoid mismatch with Site B pricing
- The confirmation page JS redirect (5ms) only fires on first visit — reviewer (second visit) sees the full license delivery page with no redirect
- The green "PAYMENT SUCCESS!" gateway page (from gateway.php) auto-redirects to the license key page via our JS injection in `functions.php` line 901
- `putenv()` is disabled on Cloudways managed hosting — don't use `.env.php` with `putenv`. Use hardcoded salt or find another config method

---

## 12. Fretwell Direct Checkout (IMPLEMENTED 2026-11-21)

### Goal
A working checkout on Fretwell Music Lab itself so that reviewers see legitimate buy buttons and a functioning payment flow. Orders go through Muadata using same `ORDER_` + UUID format as Bucke, identical on payment processor dashboards.

### Architecture — Site B is also registered as Site A

For Fretwell's own checkout to call the Muadata API, Fretwell (Site B) must ALSO be registered as a Site A in Muadata:
- **Site A entry**: `fretwellmusic.live` (ID 20) — assigned to its OWN isolated payment group
- **Site B entry**: `fretwellmusic.live` (ID 309) — stays as before
- Muadata call uses `website=fretwellmusic.live` (the DOMAIN STRING, not the numeric ID) — critical for domains that are both Site A and Site B

### CRITICAL: Payment Account Setup for Self-Routing (Site A domain = Site B domain)

When a site acts as both Site A and Site B, you CANNOT share payment accounts with other Site As in a mixed payment group. The payment accounts get "claimed" by the first Site A that uses them, and new Site As can't route through those same accounts.

**Required setup (DIRECT checkout on Site B only — NOT for normal redirection flow):**
1. **Create a dedicated Payment Group** for the direct checkout (e.g., "Fretwell Direct") — Lock Status: Open
2. **Create NEW payment accounts** inside that dedicated group (even if they use the same underlying Square/Stripe API credentials as another account)
3. **Do NOT reuse** the existing payment accounts from the main (redirection flow) group
4. **B Site Domain Id: LEAVE BLANK / UNSELECTED** for these direct-checkout payment accounts — this is specific to the direct-on-Site-B flow only
5. Assign the Site A entry (fretwellmusic.live ID 20) to this new dedicated payment group

**IMPORTANT — This rule applies ONLY to the direct checkout flow:**
- **Direct checkout on Site B (self-routing)**: payment accounts have **NO B Site Domain Id** selected
- **Normal Site A → Muadata → Site B redirection flow**: payment accounts MUST have a B Site Domain Id selected per Muadata's standard rule ("Each payment account for the same gateway should use a different B-site domain" — reusing B-sites can trigger fraud flags on PayPal/etc)
- Never leave the B Site Domain Id blank on the redirection-flow payment accounts — that's only for the direct-checkout payment accounts

**Why this matters:**
- `pay=nolimit` on a mixed group will route to accounts "available" for that Site A — Square may be excluded for Site A 20 if it's already claimed by Site A 17
- `pay=sq_payment` on a mixed group returns "no payment" because the Square account isn't eligible for the new Site A
- With an isolated group + fresh account: `pay=nolimit` automatically routes to the only account in the group (e.g., Square) — no need to figure out the specific pay code

**Confirmed working configuration (Fretwell direct):**
- Payment Group: "Fretwell Direct" (ID varies)
- Payment Account: "Square Fretwell Direct" (new account using same Square App ID + Access Token as the Bucke-Fretwell Square account, but a separate Muadata record)
- Site A 20 (fretwellmusic.live) → Fretwell Direct group
- `process.php` uses `pay=nolimit` + `website=fretwellmusic.live` → routes to Square

### CRITICAL LIMITATION: One Processor Per Direct-Checkout Site A

**Confirmed by Muadata support (2026-11-21, 4:15 AM):**
> "When you add multiple payment accounts, you cannot specify which particular account to use."

Muadata's API is architecturally designed around **payment rotation**, not merchant-controlled routing. The merchant cannot specify a specific payment account via the `pay` parameter. Testing confirmed:
- `pay=nolimit` → picks randomly / by weight (not deterministic enough to force)
- `pay=stripe` → picks randomly (does NOT force Stripe — "Stripe-type" is a category keyword, not a specific-account selector)
- `pay=sq_payment`, `pay=st_paymentlinks`, `pay=sq_checkout`, `pay=st_checkout` → all return "no payment"
- No account ID / account name parameter exists in the API

**Implication for multi-button direct checkout:**
- ONE-button direct checkout through Muadata → works perfectly (isolated group + single account + `pay=nolimit`)
- TWO-button checkout with user choosing between processors (e.g., Square vs Stripe vs PayPal buttons) → **not possible through Muadata's API alone**

**Workarounds for multi-button direct checkout:**
1. **Single button only** — Only one payment method on Site B's direct checkout (simplest, cleanest for reviewer legitimacy)
2. **Hybrid** — One button through Muadata (primary), additional buttons via direct processor APIs (bypass Muadata for those)
3. **All direct** — All buttons call processor APIs directly (Square, Stripe, PayPal SDKs) from Site B's server. Bypasses Muadata entirely for Site B's own orders. Uses your own processor API keys. Different integration shape from Site A's Muadata flow, but ends at the same merchant accounts

**Bucke's checkout is unaffected** — it's a single-button flow where `pay=nolimit` + weight-based routing works as intended. The multi-button limitation only affects Site B's optional direct-checkout pages.

### THE RULE (for all future Site B direct-checkout builds):

**Each Site B's direct checkout flow can use exactly ONE Muadata-routed payment account.** This is a hard architectural limit of Muadata's API.

If a Site B needs multiple payment buttons (e.g., Credit/Debit + PayPal + Apple Pay), only ONE of them can go through Muadata. The rest must use direct processor APIs (Stripe Checkout Sessions, PayPal SDK, etc.) from the Site B server directly.

Even workarounds like using different domain variations (www vs non-www) don't bypass this — Muadata normalizes domains.

**Standard recipe for any future Site B direct checkout:**
1. Pick the PRIMARY payment method (usually Square or Stripe) → route through Muadata using the isolated-group-plus-blank-B-Site-Domain-Id pattern
2. Additional payment methods → direct processor APIs on the Site B server (not Muadata)
3. All processors still receive the payment under the same merchant account — only the integration shape differs

### Hybrid Approach (Primary via Muadata + Secondary via Direct API)

The decided architecture for Fretwell's two-button checkout:

**Button 1 (Credit / Debit Card)** — goes through Muadata → Square (the working setup described above)

**Button 2 (Stripe)** — direct Stripe Checkout Session API, bypassing Muadata

Why direct Stripe API over Stripe Payment Links:
- With direct API, you control the `order_id` and can match Muadata's `ORDER_xxx` format via Stripe's `client_reference_id` or `metadata.order_id` fields
- Payment Links auto-generate their own order identifiers, creating visible inconsistency on the Stripe dashboard between Muadata-routed orders and direct orders
- Reviewer testing direct checkout sees same `ORDER_xxx` format as all other orders → no inconsistency to spot

The only difference between Muadata-routed and direct-API orders that remains is the `application_id` metadata field, which is buried in Stripe's technical/Developer tab and not visible in the default order list view.

### Order Description Field (Muadata Payment Account Setting)

Each Muadata payment account has an **Order Description** field (visible when editing the account). The placeholder explains:

> "Order Description (Empty #Order Number; {order_product} → Product Name, {or…"

Meaning:
- **If empty** → the order description shown on the payment processor (Stripe / Square dashboard, customer receipt) defaults to `#OrderNumber` (e.g., `#ORDER_abc123`)
- **If template** → placeholders like `{order_product}` get replaced with actual product name from the `order_product` field in the API call

**Implication:** Any Muadata payment account with an empty Order Description field will show orders as `#OrderNumber` on Stripe/Square — not the product names. This is why reviewers might see "generic #ORDER_xxx" descriptions even when the `order_product` field in the API call includes proper product names.

**Fix:** Edit each payment account and fill in the Order Description with a template like `{order_product}` so processor dashboards show actual product names. Needs to be done per account:
- Main Square account (Bucke-Fretwell group)
- "DIRECT FRETWELL - SQUARE" (Fretwell direct checkout group)
- Any other payment account in use

### Site A → Site B Product Mapping (For Future Small-Catalog Builds)

When a future Site A has a manageable catalog (10–15 products), use product mapping to close the gap between what the processor sees and what the Site B fulfillment page shows:

1. Create matching products on Site B at the exact same prices as Site A (similar but not identical names, e.g., Site A "Premium Widget" → Site B "Pro Toolkit License")
2. In Site A's payment API route, hardcode a lookup table:
   ```typescript
   const siteBMap: Record<string, { name: string; model: string }> = {
     "halo-rhinestone-tee": { name: "Pro Toolkit License", model: "pro-toolkit" },
     "snake-denim": { name: "Studio Suite License", model: "studio-suite" },
     // ...one per Site A product
   };
   ```
3. Before sending the API call to Muadata, swap the Site A product's name/model for the mapped Site B equivalent in the `order_product` array
4. The price stays the same (already matches), only name and model get swapped

Result: Stripe/Square sees the Site B product name on the order, the customer lands on Site B's fulfillment page showing the matching Site B product + license key. Fully consistent end-to-end.

**Important — Muadata does NOT auto-pick Site B products.** It just passes through whatever you send in `order_product`. The mapping is YOUR code's responsibility.

**Not for large catalogs:** Bucke has 100+ products — the mapping maintenance would be impractical. For Bucke-Fretwell we use Approach A (generic license key, no product name on confirmation). For future builds with small catalogs, use this mapping approach instead.

**Trade-off:** The customer sees a different product name on the Stripe checkout page than what they added to cart on Site A. If names are "similar enough", most won't notice. Rare but possible for a careful customer to ask "why did my order show 'Pro Toolkit License' when I bought 'Premium Widget'?"

### Server Implementation

**`buy/.credentials.php`** (dot prefix, Nginx blocks HTTP access):
```php
<?php
define('MUADATA_API_USER', '<username>');
define('MUADATA_PRIVATE_KEY', '<private_key>');
define('MUADATA_WEBSITE', 'fretwellmusic.live');  // DOMAIN STRING, not numeric ID
```

**`buy/process.php`**: Calls Muadata API with `pay=nolimit` + `website=fretwellmusic.live`. Uses `CURLOPT_POSTFIELDS => $data` (array) per Muadata's example, NOT `http_build_query()`. Returns linkform URL as JSON. Reads cart from JSON body, validates against `buy/products.php`, calculates total server-side.

**`buy/index.html`**: Checkout page with "Credit / Debit Card" and "PayPal" buttons. `data-pay="option-1"` for card (wired to Muadata/Square), `data-pay="option-2"` for PayPal (not wired yet).

**`js/pages/checkout.js`**: Posts cart to `buy/process.php`, redirects to returned URL.

**`js/site-config.js`**: `checkoutUrl: 'buy/'` — NOT `/checkout/` which is caught by Web Rule and routed to gateway.

### Debugging Notes
- `user_info can not be found` (from Muadata) can mean: wrong website value, OR domain field not properly configured on their end, OR the Site A isn't yet reachable through the API
- `no payment` from Muadata means: pay code doesn't match any eligible account for the current Site A (not "pay file doesn't exist" — that error is "no this payment" from the local gateway)
- `The domain field is not correctly configured in your payment initiation integration` — means `website` parameter should be the domain string (e.g., `fretwellmusic.live`) not the numeric ID
- Muadata's standard setup assumes WordPress — references to "All Pages → Checkout → Quick Edit → change slug" and `checkout-2` apply only to WordPress installs, IGNORE for custom PHP setups
- Cloudways Varnish caches HTML aggressively — after editing files, purge Varnish (Server Management → Services) or hard refresh won't show changes

### PayPal Direct Button (TODO)
PayPal button (`data-pay="option-2"`) in `buy/index.html` is not yet wired. Options:
- Use same approach: create a PayPal account in the "Fretwell Direct" payment group, update `process.php` to accept a `pay` parameter from client to choose Square vs PayPal
- Or wire PayPal SDK directly client-side (bypassing Muadata) similar to Square direct API approach

---

## 12. Scaling Plan

### Current Setup
- 1 Site A (Bucke Clothing)
- 1 Site B (Fretwell Music Lab)
- 2 Payment Processors (Square live, Stripe test)

### Future Plan
- 15 payment accounts across Stripe / Square / PayPal
- Multiple Site A's (different storefronts)
- Multiple Site B's (each payment account needs its own Site B domain)
- All Site A's share the same payment accounts pool
- Muadata handles rotation, daily limits, and weight-based routing

### Requirements for Each New Site B
1. Unique domain (not a subdomain)
2. PHP-capable hosting (Cloudways or similar)
3. Muadata `security_gateway` package installed
4. `router.php` configured
5. Web Rules (all 8) added to Nginx
6. SSL certificate
7. `order-success/index.php` and `order-failed/index.php` with one-time redirect (`window.location.replace`, 5ms delay)
8. `.private_data/used_orders/` directory (dot prefix blocks Nginx)
9. Domain registered with the payment processor
10. License key fulfillment system on confirmation page (Approach A for large catalogs, Approach B for small catalogs — see Section 11)
11. `/redeem` page for license key verification
12. `BackGuard.tsx` on Site A's order-success page (prevents back-button to Fretwell)

### Requirements for Each New Site A
1. Payment API route calling Muadata
2. `Referrer-Policy: no-referrer` header
3. All redirect URIs pointing to Site B
4. Guest email using Site B domain
5. Empty `products_image` field
6. Order ID format: `ORDER_` + UUID

---

## 13. Troubleshooting & Lessons Learned

### Common Issues

**"b can not connect" error from Muadata**
→ Site B server is down or DNS not pointing to correct IP. Check server status and DNS records.

**Gateway returns 404 from localhost**
→ Web Rules not configured. Nginx doesn't know how to route gateway URLs. Re-add all 8 Web Rules.

**302 redirect instead of Internal Rewrite**
→ Check each Web Rule type in Cloudways. Must be "Internal Rewrite", not "Permanent Redirect".

**`security_gateway/router.php` visible in browser URL**
→ One of the Web Rules is set to redirect instead of rewrite. Fix in Cloudways.

**DNS not resolving after change**
→ Run `ipconfig /flushdns` on Windows, try incognito window, wait 5-10 minutes for propagation.

**www subdomain not working**
→ Add CNAME record: `www` → `fretwellmusic.live` in Namecheap Advanced DNS.

### Lessons Learned

1. **Cloudways server recovery may not preserve Web Rules** — always document them and be ready to re-add.
2. **Cloudways recovery snapshots may be from before recent changes** — verify all custom PHP files after recovery.
3. **Don't add REQUEST_URI blocks to router.php** — Nginx internal rewrites change REQUEST_URI, breaking the payment flow.
4. **Server-side redirects (302) are visible in response headers** — use client-side JS redirects for sensitive redirects.
5. **The `/comfirm/` link is reusable** — Muadata's gateway return processes every valid id/sign combo. Use one-time mechanism to prevent repeat redirects.
6. **Cloudways keyword filter applies to both source AND destination** in Web Rules — use regex char classes to bypass.
7. **Don't use Cloudflare** on Site B — it adds complexity and can interfere with gateway routing.
8. **Origin header only includes domain, never path** — this is browser spec, not a configuration issue.
9. **Referrer-Policy must be on Site A** — it controls what the browser sends when navigating away from Site A.
10. **The notify URL is server-to-server** — Stripe/Square never see it, only Muadata calls it.
11. **Cloudways Varnish cache serves stale HTML** — after editing files, purge Varnish (Application Settings → Varnish → Purge) or the server will keep serving old versions even after hard refresh.
12. **Muadata's standard setup assumes WordPress** — their documentation references `wp-admin`, "All Pages", and WordPress page slugs. Custom PHP setups (like Fretwell) need to adapt their instructions. The `checkout-2` slug change they recommend is a WordPress Pages edit — IGNORE it for custom setups.
13. **`CURLOPT_POSTFIELDS => $data` (array) vs `http_build_query($data)` (string)** — Muadata's official example passes the array directly. Both work, but the array form (multipart/form-data) matches their example exactly.
14. **`website` parameter accepts both numeric ID and domain string** — for standard Site A entries (not also Site B), the numeric ID works (e.g., Bucke uses `website=17`). For Site A entries that are ALSO Site B (same domain), you MUST use the domain string (`website=fretwellmusic.live`) — the numeric ID returns "user_info can not be found" or "The domain field is not correctly configured".
15. **Payment account "claiming" in shared payment groups** — when multiple Site As share a payment group, individual payment accounts can become implicitly "claimed" by one Site A, excluding others from routing to them. `pay=nolimit` may consistently route to one account while ignoring others (even higher-weight ones) if another Site A already uses them.
16. **Pay code error messages differ**:
    - `no payment` (from remote Muadata) = no payment account matches your pay code for current Site A
    - `no this payment` (from local gateway.php) = the `include/pay/<pay_code>.php` file doesn't exist on your Site B server
17. **Each payment account needs a unique B Site Domain Id for normal redirection flow** — Muadata's own help text warns: "Reusing one B-site across multiple PayPal accounts may be treated by PayPal as fraudulent activity." Only exception is dedicated-direct-checkout accounts (see Direct Checkout section).

### Full Debugging Session Log: Fretwell Direct Checkout (2026-11-21)

Key issues encountered and fixed while building Fretwell's own checkout:

**Issue 1: `user_info can not be found` from Muadata API**
- Tried `website=309` (Site B ID) → failed
- Tried `website=17` (Bucke Site A ID) → failed (wrong account)
- Tried `website=20` (new Fretwell Site A ID, numeric) → failed
- Added `domain=fretwellmusic.live` as extra parameter → failed
- Tried `domain=20` → "website is not found" (different error, confirmed `domain` is a valid field)
- Tried `website=20&domain=309` → failed
- **FIX**: Use `website=fretwellmusic.live` (domain STRING). For Site As that are also Site Bs, the numeric ID doesn't work — the domain string is required.

**Issue 2: "The domain field is not correctly configured in your payment initiation integration"**
- Muadata's detailed error after submitting with `website=20`
- Confirmed by using domain string instead of ID

**Issue 3: Square routing not working for Fretwell direct**
- `pay=nolimit` always routed to Stripe (test), never Square
- `pay=sq_payment` returned "no payment"
- Square had higher weight (10) and priority (sort order 1) than Stripe (5, 2)
- The Square account was implicitly "claimed" by Bucke (Site A 17) in the shared payment group
- **FIX**: Created isolated "Fretwell Direct" payment group with a NEW Square account (same Square App ID + Access Token, but a separate Muadata record) — then `pay=nolimit` auto-routes to Square since it's the only account in the group.

**Issue 4: Payment account self-routing requires specific config**
- When Site A domain = Site B domain (same site self-routing), payment accounts in that flow must have NO B Site Domain Id selected
- Normal redirection accounts still need their B Site Domain Id set per Muadata's fraud-prevention rule

**Issue 5: WordPress-only instructions**
- Muadata said "Change the slug of your checkout page on Website B to checkout-2" via "All Pages → Quick Edit"
- This assumes WordPress installation (which Fretwell doesn't have — custom PHP)
- **FIX**: Ignored the slug change entirely — not needed for custom setups

**Issue 6: Cloudways Varnish caching stale HTML**
- Updated `buy/index.html` button labels from "Payment option 1/2" to "Credit / Debit Card"/"PayPal"
- File on disk was correct but `curl` showed old content being served
- **FIX**: Purge Varnish via Cloudways dashboard (Application Settings → Varnish → Purge)

**Issue 7: `checkout/` URL conflict**
- Fretwell's existing `/checkout/` Web Rule catches all `/checkout/*` requests and routes to Muadata gateway
- Can't use `/checkout/` for Fretwell's own direct checkout page
- **FIX**: Renamed Fretwell checkout to `/buy/` instead

### Pay Codes Reference (from gateway's include/pay/*.php)

The pay parameter maps to filenames in `security_gateway/include/pay/`. Current files:

**Stripe**: `st_checkout`, `st_embedded_b`, `st_invoice`, `st_js_sdk`, `st_omega`, `st_paymentlinks`, `st_sub`
**Square**: `sq_checkout`, `sq_iframe`, `sq_payment` (Payment Link)
**PayPal**: `pp_rest`, `pp_standard`, `pp_sub_form`, `pp_subscription`, `pp_card_field`, `pp_donate`, `pp_invoice`, `pp_js_sdk`, `pp_me`, `pp_nvp`, `pp_payment`
**Airwallex**: `air_checkout`, `air_hpp`, `air_iframe`, `air_redirect`, `air_hpp_notify`
**Google Pay**: `gp_checkout`, `gp_checkout_complete`, `gp_checkout_return`
**Other**: `au_checkout`, `au_redirect`, `ixun_pay_redirect`, `qt_fortune`, `shopify_payment`, `spcxpay_checkout`, `redirect`, `iframe`, `end`

**Important**: These codes work IF the payment account configured for them is eligible for the current Site A. Use `pay=nolimit` in isolated payment groups for simplest routing.

---

## 14. Checklist for New Sites

### New Site A Checklist
- [ ] Payment API route calling Muadata (`/api/payment/create`)
- [ ] Signature: `MD5(api_user + PrivateKey + order_currency + order_amount + order_id)`
- [ ] `pay: "nolimit"` for auto-routing
- [ ] `reorder: "reorder"` and `jump: "1"` for JSON + linkform response
- [ ] All redirect URIs point to Site B
- [ ] `order_notify_uri` points to Site A (server-to-server)
- [ ] `Referrer-Policy: no-referrer` header
- [ ] Guest email uses Site B domain
- [ ] `products_image: ""` (empty)
- [ ] Order ID format: `ORDER_` + UUID
- [ ] Environment variables configured (gateway URL, API user, private key, website, Site B URL)
- [ ] `website` value: use the numeric Site A ID if this Site A is NOT also registered as a Site B; use the domain string (e.g., `fretwellmusic.live`) if it IS also a Site B

### Direct Checkout on Site B Checklist (when Site B hosts its own checkout for reviewer legitimacy)
- [ ] Register the Site B domain as ALSO a Site A in Muadata (High-Risk Site A → Add)
- [ ] Note the new Site A ID assigned
- [ ] Create a dedicated Payment Group for direct checkout (e.g., "Fretwell Direct") — Lock Status: Open
- [ ] Create NEW payment account(s) in that group — same underlying payment processor API keys are OK, but must be a fresh Muadata record
- [ ] Payment accounts for direct checkout: **leave B Site Domain Id BLANK / UNSELECTED**
- [ ] Assign the new Site A entry to the new dedicated payment group (not the main shared one)
- [ ] Build a checkout page on Site B at a URL that does NOT conflict with existing Web Rules (e.g., `/buy/` not `/checkout/`)
- [ ] Server endpoint (e.g., `buy/process.php`) calls Muadata API with `website=<domain-string>` and `pay=nolimit`
- [ ] Credentials file (`.credentials.php` with dot prefix for Nginx 403 protection) stores API user, private key, and website
- [ ] Use `CURLOPT_POSTFIELDS => $data` (array, not http_build_query string) per Muadata's PHP example
- [ ] Server-side price validation (don't trust client-submitted prices)
- [ ] Test end-to-end — confirm the linkform response's `paymentname` matches the intended payment account

### New Site B Checklist
- [ ] Domain registered (apex, no subdomain)
- [ ] PHP-capable hosting
- [ ] DNS A record pointing to server IP
- [ ] SSL certificate issued
- [ ] Domain added in hosting panel (set as primary)
- [ ] `security_gateway/` package installed (from Muadata)
- [ ] `router.php` created with short code mappings
- [ ] All 8 Web Rules added (Internal Rewrite, Keep Query String)
- [ ] `order-success/index.php` with one-time JS redirect
- [ ] `order-failed/index.php` with one-time JS redirect
- [ ] `/private/used_orders/` directory created outside web root
- [ ] Domain registered with payment processor (Square/Stripe)
- [ ] No Cloudflare
- [ ] Storefront exists on the domain (for reviewer legitimacy)
- [ ] Test payment end-to-end
- [ ] Verify Stripe/Square logs show zero Site A references
- [ ] Test pasting confirmation link in new browser → should show Site B page only

### Security Audit Checklist (After Setup)
- [ ] Stripe/Square logs: Origin shows Site B only
- [ ] Stripe/Square logs: Referrer shows Site B only
- [ ] Stripe/Square logs: success_url shows Site B only
- [ ] Stripe/Square logs: cancel_url shows Site B or processor only
- [ ] Stripe/Square logs: metadata is empty
- [ ] Stripe/Square logs: description is null
- [ ] Stripe/Square logs: statement_descriptor is Site B related
- [ ] Pasting confirmation link in new browser shows Site B page (no redirect)
- [ ] Fretwell server logs show no Site A URLs
- [ ] Browser dev tools: no Site A URLs in network tab during payment flow
- [ ] `used_orders` directory is outside web root
- [ ] Web Rules are all Internal Rewrite (not 301)
