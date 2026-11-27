"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* Local-storage keys */
const KEY_STORE = "bucke_admin_key";
const LOG_STORE = "bucke_admin_tracking_log";

type Carrier = "USPS" | "FedEx" | "UPS" | "DHL";

type LogEntry = {
  id: string;
  sentAt: number;
  email: string;
  firstName?: string;
  orderNumber?: string;
  carrier: Carrier;
  trackingNumber: string;
  estimatedDelivery?: string;
  shippingAddress?: string;
  followUpSentAt: number | null;
};

type Status = { type: "ok" | "err"; msg: string } | null;

export default function AdminSendClient() {
  const [key, setKey] = useState<string>("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateStatus, setGateStatus] = useState<Status>(null);
  const [tab, setTab] = useState<"send" | "log">("send");
  const [log, setLog] = useState<LogEntry[]>([]);

  // Hydrate from localStorage once on mount. Deferred via queueMicrotask
  // to avoid the react-hooks/set-state-in-effect lint — reading
  // localStorage is a side-effect sync that MUST run client-side (SSR
  // can't see it), and the deferred update is a one-shot hydration.
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(KEY_STORE);
        if (stored) {
          setKey(stored);
          setUnlocked(true);
        }
        const raw = localStorage.getItem(LOG_STORE);
        if (raw) setLog(JSON.parse(raw));
      } catch {}
    });
  }, []);

  function persistLog(next: LogEntry[]) {
    setLog(next);
    try {
      localStorage.setItem(LOG_STORE, JSON.stringify(next));
    } catch {}
  }

  function unlock(inputKey: string) {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setGateStatus({ type: "err", msg: "Enter the key to unlock." });
      return;
    }
    try {
      localStorage.setItem(KEY_STORE, trimmed);
    } catch {}
    setKey(trimmed);
    setUnlocked(true);
    setGateStatus(null);
  }

  function lock() {
    try {
      localStorage.removeItem(KEY_STORE);
    } catch {}
    setKey("");
    setUnlocked(false);
  }

  if (!unlocked) {
    return (
      <AdminChrome>
        <Gate onUnlock={unlock} status={gateStatus} />
      </AdminChrome>
    );
  }

  return (
    <AdminChrome onLock={lock}>
      <nav className="mb-6 flex gap-1 border border-grey-100 bg-white p-1">
        <TabBtn active={tab === "send"} onClick={() => setTab("send")}>Send Tracking</TabBtn>
        <TabBtn active={tab === "log"} onClick={() => setTab("log")}>
          Sent Tracking
          {log.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              {log.length}
            </span>
          )}
        </TabBtn>
      </nav>

      {tab === "send" ? (
        <TrackingForm
          adminKey={key}
          onSent={(entry) => persistLog([entry, ...log])}
          onUnauthorized={lock}
        />
      ) : (
        <LogView
          log={log}
          adminKey={key}
          onUpdate={persistLog}
          onUnauthorized={lock}
        />
      )}
    </AdminChrome>
  );
}

/* ---------------- Chrome ---------------- */

function AdminChrome({ children, onLock }: { children: React.ReactNode; onLock?: () => void }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-grey-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-[0.08em] text-ink no-underline">
            BUCKE
          </Link>
          <span className="inline-block border border-accent/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            Admin
          </span>
          {onLock && (
            <button
              type="button"
              onClick={onLock}
              className="text-sm text-grey-600 hover:text-ink"
            >
              Lock
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-9 pb-24">{children}</main>
    </div>
  );
}

/* ---------------- Gate ---------------- */

function Gate({ onUnlock, status }: { onUnlock: (k: string) => void; status: Status }) {
  const [val, setVal] = useState("");
  return (
    <div className="mx-auto mt-16 max-w-md border border-grey-100 bg-white p-7">
      <h1 className="mb-2 font-display text-2xl font-bold">Enter admin key</h1>
      <p className="mb-5 text-sm text-grey-600">
        This page is private. Enter the admin key to send order emails.
      </p>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">
        Admin key
      </label>
      <input
        type="password"
        autoComplete="off"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onUnlock(val);
        }}
        placeholder="paste key"
        className="w-full border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
      />
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => onUnlock(val)}
          className="bg-ink px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-accent"
        >
          Unlock
        </button>
      </div>
      <StatusBanner status={status} className="mt-5" />
    </div>
  );
}

/* ---------------- Tracking form ---------------- */

function TrackingForm({
  adminKey,
  onSent,
  onUnauthorized,
}: {
  adminKey: string;
  onSent: (e: LogEntry) => void;
  onUnauthorized: () => void;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [carrier, setCarrier] = useState<Carrier>("USPS");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit() {
    setStatus(null);
    if (!email || !trackingNumber) {
      setStatus({ type: "err", msg: "Email and tracking number are required." });
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          template: "tracking",
          email, orderNumber, carrier, trackingNumber,
          estimatedDelivery, shippingAddress,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setStatus({ type: "err", msg: "Invalid admin key. Re-enter." });
        setTimeout(onUnauthorized, 1200);
        return;
      }
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || `Send failed (HTTP ${res.status})` });
        return;
      }
      setStatus({ type: "ok", msg: `✓ Email sent to ${email}` });
      onSent({
        id: `trk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sentAt: Date.now(),
        email, firstName, orderNumber, carrier, trackingNumber,
        estimatedDelivery, shippingAddress,
        followUpSentAt: null,
      });
      // Clear fields for next send (keep carrier)
      setEmail(""); setFirstName(""); setOrderNumber("");
      setTrackingNumber(""); setEstimatedDelivery(""); setShippingAddress("");
    } catch (err) {
      setStatus({ type: "err", msg: `Network error: ${err instanceof Error ? err.message : "unknown"}` });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border border-grey-100 bg-white p-6">
      <h2 className="mb-1 font-display text-xl font-bold">Send tracking email</h2>
      <p className="mb-5 text-sm text-grey-600">
        Notify a customer that their order has shipped, with carrier + tracking number.
      </p>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Customer email *" value={email} onChange={setEmail} type="email" />
        <Field label="Customer first name" value={firstName} onChange={setFirstName} />
      </div>
      <Field label="Order number (optional)" value={orderNumber} onChange={setOrderNumber} />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="field">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">
            Carrier
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value as Carrier)}
            className="w-full border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
          >
            <option value="USPS">USPS</option>
            <option value="FedEx">FedEx</option>
            <option value="UPS">UPS</option>
            <option value="DHL">DHL</option>
          </select>
        </div>
        <Field label="Tracking number *" value={trackingNumber} onChange={setTrackingNumber} />
      </div>
      <Field label="Estimated delivery (optional)" value={estimatedDelivery} onChange={setEstimatedDelivery} />
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">
          Shipping address (optional)
        </label>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder={"1417 Stonewood Road\nBaltimore, MD 21239"}
          className="w-full min-h-[90px] resize-y border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
        />
        <p className="mt-1.5 text-xs text-grey-500">
          One line per line. Optional — leave blank if you don&apos;t want to show it.
        </p>
      </div>

      <StatusBanner status={status} className="mt-4" />
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-ink px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send Tracking Email"}
        </button>
      </div>
    </section>
  );
}

/* ---------------- Log view ---------------- */

function LogView({
  log, adminKey, onUpdate, onUnauthorized,
}: {
  log: LogEntry[];
  adminKey: string;
  onUpdate: (next: LogEntry[]) => void;
  onUnauthorized: () => void;
}) {
  const [status, setStatus] = useState<Status>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...log].sort((a, b) => b.sentAt - a.sentAt), [log]);

  async function sendFollowUp(entry: LogEntry, isResend: boolean) {
    if (isResend && !confirm(`Re-send the follow-up to ${entry.email}? They have already received one.`)) return;
    setStatus(null);
    setWorkingId(entry.id);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          template: "followup",
          email: entry.email,
          orderNumber: entry.orderNumber || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setStatus({ type: "err", msg: "Invalid admin key. Re-enter." });
        setTimeout(onUnauthorized, 1200);
        return;
      }
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || `Send failed (HTTP ${res.status})` });
        return;
      }
      setStatus({ type: "ok", msg: `✓ Follow-up sent to ${entry.email}` });
      onUpdate(log.map((e) => (e.id === entry.id ? { ...e, followUpSentAt: Date.now() } : e)));
    } catch (err) {
      setStatus({ type: "err", msg: `Network error: ${err instanceof Error ? err.message : "unknown"}` });
    } finally {
      setWorkingId(null);
    }
  }

  function deleteEntry(id: string) {
    if (!confirm("Delete this entry from the sent-tracking log? This only removes it from your list here — it does NOT unsend the original email.")) return;
    onUpdate(log.filter((e) => e.id !== id));
  }

  return (
    <section className="border border-grey-100 bg-white p-6">
      <h2 className="mb-1 font-display text-xl font-bold">Sent tracking emails</h2>
      <p className="mb-5 text-sm text-grey-600">
        Every tracking email you&apos;ve sent from this device, newest first. Click <b>Send Follow-up</b> next to any entry to dispatch the fixed follow-up email to that customer.
      </p>

      {sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-grey-500">
          No tracking emails sent yet. Send one from the first tab and it&apos;ll appear here.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((e) => (
            <LogRow
              key={e.id}
              entry={e}
              working={workingId === e.id}
              onSendFollowUp={() => sendFollowUp(e, Boolean(e.followUpSentAt))}
              onDelete={() => deleteEntry(e.id)}
            />
          ))}
        </div>
      )}

      <StatusBanner status={status} className="mt-5" />
    </section>
  );
}

function LogRow({
  entry, working, onSendFollowUp, onDelete,
}: {
  entry: LogEntry;
  working: boolean;
  onSendFollowUp: () => void;
  onDelete: () => void;
}) {
  const sent = Boolean(entry.followUpSentAt);
  return (
    <div className="flex items-start gap-4 border border-grey-100 bg-paper p-4">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="break-all text-base font-bold text-ink">
            {entry.email}
            {entry.firstName && <span className="ml-2 font-normal text-grey-500">({entry.firstName})</span>}
          </div>
          <div className="whitespace-nowrap text-xs text-grey-500">{fmtDate(entry.sentAt)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm text-grey-600">
          {entry.orderNumber && (<span><b className="font-semibold text-ink">Order:</b> {entry.orderNumber}</span>)}
          <span className="inline-block border border-grey-100 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-grey-600">
            {entry.carrier}
          </span>
          <span className="break-all"><b className="font-semibold text-ink">{entry.trackingNumber}</b></span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          {sent ? (
            <>
              <span className="text-xs font-semibold text-success">
                ✓ Follow-up sent {entry.followUpSentAt ? fmtDate(entry.followUpSentAt) : ""}
              </span>
              <button
                type="button"
                onClick={onSendFollowUp}
                disabled={working}
                className="border border-grey-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-ink disabled:opacity-50"
              >
                {working ? "Sending…" : "Re-send"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSendFollowUp}
              disabled={working}
              className="bg-ink px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-accent disabled:opacity-50"
            >
              {working ? "Sending…" : "Send Follow-up"}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete entry"
        className="shrink-0 px-1.5 py-1 text-lg leading-none text-grey-400 hover:bg-white hover:text-accent"
      >
        ×
      </button>
    </div>
  );
}

/* ---------------- Primitives ---------------- */

function Field({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
      />
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-bold uppercase tracking-[0.06em] ${
        active ? "bg-ink text-white" : "bg-transparent text-grey-500 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBanner({ status, className = "" }: { status: Status; className?: string }) {
  if (!status) return null;
  const cls =
    status.type === "ok"
      ? "border-success bg-success-soft text-success"
      : "border-accent/40 bg-accent/5 text-accent";
  return (
    <div className={`border ${cls} px-4 py-3 text-sm ${className}`}>{status.msg}</div>
  );
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch {
    return String(ts);
  }
}
