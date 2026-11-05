/**
 * Payment marks as small inline SVG cards. Brand colours are data here
 * (each network's own colour), not part of the site palette.
 */
type Method = "mastercard" | "amex" | "applepay" | "googlepay" | "shoppay" | "discover" | "visa";

const LABELS: Record<Method, string> = {
  mastercard: "Mastercard",
  amex: "American Express",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  shoppay: "Shop Pay",
  discover: "Discover",
  visa: "Visa",
};

function Card({ children, fill = "#fff" }: { children: React.ReactNode; fill?: string }) {
  return (
    <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="37" height="23" rx="3" fill={fill} stroke="#d9d4cb" />
      {children}
    </svg>
  );
}

const text = { fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 } as const;

function Mark({ method }: { method: Method }) {
  switch (method) {
    case "mastercard":
      return (
        <Card>
          <circle cx="15" cy="12" r="6.5" fill="#eb001b" />
          <circle cx="23" cy="12" r="6.5" fill="#f79e1b" />
          <path d="M19 6.9a6.5 6.5 0 0 1 0 10.2 6.5 6.5 0 0 1 0-10.2Z" fill="#ff5f00" />
        </Card>
      );
    case "amex":
      return (
        <Card fill="#1f72cd">
          <text x="19" y="15.5" textAnchor="middle" fontSize="8" fill="#fff" style={text}>
            AMEX
          </text>
        </Card>
      );
    case "applepay":
      return (
        <Card>
          <text x="19" y="15.5" textAnchor="middle" fontSize="7.5" fill="#000" style={text}>
            Apple Pay
          </text>
        </Card>
      );
    case "googlepay":
      return (
        <Card>
          <text x="19" y="15.5" textAnchor="middle" fontSize="8" style={text}>
            <tspan fill="#4285f4">G</tspan>
            <tspan fill="#5f6368"> Pay</tspan>
          </text>
        </Card>
      );
    case "shoppay":
      return (
        <Card fill="#5a31f4">
          <text x="19" y="15.5" textAnchor="middle" fontSize="7.5" fill="#fff" style={text}>
            shop Pay
          </text>
        </Card>
      );
    case "discover":
      return (
        <Card>
          <text x="16" y="14.8" textAnchor="middle" fontSize="5.6" fill="#231f20" style={text}>
            DISCOVER
          </text>
          <circle cx="31" cy="12.8" r="2.6" fill="#f48120" />
        </Card>
      );
    case "visa":
      return (
        <Card>
          <text x="19" y="16" textAnchor="middle" fontSize="10" fill="#1a1f71" style={{ ...text, fontStyle: "italic" }}>
            VISA
          </text>
        </Card>
      );
  }
}

export function PaymentIcons({ methods }: { methods: readonly Method[] }) {
  if (methods.length === 0) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Payment methods">
      {methods.map((m) => (
        <li key={m} title={LABELS[m]}>
          <Mark method={m} />
          <span className="sr-only">{LABELS[m]}</span>
        </li>
      ))}
    </ul>
  );
}
