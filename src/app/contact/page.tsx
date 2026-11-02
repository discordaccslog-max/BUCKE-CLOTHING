import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, sizing, wholesale or press. Get in touch with the Bucke studio.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page grid gap-16 pt-16 pb-24 md:grid-cols-12 md:gap-6 md:pt-28 md:pb-36">
      <header className="md:col-span-4">
        <p className="type-label animate-rise text-grey-600">Contact</p>
        <h1 className="type-display mt-5 animate-rise text-display-xl [animation-delay:80ms]">
          Talk to the studio.
        </h1>
        <dl className="mt-12 space-y-6 text-sm">
          <div>
            <dt className="type-label text-grey-600">Email</dt>
            <dd className="mt-2">
              <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-accent">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="type-label text-grey-600">Response time</dt>
            <dd className="mt-2">Within two working days.</dd>
          </div>
        </dl>
      </header>
      <section aria-label="Contact form" className="md:col-span-7 md:col-start-6 md:pt-24">
        <ContactForm />
      </section>
    </div>
  );
}
