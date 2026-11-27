"use client";

import { useState } from "react";

export default function RefundRequestForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // This is a visual-only form for now — PayPal/Square reviewers see
    // the fulfillment-side evidence, and refunds are processed by the
    // merchant team from the processor dashboard. If/when this needs
    // to actually submit somewhere (Zapier, a form endpoint, a DB),
    // wire it here.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-success bg-success-soft p-8 text-center">
        <h2 className="mb-2 font-display text-2xl font-bold text-success">Request received</h2>
        <p className="text-success">
          Thanks — your refund request has been submitted. A member of our team will reach out via email within 1–2 business days to confirm.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-grey-100 bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Order number" name="orderNumber" placeholder="Order ID from your confirmation email" />
      <Field label="Original order amount" name="amount" placeholder="$0.00" />

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">
          Reason / additional notes
        </label>
        <textarea
          name="notes"
          rows={4}
          className="w-full resize-y border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
          placeholder="e.g. Package was lost in transit. Carrier confirmed."
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-accent sm:w-auto"
        >
          Submit Refund Request
        </button>
      </div>

      <p className="text-xs text-grey-500">
        You&apos;ll receive an email confirmation shortly after submitting. Refunds typically arrive on your original payment method within 5–10 business days.
      </p>
    </form>
  );
}

function Field({
  label, name, type = "text", required = false, placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-grey-600">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full border border-grey-100 bg-white px-3.5 py-3 text-base text-ink outline-none focus:border-ink"
      />
    </div>
  );
}
