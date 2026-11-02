"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import {
  CONTACT_TOPICS,
  sendContactMessage,
  validateContact,
  type ContactErrors,
  type ContactMessage,
  type ContactTopic,
} from "@/lib/contact";
import { cn } from "@/lib/format";

const EMPTY: ContactMessage = { name: "", email: "", topic: "product", orderNumber: "", message: "" };

const fieldClass =
  "mt-2 block w-full border-0 border-b bg-transparent px-0 py-3 text-base transition-[border-color,box-shadow] placeholder:text-grey-600 focus:border-ink focus:shadow-[0_1px_0_0_var(--color-ink)] focus:outline-none";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-grey-600">
          {hint}
        </p>
      )}
      {children}
      <p id={`${id}-error`} className="mt-2 min-h-5 text-sm text-accent">
        {error ?? ""}
      </p>
    </div>
  );
}

export function ContactForm() {
  const [values, setValues] = useState<ContactMessage>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base = useId();
  const id = (name: keyof ContactMessage) => `${base}-${name}`;

  function set<K extends keyof ContactMessage>(key: K, value: ContactMessage[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function aria(name: keyof ContactMessage, hint = false) {
    const describedBy = [hint && `${id(name)}-hint`, errors[name] && `${id(name)}-error`].filter(Boolean).join(" ");
    return {
      id: id(name),
      name,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy || undefined,
    } as const;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof ContactMessage)[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      return;
    }
    setSubmitting(true);
    await sendContactMessage(values);
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <p className="type-display text-display-md">Message received.</p>
        <p className="mt-4 max-w-sm text-grey-600">
          Thanks, {values.name.split(" ")[0]}. We reply to every message within two working days.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setSent(false);
          }}
          className="type-label mt-8 border-b border-ink/40 pb-1 hover:border-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  const border = (name: keyof ContactMessage) => (errors[name] ? "border-accent" : "border-ink/30");

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-x-6 gap-y-4 md:grid-cols-2">
      <Field id={id("name")} label="Name" error={errors.name}>
        <input
          {...aria("name")}
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={cn(fieldClass, border("name"))}
        />
      </Field>
      <Field id={id("email")} label="Email" error={errors.email}>
        <input
          {...aria("email")}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          className={cn(fieldClass, border("email"))}
        />
      </Field>
      <Field id={id("topic")} label="Topic" error={errors.topic}>
        <select
          {...aria("topic")}
          value={values.topic}
          onChange={(e) => set("topic", e.target.value as ContactTopic)}
          className={cn(fieldClass, border("topic"), "cursor-pointer")}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      {values.topic === "order" ? (
        <Field id={id("orderNumber")} label="Order number" error={errors.orderNumber} hint="From your confirmation email.">
          <input
            {...aria("orderNumber", true)}
            type="text"
            value={values.orderNumber}
            onChange={(e) => set("orderNumber", e.target.value)}
            className={cn(fieldClass, border("orderNumber"))}
          />
        </Field>
      ) : (
        <div className="hidden md:block" />
      )}
      <div className="md:col-span-2">
        <Field id={id("message")} label="Message" error={errors.message}>
          <textarea
            {...aria("message")}
            rows={5}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={cn(fieldClass, border("message"), "resize-y")}
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <button type="submit" disabled={submitting} className={buttonClasses("solid", "w-full md:w-auto")}>
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
