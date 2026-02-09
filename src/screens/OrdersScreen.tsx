import { useEffect, useState, type FormEvent } from "react";
import { usePersona } from "../PersonaContext";
import { useOrdersBackend } from "../OrdersBackendContext";

type Order = {
  orderId: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  status?: string;
  acceptedAt?: string;
  timeInForce?: string;
  region?: string;
  acceptedAz?: string;
  processingMs?: number;
};

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const DEFAULT_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "demo-ui";

const orderEndpoint = API_BASE ? `${API_BASE}/api/orders` : "/api/orders";

const createIdempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const estFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  dateStyle: "short",
  timeStyle: "short",
});

const msFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const secondsFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatEst = (timestamp?: string) => {
  if (!timestamp) return "—";
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) return timestamp;
  return estFormatter.format(new Date(parsed));
};

const formatProcessingDuration = (value?: number) => {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }
  if (value >= 1500) {
    return `${secondsFormatter.format(value / 1000)} s`;
  }
  return `${msFormatter.format(Math.round(value))} ms`;
};

export function OrdersScreen() {
  const { activePersona } = usePersona();
  const { backend } = useOrdersBackend();
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      const response = await fetch(
        `${orderEndpoint}?limit=20&backend=${backend}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setOrders(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error("Failed to load orders", error);
      setOrdersError("Unable to load latest orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericPrice = parseFloat(price);
    const numericQuantity = parseInt(quantity, 10);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericQuantity)) {
      setStatusMessage("Enter a valid price and quantity before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("Submitting order…");
      const payload = {
        clientId: DEFAULT_CLIENT_ID,
        idempotencyKey: createIdempotencyKey(),
        userId: activePersona.userId,
        side,
        price: numericPrice,
        quantity: numericQuantity,
        timeInForce: "GTC",
      };

      const response = await fetch(`${orderEndpoint}?backend=${backend}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            `Order submit failed (${response.status} ${response.statusText})`,
        );
      }

      setStatusMessage(
        `Order accepted (#${data?.orderId ?? "pending"}) — ${payload.side} ${payload.quantity} @ ${payload.price.toFixed(
          2,
        )}`,
      );
      setPrice("");
      setQuantity("");
      loadOrders();
    } catch (error) {
      console.error("Submitting Tulip order failed", error);
      setStatusMessage(
        error instanceof Error
          ? `Order failed: ${error.message}`
          : "Order failed: unexpected error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setOrders([]);
    setOrdersError(null);
    loadOrders();
  }, [backend]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] h-full">
      <section className="rounded-panel bg-cream text-navy-900 shadow-card p-6 space-y-6">
        <header className="border-b border-slate-500/30 pb-4">
          <h2 className="font-display text-2xl uppercase tracking-wide">
            Tulip Order Pad
          </h2>
          <p className="text-sm text-slate-700">
            Simulate placing structured buy & sell orders.
          </p>
        </header>

        <form
          className="grid gap-4 rounded-3xl border border-slate-500/30 bg-white/80 px-5 py-5"
          onSubmit={handleSubmit}
          id="order-entry-form"
        >
          <div className="flex gap-3">
            {(["BUY", "SELL"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSide(option)}
                className={`flex-1 rounded-2xl px-4 py-3 font-display text-lg uppercase tracking-wide transition ${
                  side === option
                    ? option === "BUY"
                      ? "bg-tulip-green text-cream shadow-card"
                      : "bg-tulip-red text-cream shadow-card"
                    : "bg-navy-900/10 text-navy-800 border border-transparent"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 uppercase tracking-wide">
            Price
            <input
              className="rounded-2xl border border-slate-500/40 bg-cream px-4 py-3 text-2xl font-semibold text-navy-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="123.45"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              data-order-price-input
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 uppercase tracking-wide">
            Quantity
            <input
              className="rounded-2xl border border-slate-500/40 bg-cream px-4 py-3 text-2xl font-semibold text-navy-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="10"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-cream font-semibold uppercase tracking-widest shadow-card disabled:opacity-60"
            disabled={submitting}
          >
            <span role="img" aria-label="tulip">
              🌷
            </span>
            {submitting ? "Submitting…" : "Submit Order"}
          </button>
        </form>
        {statusMessage && (
          <p className="text-xs uppercase tracking-widest text-slate-600">
            {statusMessage}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wide">
              Recent orders
            </h3>
            <button
              type="button"
              onClick={loadOrders}
              className="text-xs uppercase tracking-[0.3em] text-navy-800 hover:underline disabled:opacity-50"
              disabled={loadingOrders}
            >
              Refresh
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-500/30 bg-white/90">
            <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-2 bg-navy-900/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
              <span>Captured</span>
              <span className="text-center">Side</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-500/30 text-sm">
              {loadingOrders && (
                <div className="px-4 py-4 text-center text-slate-500">
                  Loading orders…
                </div>
              )}
              {ordersError && (
                <div className="px-4 py-4 text-center text-tulip-red">
                  {ordersError}
                </div>
              )}
              {!loadingOrders && !ordersError && orders.length === 0 && (
                <div className="px-4 py-4 text-center text-slate-500">
                  No orders yet
                </div>
              )}
              {!ordersError &&
                orders.map((order) => (
                  <div key={order.orderId} className="px-4 py-3">
                    <div className="grid grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-2 items-center">
                      <span
                        className="font-semibold whitespace-nowrap"
                        title={order.acceptedAt ?? ""}
                      >
                        {formatEst(order.acceptedAt)}
                      </span>
                      <span
                        className={`font-semibold text-center ${
                          order.side === "BUY" ? "text-tulip-green" : "text-tulip-red"
                        }`}
                      >
                        {order.side}
                      </span>
                      <span>{order.quantity}</span>
                      <span>${order.price.toFixed(2)}</span>
                      <span className="flex items-center gap-2">
                        <span>{order.status ?? "ACCEPTED"}</span>
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span title={order.orderId} className="truncate max-w-[60%]">
                        ID: {order.orderId.split("-")[0]}
                      </span>
                      <span className="hidden sm:inline" title={`Region ${order.region ?? "?"}`}>
                        Region {order.region ?? "?"}
                      </span>
                      <span className="font-semibold text-navy-800 tracking-[0.15em]" title="Order processing duration">
                        Proc {formatProcessingDuration(order.processingMs)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-panel bg-navy-800 text-cream border border-navy-700 shadow-card p-6 space-y-4">
          <h3 className="font-display text-lg uppercase tracking-wide">
            Trade tape
          </h3>
          <p className="text-sm text-cream/70">
            Phase 1 uses simulated fills; trade tape will appear once fills are
            emitted by the simulator.
          </p>
        </section>
      </aside>
    </div>
  );
}
