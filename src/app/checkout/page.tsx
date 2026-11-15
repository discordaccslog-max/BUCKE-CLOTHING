import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout — Bucke" };

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-16 md:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 font-display text-display-md text-ink">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}
