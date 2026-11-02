/**
 * Contact boundary. Currently logs only; replace the body with an email
 * provider, helpdesk API or server action when one is chosen.
 */
export const CONTACT_TOPICS = [
  { value: "order", label: "An order" },
  { value: "product", label: "Sizing or product" },
  { value: "wholesale", label: "Wholesale" },
  { value: "press", label: "Press" },
  { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export interface ContactMessage {
  name: string;
  email: string;
  topic: ContactTopic;
  orderNumber?: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactMessage, string>>;

export function validateContact(input: ContactMessage): ContactErrors {
  const errors: ContactErrors = {};
  if (input.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }
  if (!CONTACT_TOPICS.some((t) => t.value === input.topic)) errors.topic = "Choose a topic.";
  if (input.topic === "order" && !input.orderNumber?.trim()) {
    errors.orderNumber = "Enter your order number so we can find it.";
  }
  if (input.message.trim().length < 10) errors.message = "Tell us a little more (10 characters minimum).";
  return errors;
}

export async function sendContactMessage(input: ContactMessage): Promise<{ ok: true }> {
  console.info("[contact] message (stub)", input);
  return { ok: true };
}
