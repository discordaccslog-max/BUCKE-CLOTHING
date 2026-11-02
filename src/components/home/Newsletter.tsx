"use client";

import { useId, useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import { EMAIL_PATTERN, subscribeToNewsletter } from "@/lib/newsletter";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "done" };

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputId = useId();
  const messageId = useId();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ kind: "error", message: "Enter a valid email address, like name@example.com." });
      return;
    }
    const result = await subscribeToNewsletter(value);
    setStatus(result.ok ? { kind: "done" } : { kind: "error", message: result.message });
  }

  const invalid = status.kind === "error";

  return (
    <section aria-labelledby="newsletter-title" className="bg-grey-100">
      <div className="container-page grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <Reveal className="md:col-span-6">
          <p className="type-label text-grey-600">Newsletter</p>
          <h2 id="newsletter-title" className="type-display mt-3 text-display-lg">
            Letters from the studio.
          </h2>
          <p className="mt-5 max-w-sm text-grey-600">
            New drops, restocks and the occasional field note. Nothing else.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-5 md:col-start-8 md:self-end">
          {status.kind === "done" ? (
            <p role="status" className="type-display text-display-md">
              You&apos;re on the list.
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor={inputId} className="type-label text-grey-600">
                Email address
              </label>
              <div
                className={cn(
                  "mt-3 flex border-b transition-[border-color,box-shadow] focus-within:border-ink focus-within:shadow-[0_1px_0_0_var(--color-ink)]",
                  invalid ? "border-accent" : "border-ink/40",
                )}
              >
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (invalid) setStatus({ kind: "idle" });
                  }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? messageId : undefined}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent py-3 text-lg placeholder:text-grey-600 focus:outline-none"
                />
                <button type="submit" className="type-label shrink-0 px-2 py-3 hover:text-accent">
                  Subscribe
                </button>
              </div>
              <p id={messageId} role="alert" className="mt-3 min-h-5 text-sm text-accent">
                {invalid ? status.message : ""}
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
